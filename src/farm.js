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

const addLand = (farm, {row, col, crop, stage, time}, someType) => {
  const land = {
    type: someType,
    time: time || farm.time,
  };

  if (crop) {
    land.crop = crop;
    land.stage = stage || MIN_CROP_STAGE;
  }

  farm.land[row][col].push(land);
};

const removeLand = (farm, {row, col}, someType) =>
  farm.land[row][col] = farm.land[row][col].filter(({type}) => type !== someType);

const update = (farm, action) => {
  farm.time += action.dt;

  return farm;
};

const hoe = (farm, action) => {
  const plant = getLand(farm, action, 'plant');
  if (plant) {
    removeLand(farm, action, 'plant');
    if (plant.stage >= MAX_CROP_STAGE) {
      if (!farm.market[plant.crop]) {
        farm.market[plant.crop] = 0;
      }
      farm.market[plant.crop] += 1;
    }
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
    action.time = plant.time;

    removeLand(farm, action, 'plant');
    addLand(farm, action, 'plant');
  }

  return farm;
};

Farm.create = () => {
  const time = 0;
  const rows = 6;
  const cols = 6;
  const land = [];
  const market = {};

  for (let row = 0; row < rows; row += 1) {
    land[row] = [];

    for (let col = 0; col < cols; col += 1) {
      land[row][col] = [{
        type: 'plot',
        time,
      }];
    }
  }

  return {
    time,
    rows,
    cols,
    land,
    market,
  };
};

Farm.dispatch = (farm, action) => {
  const actionCopy = Utils.clone(action);
  const farmCopy = Utils.clone(farm);

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

Farm.crop = (farm, action) => getLand(farm, action, 'plant');

Farm.watered = (farm, action) => getLand(farm, action, 'water');

module.exports = Farm;
