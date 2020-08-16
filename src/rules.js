const Utils = require('./utils');

const Rules = {};

const isValid = (farm, action) => {
  return farm
    && action.row >= 0 && action.row < farm.rows
    && action.col >= 0 && action.col < farm.cols;
};

const canHoe = (farm, action) => {
  if (!isValid(farm, action)) {
    return false;
  }

  if (!farm.land[action.row][action.col].includes('till')) {
    return true;
  }

  return false;
};

const hoe = (farm, action) => {
  if (!canHoe(farm, action)) {
    return farm;
  }

  farm.land[action.row][action.col].push('till');

  return farm;
};

Rules.play = (farm, action) => {
  const copy = Utils.clone(farm);

  switch (action.tool) {
    case 'hoe':
      return hoe(copy, action);

    default:
      return copy;
  }
};

module.exports = Rules;
