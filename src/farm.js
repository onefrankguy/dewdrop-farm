const Utils = require('./utils');
const Crops = require('./crops');
const PRNG = require('./prng');

const STARTING_CASH = 500;
const MIN_CROP_STAGE = 1;
const MAX_CROP_STAGE = 5;
const DEAD_CROP_STAGE = -1;
const MAX_INVENTORY_SIZE = 4;
const MAX_STACK_SIZE = 16;

const LEVELS = [100, 380, 770, 1300, 2150, 3300, 4800, 6900, 10000, 15000];
const SEASONS = ['spring', 'summer', 'fall', 'winter'];
const DAYS_PER_SEASON = 28;
const SECONDS_PER_DAY = (14 * 60 * 3) / SEASONS.length / DAYS_PER_SEASON;

const Farm = {
  SECONDS_PER_DAY,
};

const valid = (farm, {row, col}) =>
  farm
  && row >= 0 && row < farm.rows
  && col >= 0 && col < farm.cols;

const getDistance = (plot1, plot2) => {
  const dx = plot2.col - plot1.col;
  const dy = plot2.row - plot1.row;

  return Math.abs(dx) + Math.abs(dy);
};

const getRotation = (item, values = [90, 180, 270, 360]) =>
  (item && item.rotate) ? item.rotate : PRNG.pick(values);

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
  const action = plots.find((plot) => !!Farm.bunny(farm, plot));

  return action ? Farm.bunny(farm, action) : undefined;
};

const getBunnyTime = () => 1 * PRNG.between(1 * SECONDS_PER_DAY, 2 * SECONDS_PER_DAY);

const getBunnyDirection = (from, to) => {
  if (!from && !to) {
    return PRNG.pick(['X', 0]);
  }

  return from.col < to.col ? 'X' : 0;
};

const clearEmptyItems = (farm) => {
  for (let i = 0; i < farm.inventory.length; i += 1) {
    if (farm.inventory[i] && !farm.inventory[i].amount) {
      farm.inventory[i] = undefined;
    }
  }
};

const addItem = (farm, item) => {
  let added = false;

  clearEmptyItems(farm);

  let slotIndex = farm.inventory.findIndex((slot) => {
    return slot
      && !!slot.seed === !!item.seed
      && slot.type === item.type
      && slot.amount + item.amount <= MAX_STACK_SIZE;
  });

  if (slotIndex < 0) {
    slotIndex = farm.inventory.findIndex((slot) => !slot);
  }

  if (slotIndex >= 0 && slotIndex < MAX_INVENTORY_SIZE) {
    if (!farm.inventory[slotIndex]) {
      farm.inventory[slotIndex] = {
        ...item,
        amount: 0,
      };
    }

    if (farm.inventory[slotIndex].amount + item.amount <= MAX_STACK_SIZE) {
      farm.inventory[slotIndex].amount += item.amount;
      added = true;
    }
  }

  clearEmptyItems(farm);

  return added;
};

const removeItem = (farm, item) => {
  let removed = false;

  clearEmptyItems(farm);

  let slotIndex = farm.inventory.findIndex((slot, index) => {
    return slot
      && !!slot.seed === !!item.seed
      && slot.type === item.type
      && (item.index !== undefined ? (index === item.index) : true);
  });

  if (slotIndex >= 0 && slotIndex < MAX_INVENTORY_SIZE) {
    farm.inventory[slotIndex].amount -= item.amount;
    farm.inventory[slotIndex].amount = Math.max(0, farm.inventory[slotIndex].amount);
    removed = true;
  }

  clearEmptyItems(farm);

  return removed;
};

const getSellPrice = (farm, item) => {
  const season = Farm.season(farm);
  const seasonIndex = SEASONS.indexOf(season);
  const info = Crops.info(item.type);
  let price = 0;

  if (info) {
    if (item.seed) {
      price = Math.ceil(info.prices.seed * 0.5);
    } else {
      price = info.prices.crop;
      if (!info.seasons.includes(season)) {
        const lastSeason = info.seasons[info.seasons.length - 1];
        const lastSeasonIndex = SEASONS.indexOf(lastSeason);
        if (~seasonIndex && ~lastSeasonIndex && lastSeasonIndex + 1 === seasonIndex) {
          price = Math.ceil(info.prices.crop * 1.5);
        }
      }
    }
  }

  return price;
};

