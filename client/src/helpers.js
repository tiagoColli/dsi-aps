const fs = require('node:fs');

function getRandAlg() {
  return ['cgne', 'cgnr'][Math.floor(Math.random() * 2)];
}

function randonTimeout() {
  return Math.floor(Math.random() * 2000) + Math.floor(Math.random() * 2000);
}

function splitSignal(signal) {
  const chunkSize = Math.ceil(signal.length / 5);
  const chunks = [];

  for (let i = 0; i < signal.length; i += chunkSize) {
    chunks.push(signal.slice(i, i + chunkSize));
  }

  return chunks;
}

function signalGain(signal, S, N) {
  const out = signal.slice();
  for (let c = 0; c < N; c++) {
    for (let i = 0; i < S; i++) {
      const idx = i + c * S;
      const Yi = 100 + (1 / 20) * i * Math.sqrt(i);
      out[idx] = out[idx] * Yi;
    }
  }
  return out;
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

module.exports = {
  getRandAlg,
  randonTimeout,
  splitSignal,
  signalGain,
  openFiles
}; 
