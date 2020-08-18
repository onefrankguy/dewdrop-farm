const Utils = require('./utils');
const PRNG = require('./prng');
const Farm = require('./farm');

const RANDOM_TICK_SPEED = 3;
const SECONDS_PER_DAY = 400;

const Rules = {};

const update = (farm) => {
  const plots = PRNG.shuffle(Farm.plots(farm));

  for (let rts = 0; rts < RANDOM_TICK_SPEED; rts += 1) {
    const {row, col} = plots[rts];

    const drainAction = {
      tool: 'drain',
      row,
      col,
    };

    if (shouldDrain(farm, drainAction)) {
      farm = Rules.dispatch(farm, drainAction);
    }

    const growAction = {
      tool: 'grow',
      row,
      col,
    };

    if (shouldGrow(farm, growAction)) {
      farm = Rules.dispatch(farm, growAction);
    }
  }

  return farm;
};

const shouldDrain = (farm, action) => {
  const duration = Farm.wateredFor(farm, action);
  const chance = Math.floor(duration / SECONDS_PER_DAY) * 0.01;

  return PRNG.random() < chance;
};

const shouldGrow = (farm, action) => {
  const points = Farm.wateredFor(farm, action) > 0 ? 4 : 2;
  const chance = 1 / (Math.floor(25 / points) + 1);

  return PRNG.random() < chance;
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

module.exports = Rules;
