const Utils = require('./utils');

const Crops = {};

const dictionary = {
  turnip: {
    seed: 'bulb',
    seasons: ['spring', 'fall'],
    prices: {
      crop: 35,
      seed: 20,
    },
    stages: [0, 1, 1, 1, 0, 1],
    regrow: 0,
    xp: 8,
    level: 0,
  },
  tomato: {
    seed: 'seed',
    seasons: ['summer'],
    prices: {
      crop: 70,
      seed: 50,
    },
    stages: [0, 2, 2, 2, 2, 3],
    regrow: 4,
    xp: 12,
    level: 0,
  },
  eggplant: {
    seed: 'seed',
    seasons: ['fall'],
    prices: {
      crop: 90,
      seed: 20,
    },
    stages: [0, 1, 1, 1, 1, 1],
    regrow: 5,
    xp: 12,
    level: 0,
  },
  strawberry: {
    seed: 'seed',
    seasons: ['spring'],
    prices: {
      crop: 120,
      seed: 100,
    },
    stages: [0, 1, 1, 2, 2, 2],
    regrow: 4,
    xp: 18,
    level: 0,
  },
  potato: {
    seed: '',
    seasons: ['summer', 'fall'],
    prices: {
      crop: 60,
      seed: 50,
    },
    stages: [0, 1, 1, 1, 2, 1],
    regrow: 0,
    xp: 14,
    level: 0,
  },
  avocado: {
    seed: 'pit',
    seasons: ['spring', 'summer'],
    prices: {
      crop: 75,
      seed: 40,
    },
    stages: [0, 2, 2, 3, 2, 1],
    regrow: 0,
    xp: 15,
    level: 0,
  },
  wildflower: {
    seed: 'seed',
    seasons: ['spring', 'summer', 'fall'],
    prices: {
      crop: 1,
      seed: 0,
    },
    stages: [0, 1, 1, 2, 3, 2],
    regrow: 0,
    xp: 0,
    level: 99,
  },
  sprinkler: {
    seed: '',
    seasons: ['spring'],
    prices: {
      crop: 450,
      seed: 1350,
    },
    stages: [0, 0, 0, 0, 0, 0],
    regrow: 0,
    xp: 0,
    level: 2,
  },
};

Crops.seasonal = (season) =>
  Object.keys(dictionary)
    .filter((type) => (dictionary[type].seasons || []).includes(season));

Crops.info = (type) => {
  const crop = Utils.clone(dictionary[type]);

  if (crop) {
    crop.type = type;
  }

  return crop;
};

Crops.days = (({crop, stage, regrow}, adjust = (value) => value) => {
  const info = Crops.info(crop);

  if (regrow) {
    info.stages = [regrow];
  }

  let result = 0;

  if (info) {
    let i = stage % info.stages.length;

    while (i >= 0) {
      const original = info.stages[i];
      const adjusted = Math.ceil(adjust(original));

      if (adjusted > 0) {
        result += adjusted;
      } else {
        result += original;
      }
      i -= 1;
    }
  }

  return result;
});

module.exports = Crops;
