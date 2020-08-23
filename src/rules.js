const Utils = require('./utils');
const PRNG = require('./prng');
const Farm = require('./farm');
const Crops = require('./crops');

const SEASONS_PER_YEAR = 4;
const DAYS_PER_SEASON = 28;
const SECONDS_PER_DAY = (14 * 60 * 3) / SEASONS_PER_YEAR / DAYS_PER_SEASON;

const Rules = {};

const plotLists = {};

const getPlotList = (farm, type, test) => {
  if (!plotLists[type]) {
    plotLists[type] = {};
  }

  const day = Math.floor(farm.time / SECONDS_PER_DAY);

  if (plotLists[type].day !== day) {
    let plots = PRNG.shuffle(Farm.plots(farm));
    const dt = SECONDS_PER_DAY / plots.length;
    plots = plots.map((plot, index) => {
      const min = dt * (index + 0);
      const max = dt * (index + 1);
      const time = PRNG.between(min, max);

      return {
        ...plot,
        time,
        id: index,
      };
    });

    plotLists[type].day = day;
    plotLists[type].plots = plots;
  }

  const farmTime = farm.time - (day * SECONDS_PER_DAY);
  const plots = [];
  const remaining = [];

  plotLists[type].plots.forEach((plot) => {
    if (plot.time <= farmTime && test(plot)) {
      plots.push(plot);
    } else {
      remaining.push(plot);
    }
  });
  plotLists[type].plots = remaining;

  return plots;
};

const getGrassable = (farm, test) => getPlotList(farm, 'grassable', test);

const getDrainable = (farm, test) => getPlotList(farm, 'drainable', test);

const getGrowable = (farm, test) => getPlotList(farm, 'growable', test);

const update = (farm) => {
  getGrassable(farm, shouldGrass(farm)).forEach(({row, col}) => {
    const grassAction = {
      tool: 'grass',
      row,
      col,
    };

    farm = Rules.dispatch(farm, grassAction);
  });

  getDrainable(farm, shouldDrain(farm)).forEach(({row, col}) => {
    const drainAction = {
      tool: 'drain',
      row,
      col,
    };

    farm = Rules.dispatch(farm, drainAction);
  });

  getGrowable(farm, shouldGrow(farm)).forEach(({row, col}) => {
    const growAction = {
      tool: 'grow',
      row,
      col,
    };

    farm = Rules.dispatch(farm, growAction);
  });

  return farm;
};

const shouldGrass = (farm) => (action) => {
  const day = Math.ceil(farm.time / SECONDS_PER_DAY);
  const tilled = Farm.tilled(farm, action);

  if (tilled) {
    const dayTilled = Math.ceil(tilled.time / SECONDS_PER_DAY);
    const duration = day - dayTilled;
    const adjacent = Farm.adjacent(farm, action);
    const fallow = adjacent.filter((action) => !Farm.tilled(farm, action));

    if (duration > adjacent.length - fallow.length) {
      return true;
    }
  }

  return false;
};

const shouldDrain = (farm) => (action) => {
  const day = Math.ceil(farm.time / SECONDS_PER_DAY);
  const watered = Farm.watered(farm, action);

  if (watered) {
    const dayWatered = Math.ceil(watered.time / SECONDS_PER_DAY);
    const duration = day - dayWatered;

    return duration > 0;
  }

  return false;
};

const shouldGrow = (farm) => (action) => {
  const day = Math.ceil(farm.time / SECONDS_PER_DAY);
  const crop = Farm.crop(farm, action);
  const watered = Farm.watered(farm, action);
  const adjust = watered && Math.ceil(watered.time / SECONDS_PER_DAY) >= day ? -1 : 0;

  if (crop) {
    const plantedOn = Math.ceil(crop.time / SECONDS_PER_DAY);
    const aliveFor = day - plantedOn;
    const needsToBeAliveFor = Crops.days(crop, (value) => value - adjust);

    return aliveFor >= needsToBeAliveFor;
  }

  return false;
};

Rules.dispatch = (farm, action) => {
  const actionCopy = Utils.clone(action);

  if (!action.time) {
    action.time = farm.time;
  }

  const farmCopy = Farm.dispatch(farm, actionCopy);

  switch (actionCopy.tool) {
    case 'update':
      return update(farmCopy, actionCopy);

    default:
      return farmCopy;
  }
};

Rules.season = (farm) => {
  const seasons = ['summer', 'fall', 'winter', 'spring'];
  const index = Math.floor(farm.time / SECONDS_PER_DAY / DAYS_PER_SEASON) % seasons.length;

  return seasons[index];
};

Rules.day = (farm) => Math.ceil(farm.time / SECONDS_PER_DAY) % DAYS_PER_SEASON;

Rules.store = (farm) => {
  const season = Rules.season(farm);
  const seasonalCrops = Crops.seasonal(season);

  return seasonalCrops.map(Crops.info);
};

Rules.market = (farm) => {
  const ownedCrops = Object.keys(farm.market);

  return ownedCrops.map(Crops.info);
};

module.exports = Rules;
