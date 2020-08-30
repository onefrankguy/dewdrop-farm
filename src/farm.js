const Utils = require('./utils');
const Crops = require('./crops');
const PRNG = require('./prng');

const MIN_CROP_STAGE = 1;
const MAX_CROP_STAGE = 5;
const MAX_INVENTORY_SIZE = 4;
const MAX_STACK_SIZE = 16;

const SEASONS = ['summer', 'fall', 'winter', 'spring'];
const DAYS_PER_SEASON = 28;
const SECONDS_PER_DAY = (14 * 60 * 3) / SEASONS.length / DAYS_PER_SEASON;

const Farm = {};

const valid = (farm, {row, col}) =>
  farm
  && row >= 0 && row < farm.rows
  && col >= 0 && col < farm.cols;

const getDistance = (plot1, plot2) => {
  const dx = plot2.col - plot1.col;
  const dy = plot2.row - plot1.row;

  return Math.abs(dx) + Math.abs(dy);
};

const isEdge = (farm) => ({row, col}) =>
  row <= 0 || row >= farm.rows - 1 || col <= 0 || col >= farm.cols - 1;

const isNotEdge = (farm) => ({row, col}) =>
  row > 0 && row < farm.rows - 1 && col > 0 && col < farm.rows - 1;

const getPlots = (farm) => {
  const result = [];

  for (let row = 0; row < farm.rows; row += 1) {
    for (let col = 0; col < farm.cols; col += 1) {
      result.push({row, col});
    }
  }

  return result;
};

const getEdges = (farm) => getPlots(farm).filter(isEdge(farm));

const getLand = (farm, {row, col}, type) => {
  if (valid(farm, {row, col}) && farm.land[row][col][type]) {
    return {
      ...farm.land[row][col][type],
      type,
      row,
      col,
    };
  }

  return undefined;
};

const hasLand = (farm, action, type) => !!getLand(farm, action, type);

const addLand = (farm, {row, col, crop, stage, time, regrow, rotate}, type) => {
  const land = {
    time: time || farm.time,
  };

  if (rotate) {
    land.rotate = rotate;
  }

  if (crop) {
    land.crop = crop;
    land.stage = stage || MIN_CROP_STAGE;
    land.regrow = regrow;
  }

  farm.land[row][col][type] = land;
};

const removeLand = (farm, {row, col}, type) =>
  delete farm.land[row][col][type];

const getBunny = (farm) => {
  const plots = getPlots(farm);
  const action = plots.find((plot) => hasLand(farm, plot, 'bunny'));

  return action ? getLand(farm, action, 'bunny') : undefined;
};

const enqueue = (farm, action) => {
  farm.actions.push(action);

  return farm;
};

const update = (farm, action) => {
  const actions = farm.actions.slice().filter(({tool}) => tool !== 'update');
  farm.actions = [];

  actions.forEach((action) => {
    farm = Farm.dispatch(farm, action);
  });

  farm.time += action.dt;
  farm.bunny -= action.dt;

  const bunnyAction = {
    tool: 'bunny',
    row: 0,
    col: 0,
  };

  farm = enqueue(farm, bunnyAction);

  const hopAction = {
    tool: 'hop',
    row: 0,
    col: 0,
  };

  farm = enqueue(farm, hopAction);

  return farm;
};

const harvest = (farm, action) => {
  const plant = getLand(farm, action, 'plant');

  if (plant && plant.crop !== 'sprinkler') {
    if (plant.stage >= MAX_CROP_STAGE) {
      removeLand(farm, action, 'plant');

      if (!farm.market[plant.crop]) {
        farm.market[plant.crop] = 0;
      }
      farm.market[plant.crop] += 1;

      const info = Crops.info(plant.crop);

      if (info.regrow) {
        const plantAction = {
          type: 'plant',
          row: action.row,
          col: action.col,
          crop: plant.crop,
          regrow: info.regrow,
          stage: MAX_CROP_STAGE - 1,
        };

        addLand(farm, plantAction, 'plant');
      }
    }
  }

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

  removeLand(farm, action, 'till');
  addLand(farm, action, 'till');

  const pokeAction = {
    ...action,
    tool: 'poke',
  };

  farm = enqueue(farm, pokeAction);

  return farm;
};

const grass = (farm, action) => {
  if (!hasLand(farm, action, 'plant')) {
    removeLand(farm, action, 'till');
  }

  return farm;
};

