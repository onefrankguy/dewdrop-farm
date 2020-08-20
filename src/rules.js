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

const getGrowable = (farm, test) => getPlotList(farm, 'growable', test);

const getDrainable = (farm, test) => getPlotList(farm, 'drainable', test);

const update = (farm) => {
  getGrowable(farm, shouldGrow(farm)).forEach(({row, col}) => {
    const growAction = {
      tool: 'grow',
      row,
      col,
    };

    farm = Rules.dispatch(farm, growAction);
  });

  getDrainable(farm, shouldDrain(farm)).forEach(({row, col}) => {
    const drainAction = {
      tool: 'drain',
      row,
      col,
    };

    farm = Rules.dispatch(farm, drainAction);
  });

  return farm;
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
  const multiplier = watered && Math.ceil(watered.time / SECONDS_PER_DAY) >= day ? 0.5 : 1;

  if (crop) {
    const plantedOn = Math.ceil(crop.time / SECONDS_PER_DAY);
    const aliveFor = day - plantedOn;
    const needsToBeAliveFor = Crops.days(crop, multiplier);

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
  const index = Math.floor(farm.time / SECONDS_PER_DAY / DAYS_PER_SEASON);

  return ['spring', 'summer', 'fall', 'winter'][index];
};

Rules.day = (farm) => Math.ceil(farm.time / SECONDS_PER_DAY) % DAYS_PER_SEASON;

Rules.market = (farm) => {
  const season = Rules.season(farm);
  const seasonalCrops = Crops.seasonal(season);
  const ownedCrops = Object.keys(farm.market).filter((name) => !seasonalCrops.includes(name));
  const marketCrops = ownedCrops.concat(seasonalCrops);

  return marketCrops.map(Crops.info);
};

module.exports = Rules;
