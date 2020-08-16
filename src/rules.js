const Utils = require('./utils');

const Rules = {};

const isValid = (farm, action) => {
  return farm
    && action.row >= 0 && action.row < farm.rows
    && action.col >= 0 && action.col < farm.cols;
};

const canHoe = (farm, action) => {
  if (!isValid(farm, action) || action.tool !== 'hoe') {
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

const canWater = (farm, action) => {
  if (!isValid(farm, action) || action.tool !== 'water') {
    return false;
  }

  if (!farm.land[action.row][action.col].includes('water')) {
    return true;
  }

  return false;
};

const water = (farm, action) => {
  if (!canWater(farm, action)) {
    return farm;
  }

  farm.land[action.row][action.col].push('water');

  return farm;
};

Rules.play = (farm, action) => {
  const copy = Utils.clone(farm);

  switch (action.tool) {
    case 'hoe':
      return hoe(copy, action);

    case 'water':
      return water(copy, action);

    default:
      return copy;
  }
};

module.exports = Rules;