const water = (farm, action) => {
  const watered = getLand(farm, action, 'water');
  const rotate = (watered && watered.rotate) ? watered.rotate : PRNG.shuffle([90, 180, 270, 360])[0];

  action.rotate = rotate;

  removeLand(farm, action, 'water');
  addLand(farm, action, 'water');

  const pokeAction = {
    tool: 'poke',
    row: action.row,
    col: action.col,
  };

  farm = enqueue(farm, pokeAction);

  return farm;
};

const sprinkler = (farm, action) => {
  const crop = Farm.crop(farm, action);

  if (crop && crop.crop === 'sprinkler') {
    const {row, col} = action;
    const plots = [{
      row,
      col,
    }, {
      row: row - 1,
      col: col + 0,
    }, {
      row: row + 1,
      col: col + 0,
    }, {
      row: row + 0,
      col: col - 1,
    }, {
      row: row + 0,
      col: col + 1,
    }];

    plots.forEach(({row, col}) => {
      const waterAction = {
        tool: 'water',
        row,
        col,
      };

      farm = enqueue(farm, waterAction);
    });
  }

  return farm;
};

const drain = (farm, action) => {
  removeLand(farm, action, 'water');

  return farm;
};

const plant = (farm, action) => {
  if (hasLand(farm, action, 'till') && !hasLand(farm, action, 'plant')) {
    let crop = farm.inventory[action.slot];

    if (crop && crop.amount > 0) {
      action.type = 'plant';
      action.crop = crop.type;

      crop.amount -= 1;
      if (crop.amount <= 0) {
        crop = undefined;
      }

      farm.inventory[action.slot] = crop;

      addLand(farm, action, 'plant');
    }
  }

  const pokeAction = {
    ...action,
    tool: 'poke',
  };

  farm = enqueue(farm, pokeAction);

  const harvestAction = {
    ...action,
    tool: 'harvest',
  };

  farm = enqueue(farm, harvestAction);

  return farm;
};

const grow = (farm, action) => {
  const plant = getLand(farm, action, 'plant');

  if (!plant || plant.stage >= MAX_CROP_STAGE) {
    return farm;
  }

  const info = Crops.info(plant.crop);
  const season = Farm.season(farm);

  if (!info.seasons.includes(season)) {
    return farm;
  }

  action.crop = plant.crop;
  action.stage = plant.stage + 1;
  action.time = plant.time;

  removeLand(farm, action, 'plant');
  addLand(farm, action, 'plant');

  return farm;
};

const buy = (farm, action) => {
  const crop = Crops.info(action.crop);

  if (farm.cash < crop.prices.seed) {
    return farm;
  }

  let slotIndex = farm.inventory.findIndex((slot) => {
    return slot && slot.type === crop.type && slot.amount < MAX_STACK_SIZE;
  });

  if (slotIndex < 0) {
    slotIndex = farm.inventory.findIndex((slot) => !slot);
  }

  if (slotIndex >= 0 && slotIndex < MAX_INVENTORY_SIZE) {
    if (!farm.inventory[slotIndex]) {
      farm.inventory[slotIndex] = {
        type: crop.type,
        amount: 0,
      };
    }

    if (farm.inventory[slotIndex].amount < MAX_STACK_SIZE) {
      farm.cash -= crop.prices.seed;
      farm.inventory[slotIndex].amount += 1;
    }
  }

  return farm;
};

const sell = (farm, action) => {
  if (farm.market[action.crop]) {
    const cash = Crops.info(action.crop).prices.crop;

    farm.market[action.crop] -= 1;
    farm.cash += cash;

    if (!farm.market[action.crop]) {
      farm.market[action.crop] = undefined;
    }
  }

  return farm;
};

const bunny = (farm) => {
  const action = getBunny(farm);

  if (!action && farm.bunny <= 0) {
    const plots = PRNG.shuffle(getPlots(farm).filter(isNotEdge(farm)));

    addLand(farm, plots[0], 'bunny');
  }

  return farm;
};

const move = (farm, action) => {
  const rabbit = getBunny(farm);

  if (rabbit) {
    removeLand(farm, rabbit, 'bunny');
    addLand(farm, action, 'bunny');

    const crop = Farm.crop(farm, action);

    if (crop && crop.crop !== 'sprinkler') {
      removeLand(farm, action, 'plant');
    }
  }

  return farm;
};

