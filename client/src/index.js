const path = require('path');
const axios = require('axios');
const SIGNAL_SEED = require('./signalSeed');
const { getRandAlg, randonTimeout, splitSignal, signalGain, openFiles } = require('./helpers');

const SERVER_URL = process.env.SERVER_URL;
const SIGNALS = SIGNAL_SEED;
const TOTAL_IMAGES = 15;

async function seedUsers() {
  const users = {}
  for (let i = 0; i < TOTAL_IMAGES; i++) {
    const uniqueSuffix = Date.now() + '-' + Math.floor(Math.random() * 10000);
    const name = `user_${uniqueSuffix}`;
    const userId = await createUser(name);

    let signal = await pickRandomSignal();
    signal = await buildUserSignal(signal);

    users[userId] = signal;
  }

  return users;
}

async function createUser(name) {
  try {
    const response = await axios.post(`${SERVER_URL}/users`, { name });
    return response.data.id
  } catch (error) {
    console.error('Error: ', error.message);
  }
}

async function buildUserSignal(signal) {
  const originalSignal = await openFiles(signal.filePath);
  const signalArray = signalGain(originalSignal, signal.S, signal.N)
  const signalChunks = splitSignal(signalArray)
  signal.signalArray = signalChunks
  return signal
}

async function pickRandomSignal() {
  const keys = Object.keys(SIGNALS);
  const randomIndex = keys.length * Math.random() << 0;
  const originalSignal = SIGNALS[keys[randomIndex]];
  const signalCopy = {
    ...originalSignal,
    signalArray: []
  };
  return signalCopy;
}

async function sendSignal(body) {
  try {
    const response = await axios.post(`${SERVER_URL}/images`, body);
    return response
  } catch (error) {
    console.error('Error: ', error.message);
  }
}

function pickRandomUser(users) {
  const randomKey = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)];
  return randomKey;
}

async function sendSignalPiece(userId, signal, signalPiece, isLastPiece) {
  const body = {
    user_id: userId,
    algorithm: getRandAlg(),
    model: signal.model,
    size: signal.size,
    image_identifier: signal.name + userId,
    start_reconstruction: isLastPiece,
    signal: signalPiece
  };

  await sendSignal(body);
  console.log(`Signal piece sent for ${signal.name} (user: ${userId})`);
}

async function processUsers(users) {
  while (Object.keys(users).length > 0) {
    const userId = pickRandomUser(users);
    const signal = users[userId];
    const isLastPiece = signal.signalArray.length === 1;
    const signalPiece = signal.signalArray.splice(0, 1)[0];

    if (!signalPiece) {
      console.log(`Finished sending pieces for ${signal.name} (user: ${userId})`);
      delete users[userId];
      continue;
    }

    await sendSignalPiece(userId, signal, signalPiece, isLastPiece);

    if (isLastPiece) {
      delete users[userId];
      console.log(`Finished sending pieces for ${signal.name} (user: ${userId})`);
    }

    await new Promise(resolve => setTimeout(resolve, randonTimeout()));
  }

  console.log("Finished all users");
}

async function run() {
  const users = await seedUsers()
  await processUsers(users)
}

run()
