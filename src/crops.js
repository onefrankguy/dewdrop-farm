const Utils = require('./utils');

const Crops = {};

const dictionary = {
  turnip: {
    seed: 'bulb',
    seasons: ['spring'],
    prices: {
      crop: 35,
      seed: 20,
    },
    stages: [0, ,1, 1, 1, 1],
  },
  chile: {
    seed: 'seed',
    seasons: ['summer'],
    prices: {
      crop: 40,
      seed: 40,
    },
    stages: [0, 1, 1, 1, 1, 1],
    regrow: 3,
  },
  tomato: {
    seed: 'seed',
    seasons: ['summer'],
    prices: {
      crop: 60,
      seed: 50,
    },
    stages: [0, 2, 2, 2, 2, 3],
    regrow: 4
  },
  eggplant: {
    seed: 'seed',
    seasons: ['fall'],
    prices: {
      crop: 60,
      seed: 20,
    },
    stages: [0, 1, 1, 1, 1, 1],
    regrow: 5,
  },
  strawberry: {
    seed: 'seed',
    seasons: ['spring'],
    prices: {
      crop: 120,
      seed: 75,
    },
    stages: [0, 1, 1, 2, 2, 2],
  },
  potato: {
    seed: '',
    seasons: ['spring'],
    prices: {
      crop: 80,
      seed: 50,
    },
    stages: [0, 1, 1, 1, 2, 1],
  },
  corn: {
    seed: 'seed',
    seasons: ['summer', 'fall'],
    prices: {
      crop: 50,
      seed: 150,
    },
    stages: [0, 2, 3, 3, 3, 3],
    regrow: 4,
  },
  melon: {
    seed: 'seed',
    // seasons: ['summer'],
    prices: {
      crop: 250,
      seed: 80,
    },
    stages: [0, 1, 2, 3, 3, 3],
  },
  grape: {
    seed: 'seed',
    seasons: ['fall'],
    prices: {
      crop: 80,
      seed: 60,
    },
    stages: [0, 1, 1, 2, 3, 3],
    regrow: 3,
  },
  cassava: {
    seed: '',
    seasons: ['fall'],
    prices: {
      crop: 160,
      seed: 60,
    },
    stages: [0, 1, 3, 3, 0, 3],
  },
  avocado: {
    seed: 'pit',
    seasons: ['spring', 'summer'],
    prices: {
      crop: 260,
      seed: 100,
    },
    stages: [0, 2, 1, 2, 2, 2],
  },
  sunflower: {
    seed: 'seed',
    // seasons: ['summer', 'fall'],
    prices: {
      crop: 80,
      seed: 200,
    },
    stages: [0, 1, 2, 3, 0, 2],
  },
  sprinkler: {
    seed: '',
    tool: true,
    seasons: ['spring', 'summer', 'fall', 'winter'],
    prices: {
      crop: 100,
      seed: 200,
    },
    stages: [0, 0, 0, 0, 0, 0],
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

Crops.days = (({crop, stage}, adjust = (value) => value) => {
  const info = Crops.info(crop);

  let result = 0;

  if (info) {
    let i = stage % info.stages.length;

    while (i >= 0) {
      const original = info.stages[i];
      const adjusted = Math.ceil(adjust(original));

      result += Math.max(original, adjusted);
      i -= 1;
    }
  }

  return result;
});

module.exports = Crops;