const hop = (farm) => {
  const action = getBunny(farm);

  if (action) {
    const day = Math.ceil(farm.time / SECONDS_PER_DAY);
    const lastHop = Math.ceil(action.time / SECONDS_PER_DAY);
    const duration = day - lastHop;

    if (duration > 0) {
      const {row, col} = action;

      const possible = PRNG.shuffle([{
        row: row + 1,
        col: col + 0,
      }, {
        row: row - 1,
        col: col + 0,
      }, {
        row: row + 0,
        col: col + 1,
      }, {
        row: row + 0,
        col: col - 1,
      }]
      .filter((plot) => valid(farm, plot)));

      const moveAction = {
        tool: 'move',
        ...possible[0],
      };

      farm = enqueue(farm, moveAction);
    }
  }

  return farm;
};

const poke = (farm, action) => {
  const rabbit = Farm.bunny(farm, action);

  if (!rabbit) {
    return farm;
  }

  if (isEdge(farm)(action)) {
    removeLand(farm, action, 'bunny');
    farm.bunny = 1 * SECONDS_PER_DAY;

    return farm;
  }

  const edges = PRNG.shuffle(getEdges(farm));

  edges.sort((a, b) => {
    const da = getDistance(a, action);
    const db = getDistance(b, action);

    return da - db;
  });

  const edge = edges[0];
  let {row, col} = action;

  if (edge.row < row) {
    row -= 1;
  } else if (edge.row > row) {
    row += 1;
  }

  if (edge.col < col) {
    col -= 1;
  } else if (edge.col > col) {
    col += 1;
  }

  const moveAction = {
    tool: 'move',
    row,
    col,
  };

  farm = enqueue(farm, moveAction);

  return farm;
};

Farm.create = (options = {}) => {
  const defaults = {
    actions: [],
    time: 0,
    rows: 6,
    cols: 6,
    land: [],
    market: {},
    inventory: [],
    cash: 500,
    bunny: 1 * SECONDS_PER_DAY,
  };

  const farm = {
    ...defaults,
    ...options,
  };

  while (farm.inventory.length < MAX_INVENTORY_SIZE) {
    farm.inventory.push(undefined);
  }

  for (let row = 0; row < farm.rows; row += 1) {
    farm.land[row] = [];

    for (let col = 0; col < farm.cols; col += 1) {
      farm.land[row][col] = {};
    }
  }

  return farm;
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

    case 'harvest':
      return harvest(farmCopy, actionCopy);

    case 'hoe':
      return hoe(farmCopy, actionCopy);

    case 'grass':
      return grass(farmCopy, actionCopy);

    case 'water':
      return water(farmCopy, actionCopy);

    case 'sprinkler':
      return sprinkler(farmCopy, actionCopy);

    case 'drain':
      return drain(farmCopy, actionCopy);

    case 'slot0':
    case 'slot1':
    case 'slot2':
    case 'slot3':
      return plant(farmCopy, actionCopy);

    case 'grow':
      return grow(farmCopy, actionCopy);

    case 'buy':
      return buy(farmCopy, actionCopy);

    case 'sell':
      return sell(farmCopy, actionCopy);

    case 'move':
      return move(farmCopy, actionCopy);

    case 'bunny':
      return bunny(farmCopy, actionCopy);

    case 'hop':
      return hop(farmCopy, actionCopy);

    case 'poke':
      return poke(farmCopy, actionCopy);

    default:
      return farmCopy;
  }
};

Farm.plots = (farm) => getPlots(farm);

Farm.adjacent = (farm, action) => {
  if (valid(farm, action)) {
    const {row, col} = action;
    return [{
      row: row - 1,
      col: col,
    }, {
      row: row - 1,
      col: col + 1,
    }, {
      row: row,
      col: col + 1,
    }, {
      row: row + 1,
      col: col + 1,
    }, {
      row: row + 1,
      col: col,
    }, {
      row: row + 1,
      col: col - 1,
    }, {
      row: row,
      col: col - 1,
    }, {
      row: row - 1,
      col: col - 1,
    }];
  }

  return [];
};

Farm.crop = (farm, action) => getLand(farm, action, 'plant');

Farm.watered = (farm, action) => getLand(farm, action, 'water');

Farm.tilled = (farm, action) => getLand(farm, action, 'till');

Farm.bunny = (farm, action) => getLand(farm, action, 'bunny');

Farm.season = (farm) => {
  const index = Math.floor(farm.time / SECONDS_PER_DAY / DAYS_PER_SEASON) % SEASONS.length;

  return SEASONS[index];
};

Farm.day = (farm) => Math.ceil((farm.time / SECONDS_PER_DAY) % DAYS_PER_SEASON);

module.exports = Farm;
