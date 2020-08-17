const Utils = require('./utils');
const PRNG = require('./prng');
const Farm = require('./farm');

const RANDOM_TICK_SPEED = 3;
const DAY_LENGTH_IN_SECONDS = 20;

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

  const now = action.timestamp ? action.timestamp : Utils.timestamp();

  for (let rts = 0; rts < RANDOM_TICK_SPEED; rts += 1) {
    const [row, col] = plots[rts];
    const dehydrateAction = {
      tool: 'dehydrate',
      row,
      col,
      timestamp: now,
    };

    if (shouldDehydrate(farm, dehydrateAction)) {
      farm = Rules.play(farm, dehydrateAction);
    }

    const growAction = {
      tool: 'grow',
      row,
      col,
      timestamp: now,
    };

    if (shouldGrow(farm, growAction)) {
      farm = Rules.play(farm, growAction);
    }
  }

  return farm;
};

const isValid = (farm, action) => {
  return farm
    && action.row >= 0 && action.row < farm.rows
    && action.col >= 0 && action.col < farm.cols;
};

const getType = (farm, action, type) => {
  if (!isValid(farm, action)) {
    return undefined;
  }

  return farm.land[action.row][action.col].find((state) => state.type === type);
};

const hasType = (farm, action, type) => !!getType(farm, action, type);

const removeType = (farm, action, type) => {
  farm.land[action.row][action.col] =
    farm.land[action.row][action.col].filter((state) => state.type !== type);
};

const getAdjacent = (farm, action) => {
  if (isValid(farm, action)) {
    const row = action.row;
    const col = action.col;

    return [{
      row: row - 1 ,
      col: col - 1,
    }, {
      row: row - 1 ,
      col: col + 0,
    }, {
      row: row - 1 ,
      col: col + 1,
    }, {
      row: row - 0 ,
      col: col - 1,
    }, {
      row: row - 0 ,
      col: col + 1,
    }, {
      row: row + 1 ,
      col: col - 1,
    }, {
      row: row + 1 ,
      col: col + 0,
    }, {
      row: row + 1 ,
      col: col + 1,
    }]
    .filter((action) => isValid(farm, action));
  }

  return [];
};

const shouldDehydrate = (farm, action) => {
  if (!isValid(farm, action) || action.tool !== 'dehydrate') {
    return false;
  }

  const water = getType(farm, action, 'water');

  if (!water) {
    return false;
  }

  const wateredFor = (action.timestamp - water.timestamp) / 1000;
  const chance = Math.floor(wateredFor / DAY_LENGTH_IN_SECONDS) * 0.01;

  return PRNG.random() < chance;
};

const canDehydrate = (farm, action) => {
  if (!isValid(farm, action) || action.tool !== 'dehydrate') {
    return false;
  }

  return true;
};

const dehydrate = (farm, action) => {
  if (canDehydrate(farm, action)) {
    removeType(farm, action, 'water');
  }

  return farm;
};

const shouldGrow = (farm, action) => {
  if (!isValid(farm, action) || action.tool !== 'grow') {
    return false;
  }

  if (hasType(farm, action, 'plant')) {
    const points = hasType(farm, action, 'water') ? 4 : 2;
    const chance = 1 / (Math.floor(25 / points) + 1);

    return PRNG.random() < chance;
  }

  return false;
};

Rules.play = (farm, action) => {
  const copy = Utils.clone(farm);
  const newAction = Utils.clone(action);

  if (!newAction.timestamp) {
    newAction.timestamp = Utils.timestamp();
  }

  switch (action.tool) {
    case 'update':
      return update(copy, newAction);

    case 'dehydrate':
      return dehydrate(copy, newAction);

    default:
      return Farm.dispatch(copy, newAction);
  }
};

module.exports = Rules;
