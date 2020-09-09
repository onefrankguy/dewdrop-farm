const Utils = require('./utils');
const PRNG = require('./prng');
const Farm = require('./farm');
const Crops = require('./crops');

const Rules = {};

const plotLists = {};

const getPlotList = (farm, type, test) => {
  if (!plotLists[type]) {
    plotLists[type] = {};
  }

  const day = Math.floor(farm.time / Farm.SECONDS_PER_DAY);

  if (plotLists[type].day !== day) {
    let plots = PRNG.shuffle(Farm.plots(farm));
    const dt = Farm.SECONDS_PER_DAY / plots.length;
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

  const farmTime = farm.time - (day * Farm.SECONDS_PER_DAY);
  const plots = [];
  const remaining = [];

  plotLists[type].plots.forEach((plot) => {
    if (plot.time <= farmTime) {
      if (test(plot)) {
        plots.push(plot);
      }
    } else {
      remaining.push(plot);
    }
  });
  plotLists[type].plots = remaining;

  return plots;
};

const getGrassable = (farm, test) => getPlotList(farm, 'grassable', test);

const getSprinklerable = (farm, test) => getPlotList(farm, 'sprinklerable', test);

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

  getSprinklerable(farm, shouldSprinkler(farm)).forEach(({row, col}) => {
    const sprinklerAction = {
      tool: 'sprinkler',
      row,
      col,
    };

    farm = Rules.dispatch(farm, sprinklerAction);
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
  const day = Math.ceil(farm.time / Farm.SECONDS_PER_DAY);
  const tilled = Farm.tilled(farm, action);

  if (tilled) {
    const dayTilled = Math.ceil(tilled.time / Farm.SECONDS_PER_DAY);
    const duration = day - dayTilled;
    const skilled = Farm.skilled(farm, 0.02, 0.04, true);

    return duration > 1 && skilled;
  }

  return false;
};

const shouldSprinkler = (farm) => (action) => {
  const day = Math.ceil(farm.time / Farm.SECONDS_PER_DAY);
  const plant = Farm.planted(farm, action);

  if (plant && plant.crop === 'sprinkler') {
    const watered = Farm.watered(farm, action);
    const dayWatered = watered ? Math.ceil(watered.time / Farm.SECONDS_PER_DAY) : 0;
    const duration = day - dayWatered;

    return duration > 0;
  }

  return false;
};

const shouldDrain = (farm) => (action) => {
  const day = Math.ceil(farm.time / Farm.SECONDS_PER_DAY);
  const watered = Farm.watered(farm, action);

  if (watered) {
    const dayWatered = Math.ceil(watered.time / Farm.SECONDS_PER_DAY);
    const duration = day - dayWatered;

    return duration > 0;
  }

  return false;
};

const shouldGrow = (farm) => (action) => {
  const day = Math.ceil(farm.time / Farm.SECONDS_PER_DAY);
  const plant = Farm.planted(farm, action);
  const watered = Farm.watered(farm, action);
  let adjust = watered && Math.ceil(watered.time / Farm.SECONDS_PER_DAY) >= day ? -1 : 0;

  if (plant) {
    const diagonalCrops = Farm.diagonal(farm, action)
      .map((plot) => Farm.planted(farm, plot))
      .filter((plant) => plant)
      .map(({crop}) => crop);
    const anyDiagonal = diagonalCrops.find((type) => plant.crop === type);

    const orthogonalCrops = Farm.orthogonal(farm, action)
      .map((plot) => Farm.planted(farm, plot))
      .filter((plant) => plant)
      .map(({crop}) => crop)
      .filter((type) => plant.crop === type);
    const allOrthogonal = orthogonalCrops.length === 4;

    if (anyDiagonal || allOrthogonal) {
      adjust += 1;
    } else if (orthogonalCrops.length) {
      adjust -= 1;
    }

    const plantedOn = Math.ceil(plant.time / Farm.SECONDS_PER_DAY);
    const aliveFor = day - plantedOn;
    const needsToBeAliveFor = Crops.days(plant, (value) => value - adjust);

    return aliveFor >= needsToBeAliveFor;
  }

  return false;
};

Rules.dispatch = (farm, action) => {
  const actionCopy = Utils.clone(action);
  actionCopy.row = parseInt(actionCopy.row, 10);
  actionCopy.col = parseInt(actionCopy.col, 10);

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

module.exports = Rules;
