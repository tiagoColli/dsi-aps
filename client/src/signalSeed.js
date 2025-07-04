const path = require('path');


const SIGNAL_SEED = [
  {
    name: 'g1',
    filePath: path.join('resources', 'G-1.csv'),
    size: 60,
    model: 'H-1',
    S: 794,
    N: 64
  },
  {
    name: 'g2',
    filePath: path.join('resources', 'G-2.csv'),
    size: 60,
    model: 'H-1',
    S: 794,
    N: 64
  },
  {
    name: 'g3',
    filePath: path.join('resources', 'G-3.csv'),
    size: 60,
    model: 'H-1',
    S: 794,
    N: 64
  },
  {
    name: 'g4',
    filePath: path.join('resources', 'G-4.csv'),
    size: 30,
    model: 'H-2',
    S: 436,
    N: 64
  },
  {
    name: 'g5',
    filePath: path.join('resources', 'G-5.csv'),
    size: 30,
    model: 'H-2',
    S: 436,
    N: 64
  },
  {
    name: 'g6',
    filePath: path.join('resources', 'G-6.csv'),
    size: 30,
    model: 'H-2',
    S: 436,
    N: 64
  }
];

module.exports = SIGNAL_SEED; 