const getBuyPrice = (_, item) => {
  const info = Crops.info(item.type);
  let price = 0;

  if (info) {
    price = item.seed ? info.prices.seed : info.prices.crop;
  }

  return price;
};

const enqueue = (farm, action) => {
  farm.actions.push(action);

  return farm;
};

const dequeue = (farm) => {
  const actions = farm.actions.slice().filter(({tool}) => tool !== 'update');
  farm.actions = [];

  actions.forEach((action) => {
    farm = Farm.dispatch(farm, action);
  });

  return farm;
};

const update = (farm, action) => {
  farm = dequeue(farm);

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
  const plant = Farm.planted(farm, action);

  if (!plant || plant.crop === 'sprinkler' || plant.stage < MAX_CROP_STAGE) {
    return farm;
  }

  const item = {
    type: plant.crop,
    amount: 1,
    seed: false,
  };

  if (!addItem(farm, item)) {
    return farm;
  }

  removeLand(farm, action, 'plant');

  const info = Crops.info(plant.crop);

  if (info.xp) {
    farm.xp += info.xp;
  }

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

  return farm;
};

const hoe = (farm, action) => {
  const plant = Farm.planted(farm, action);

  if (plant) {
    removeLand(farm, action, 'plant');

    if (plant.stage >= MAX_CROP_STAGE) {
      const item = {
        type: plant.crop,
        amount: 1,
        seed: false,
      };

      addItem(farm, item);
    } else if (plant.stage === MIN_CROP_STAGE) {
      const item = {
        type: plant.crop,
        amount: 1,
        seed: true,
      };

      addItem(farm, item);
    } else if (plant.stage > MIN_CROP_STAGE && Farm.skilled(farm, 0.3, 0.01)) {
      const item = {
        type: plant.crop,
        amount: 1,
        seed: true,
      };

      addItem(farm, item);
    }
  }

  removeLand(farm, action, 'fertilizer');
  addLand(farm, action, 'till');

  const pokeAction = {
    tool: 'poke',
    row: action.row,
    col: action.col,
    with: 'hoe',
  };

  farm = enqueue(farm, pokeAction);

  return farm;
};

const grass = (farm, action) => {
  if (!Farm.planted(farm, action)) {
    removeLand(farm, action, 'till');
    removeLand(farm, action, 'grass');
    removeLand(farm, action, 'water');
    removeLand(farm, action, 'fertilizer');

    const grassAction = {
      row: action.row,
      col: action.col,
      rotate: getRotation(),
    };

    addLand(farm, grassAction, 'grass');
  }

  return farm;
};

const water = (farm, action) => {
  if (Farm.tilled(farm, action)) {
    const watered = Farm.watered(farm, action);

    action.rotate = getRotation(watered);

    addLand(farm, action, 'water');
  }

  const pokeAction = {
    tool: 'poke',
    row: action.row,
    col: action.col,
    with: 'water',
  };

  farm = enqueue(farm, pokeAction);

  return farm;
};

