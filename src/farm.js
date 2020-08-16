const Utils = require('./utils');

const Farm = {};

Farm.create = () => {
  const now = Utils.timestamp();
  const rows = 6;
  const cols = 6;
  const land = [];

  for (let row = 0; row < rows; row += 1) {
    land[row] = [];

    for (let col = 0; col < cols; col += 1) {
      land[row][col] = [{
        type: 'plot',
        timestamp: now,
      }];
    }
  }

  return {
    rows,
    cols,
    land,
  };
};

module.exports = Farm;
