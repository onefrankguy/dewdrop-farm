const Utils = require('./utils');
const PRNG = require('./prng');

const RANDOM_TICK_SPEED = 3;

const Rules = {};

const update = (farm, action) => {
  if (!farm || action.tool !== 'update') {
    return farm;
  }

  let plots = [];

  for (let row = 0; row < farm.rows; row += 1) {
    for (let col = 0; col < farm.cols; col += 1) {
      plots.push([row, col]);
    }
  }

  plots = PRNG.shuffle(plots);

  for (let rts = 0; rts < RANDOM_TICK_SPEED; rts += 1) {
    console.log('random tick', plots[rts]);

    const [row, col] = plots[rts];
    const action = {
      tool: 'dehydrate',
      row,
      col,
    };

    if (shouldDehydrate(farm, action)) {
      farm = Rules.play(farm, action);
    }
  }

  return farm;
};

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

const shouldDehydrate = (farm, action) => {
  if (!isValid(farm, action) || action.tool !== 'dehydrate') {
    return false;
  }

  let points = 4;
  const chance = 1 / (Math.floor(25 / points) + 1);

  return PRNG.random() < chance;
};

const canDehydrate = (farm, action) => {
  if (!isValid(farm, action) || action.tool !== 'dehydrate') {
    return false;
  }

  return true;
};

const dehydrate = (farm, action) => {
  if (!canDehydrate(farm, action)) {
    return farm;
  }

  farm.land[action.row][action.col] =
    farm.land[action.row][action.col].filter((value) => value !== 'water');

  return farm;
};

Rules.play = (farm, action) => {
  const copy = Utils.clone(farm);

  switch (action.tool) {
    case 'update':
      return update(copy, action);

    case 'hoe':
      return hoe(copy, action);

    case 'water':
      return water(copy, action);

    case 'dehydrate':
      return dehydrate(copy, action);

    default:
      return copy;
  }
};

module.exports = Rules;