const sprinkler = (farm, action) => {
  const plant = Farm.planted(farm, action);

  if (plant && plant.crop === 'sprinkler') {
    let plots = [action].concat(Farm.orthogonal(farm, action));

    if (Farm.level(farm) >= 6) {
      plots = plots.concat(Farm.diagonal(farm, action));
    }

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

const canPlant = (farm, action) => {
  const slot = farm.inventory[action.slot];
  const planted = !!Farm.planted(farm, action);
  const tilled = !!Farm.tilled(farm, action);
  const fertilized = !!Farm.fertilized(farm, action);

  if (!slot) {
    return false;
  }

  if (slot.type === 'sprinkler') {
    return !planted;
  }

  if (slot.type === 'fertilizer') {
    return tilled && !fertilized;
  }

  return tilled && !planted;
};

const plant = (farm, action) => {
  const slot = farm.inventory[action.slot];
  const plant = Farm.planted(farm, action);

  if (canPlant(farm, action)) {
    const item = {
      type: slot.type,
      amount: 1,
      seed: true,
      index: action.slot,
    };

    if (removeItem(farm, item)) {
      action.type = 'plant';
      action.crop = item.type;

      if (action.crop === 'wildflower') {
        action.crop = PRNG.pick(['rose', 'tulip', 'sunflower']);
        action.rotate = PRNG.pick(['X', 0]);

        if (Farm.skilled(farm, 0.02, 0.04)) {
          const season = Farm.season(farm);
          const seasonalCrops = Crops.seasonal(season);

          action.type = PRNG.pick(seasonalCrops);
          action.rotate = 0;
        }
      }

      if (action.crop === 'fertilizer') {
        action.type = 'fertilizer';
        action.crop = undefined;
        action.rotate = getRotation(plant);
      }

      addLand(farm, action, action.type);
    }
  }

  const pokeAction = {
    ...action,
    tool: 'poke',
    with: slot ? slot.type : 'hand',
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
  const plant = Farm.planted(farm, action);

  if (!plant || plant.stage < MIN_CROP_STAGE || plant.stage >= MAX_CROP_STAGE) {
    return farm;
  }

  const info = Crops.info(plant.crop);
  const season = Farm.season(farm);

  if (info.stages.length < 1) {
    return farm;
  }

  if (info.seasons.includes(season)) {
    plant.stage += 1;
  } else {
    plant.stage = DEAD_CROP_STAGE;
    plant.rotate = getRotation(plant, ['X', 0]);
    removeLand(farm, plant, 'fertilizer');
  }

  addLand(farm, plant, 'plant');

  return farm;
};

const buy = (farm, action) => {
  const crop = Crops.info(action.crop);

  if (farm.cash < crop.prices.seed) {
    return farm;
  }

  const item = {
    type: crop.type,
    amount: 1,
    seed: true,
  };

  if (addItem(farm, item)) {
    farm.cash -= crop.prices.seed;
  }

  return farm;
};

const sell = (farm, action) => {
  const item = {
    type: action.crop,
    amount: 1,
    seed: action.seed,
  };

  if (removeItem(farm, item)) {
    farm.cash += getSellPrice(farm, item);
  }

  return farm;
};

const bunny = (farm) => {
  const action = getBunny(farm);

  if (!action && farm.bunny <= 0) {
    const plot = PRNG.pick(getPlots(farm).filter(isNotEdge(farm)));

    const action = {
      ...plot,
      rotate: getBunnyDirection(),
    }

    addLand(farm, action, 'bunny');
  }

  return farm;
};

const move = (farm, action) => {
  const rabbit = getBunny(farm);

  if (rabbit) {
    removeLand(farm, rabbit, 'bunny');

    action.rotate = getBunnyDirection(rabbit, action);

    addLand(farm, action, 'bunny');

    const plant = Farm.planted(farm, action);

    if (plant && plant.crop !== 'sprinkler' && plant.stage > MIN_CROP_STAGE && plant.stage < MAX_CROP_STAGE) {
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
      const plot = PRNG.pick(Farm.orthogonal(farm, action));

      const moveAction = {
        tool: 'move',
        ...plot,
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
    farm.bunny = getBunnyTime();

    return farm;
  }

  if (action.with === 'hand') {
    farm.xp += 5;
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
    cash: STARTING_CASH,
    bunny: getBunnyTime(),
    version: 3,
    monetization: false,
    xp: 0,
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
      farm.land[row][col] = {
        grass: {
          time: farm.time,
          rotate: getRotation(),
        },
      };
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

Farm.save = (farm, localStorage) => {
  try {
    let farmCopy = Utils.clone(farm);
    farmCopy = dequeue(farmCopy);
    const data = JSON.stringify(farmCopy);

    localStorage.setItem('farm', data);

    return [farmCopy, true];
  } catch {
    return [farm, false];
  }
};

Farm.load = (farm, localStorage) => {
  try {
    const data = localStorage.getItem('farm');
    const savedFarm = JSON.parse(data);

    return savedFarm.version === farm.version ? savedFarm : farm;
  } catch {
    return farm;
  }
};

Farm.plots = (farm) => getPlots(farm);

Farm.diagonal = (farm, action, test = true) => {
  let results = [];

  if (valid(farm, action)) {
    const {row, col} = action;
    results = [{
      row: row + 1,
      col: col + 1,
    }, {
      row: row + 1,
      col: col - 1,
    }, {
      row: row - 1,
      col: col + 1,
    }, {
      row: row - 1,
      col: col - 1,
    }];
  }

  return test ? results.filter((plot) => valid(farm, plot)) : results;
};

Farm.orthogonal = (farm, action, test = true) => {
  let results = [];

  if (valid(farm, action)) {
    const {row, col} = action;
    results = [{
      row: row + 1,
      col,
    }, {
      row: row - 1,
      col,
    }, {
      row,
      col: col + 1,
    }, {
      row,
      col: col - 1,
    }];
  }

  return test ? results.filter((plot) => valid(farm, plot)) : results;
};

Farm.planted = (farm, action) => getLand(farm, action, 'plant');

Farm.watered = (farm, action) => getLand(farm, action, 'water');

Farm.tilled = (farm, action) => getLand(farm, action, 'till');

Farm.fertilized = (farm, action) => getLand(farm, action, 'fertilizer');

Farm.bunny = (farm, action) => getLand(farm, action, 'bunny');

Farm.grass = (farm, action) => getLand(farm, action, 'grass');

Farm.season = (farm) => {
  const index = Math.floor(farm.time / SECONDS_PER_DAY / DAYS_PER_SEASON) % SEASONS.length;

  return SEASONS[index];
};

Farm.day = (farm) => Math.ceil((farm.time / SECONDS_PER_DAY) % DAYS_PER_SEASON);

Farm.market = (farm) => {
  const items = [];

  farm.inventory.filter((item) => item).forEach((item) => {
    const index = items.findIndex(({type, seed}) => type === item.type && !!seed === !!item.seed);

    if (index < 0) {
      items.push({
        ...item,
        amount: 0,
        cash: getSellPrice(farm, item),
      })
    }
  });

  return items;
};

Farm.store = (farm) => {
  const level = Farm.level(farm);
  const season = Farm.season(farm);
  const seasonalCrops = Crops.seasonal(season)
    .filter((type) => {
      const info = Crops.info(type);

      return info.level <= level;
    });

  if (season === 'winter') {
    seasonalCrops.push('wildflower');
  }

  return seasonalCrops.map((type) => {
    const item = {
      type,
      amount: 0,
      seed: true,
    };

    return {
      ...item,
      cash: getBuyPrice(farm, item),
    };
  });
};

Farm.level = (farm) => {
  const xp = (farm && farm.xp) ? farm.xp : 0;
  const index = LEVELS.findIndex((level) => xp < level);

  return ~index ? index : LEVELS.length;
};

Farm.xp = (farm) => {
  const xp = (farm && farm.xp) ? farm.xp : 0;
  const max = LEVELS[LEVELS.length - 1];
  const index = LEVELS.findIndex((level) => xp < level);
  const needed = ~index ? LEVELS[index] : max;

  return [Math.min(xp, max), needed];
};

Farm.luck = (farm, base = 0.01, addition = 0.02, invert = false) => {
  const level = Farm.level(farm);
  const farmLevel = invert ? LEVELS.length - level : level;
  const luckLevel = farm.monetization ? 0.04 : 0;

  return base + luckLevel + (addition * farmLevel);
};

Farm.skilled = (farm, base, addition, invert = false) =>
  PRNG.random() < Farm.luck(farm, base, addition, invert);

module.exports = Farm;
