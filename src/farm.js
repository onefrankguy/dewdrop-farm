const Utils = require('./utils');

const MIN_CROP_STAGE = 1;
const MAX_CROP_STAGE = 5;

const Farm = {};

const valid = (farm, {row, col}) =>
  farm
  && row >= 0 && row < farm.rows
  && col >= 0 && col < farm.cols;

const getLand = (farm, {row, col}, someType) =>
  farm.land[row][col].find(({type}) => type === someType);

const hasLand = (farm, action, someType) => !!getLand(farm, action, someType);

const addLand = (farm, {row, col, timestamp, crop, stage}, someType) => {
  const land = {
    type: someType,
    timestamp,
  };

  if (crop) {
    land.crop = crop;
    land.stage = stage || MIN_CROP_STAGE;
  }

  farm.land[row][col].push(land);
};

const removeLand = (farm, {row, col}, someType) =>
  farm.land[row][col] = farm.land[row][col].filter(({type}) => type !== someType);

const update = (farm) => {
  farm.updates += 1;

  return farm;
};

const hoe = (farm, action) => {
  if (hasLand(farm, action, 'plant')) {
    removeLand(farm, action, 'plant');
  }

  if (!hasLand(farm, action, 'till')) {
    addLand(farm, action, 'till');
  }

  return farm;
};

const water = (farm, action) => {
  removeLand(farm, action, 'water');
  addLand(farm, action, 'water');

  return farm;
};

const drain = (farm, action) => {
  removeLand(farm, action, 'water');

  return farm;
};

const plant = (farm, action) => {
  if (hasLand(farm, action, 'till') && !hasLand(farm, action, 'plant')) {
    addLand(farm, action, 'plant');
  }

  return farm;
};

const grow = (farm, action) => {
  const plant = getLand(farm, action, 'plant');

  if (plant && plant.stage < MAX_CROP_STAGE) {
    action.crop = plant.crop;
    action.stage = plant.stage + 1;
    action.timestamp = plant.timestamp;

    removeLand(farm, action, 'plant');
    addLand(farm, action, 'plant');
  }

  return farm;
};

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
    updates: 0,
    rows,
    cols,
    land,
  };
};

Farm.dispatch = (farm, action) => {
  const farmCopy = Utils.clone(farm);
  const actionCopy = Utils.clone(action);

  if (!valid(farmCopy, actionCopy)) {
    return farmCopy;
  }

  switch (actionCopy.tool) {
    case 'update':
      return update(farmCopy, actionCopy);

    case 'hoe':
      return hoe(farmCopy, actionCopy);

    case 'water':
      return water(farmCopy, actionCopy);

    case 'drain':
      return drain(farmCopy, actionCopy);

    case 'plant':
      return plant(farmCopy, actionCopy);

    case 'grow':
      return grow(farmCopy, actionCopy);

    default:
      return farmCopy;
  }
};

Farm.plots = (farm) => {
  const result = [];

  for (let row = 0; row < farm.rows; row += 1) {
    for (let col = 0; col < farm.cols; col += 1) {
      result.push({row, col});
    }
  }

  return result;
};

Farm.wateredFor = (farm, action) => {
  const water = getLand(farm, action, 'water');

  if (!water) {
    return 0;
  }

  if (!action.timestamp) {
    return water.timestamp;
  }

  return action.timestamp - water.timestamp;
};

module.exports = Farm;
