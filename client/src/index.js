const fs = require('node:fs');
const path = require('path');
const axios = require('axios');


const SERVER_URL = process.env.SERVER_URL;

function getRandAlg() {
    return ['cgne', 'cgnr'][Math.floor(Math.random() * 2)]
}

function getRandomSignal(signals) {
    const keys = Object.keys(signals);
    const randomIndex = Math.floor(Math.random() * keys.length);
    const randomKey = keys[randomIndex];
    const randomValue = signals[randomKey];

    return randomValue
}

function signalGain(signal, s, n) {
    for (let c = 1; c < n; c++) {
        for (let l = 1; l < s; l++) {
            y = 100 + 1 / 20 * l * Math.sqrt(l)
            signal[l * c] = signal[l * c] * y
        }
    }

    return splitSignal(signal)
}

function openFiles(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            const results = data
                .split('\n')
                .filter(line => line.trim() !== '')
                .map(Number);

            resolve(results);
        });
    });
}

async function getSignals() {
    const g1 = await openFiles(path.join('resources', 'G-1.csv'), 'utf8');
    // const g2 = await openFiles(path.join('resources', 'G-2.csv'), 'utf8');
    // const g3 = await openFiles(path.join('resources', 'G-3.csv'), 'utf8');
    // const g4 = await openFiles(path.join('resources', 'G-4.csv'), 'utf8');
    // const g5 = await openFiles(path.join('resources', 'G-5.csv'), 'utf8');
    // const g6 = await openFiles(path.join('resources', 'G-6.csv'), 'utf8');

    const userg1 = await createUser("g1")
    // const userg2 = await createUser("g2")
    // const userg3 = await createUser("g3")
    // const userg4 = await createUser("g4")
    // const userg5 = await createUser("g5")
    // const userg6 = await createUser("g6")

    signals = {
        g1: { name: 'g1', signalArray: signalGain(g1, 794, 64), size: 60, user_id: userg1, model: 'H-1' },
        // g2: { name: 'g2', signalArray: signalGain(g2, 794, 64), size: 60, user_id: userg2, model: 'H-1' },
        // g3: { name: 'g3', signalArray: signalGain(g3, 794, 64), size: 60, user_id: userg3, model: 'H-1' },
        // g4: { name: 'g4', signalArray: signalGain(g4, 794, 64), size: 30, user_id: userg4, model: 'H-2' },
        // g5: { name: 'g5', signalArray: signalGain(g5, 794, 64), size: 30, user_id: userg5, model: 'H-2' },
        // g6: { name: 'g6', signalArray: signalGain(g6, 794, 64), size: 30, user_id: userg6, model: 'H-2' },
    }

    return signals
}

function splitSignal(signal) {
    const chunkSize = Math.ceil(signal.length / 5);

    const chunks = [];

    for (let i = 0; i < signal.length; i += chunkSize) {
        chunks.push(signal.slice(i, i + chunkSize));
    }

    return chunks;
}

async function createUser(signalName) {
    try {
        const response = await axios.post(`${SERVER_URL}/users`, { name: signalName });
        return response.data.id
    } catch (error) {
        console.error('Error: ', error.message);
    }
}

async function sendSignal(body) {
    try {
        const response = await axios.post(`${SERVER_URL}/images`, body);
        return response
    } catch (error) {
        console.error('Error: ', error.message);
    }
}

async function callImage(signals) {
    const signal = getRandomSignal(signals)

    const isLastPiece = signal.signalArray.length == 1
    const signalPiece = signal.signalArray.splice(0, 1)

    const body = {
        user_id: signal.user_id,
        algorithm: 'cgne',
        model: signal.model,
        size: signal.size,
        image_identifier: signal.name,
        start_reconstruction: isLastPiece,
        signal: signalPiece[0]
    }

    if (isLastPiece) delete signals[signal.name]

    await sendSignal(body)

    if (Object.keys(signals).length > 0) {
        setTimeout(() => {
            callImage(signals);
        }, "2000");
    }
}

async function run() {
    const signals = await getSignals()

    callImage(signals)
}

run()

