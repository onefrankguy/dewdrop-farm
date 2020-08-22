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
  rose: {
    seed: 'seed',
    // seasons: ['fall'],
    prices: {
      crop: 290,
      seed: 200,
    },
    stages: [0, 1, 4, 4, 0, 3],
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
  tulip: {
    seed: 'bulb',
    // seasons: ['spring'],
    prices: {
      crop: 30,
      seed: 25,
    },
    stages: [0, 1, 1, 2, 0, 2],
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
  melon: {
    seed: 'seed',
    seasons: ['summer'],
    prices: {
      crop: 250,
      seed: 80,
    },
    stages: [0, 1, 2, 3, 3, 3],
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
  lemon: {
    seed: 'seed',
    seasons: [''],
    prices: {
      crop: 0,
      seed: 0,
    },
    stages: [0],
  },
  pineapple: {
    seed: 'seed',
    seasons: [''],
    prices: {
      crop: 0,
      seed: 0,
    },
    stages: [0],
  },
  rice: {
    seed: 'grain',
    // seasons: ['spring'],
    prices: {
      crop: 30,
      seed: 40,
    },
    stages: [0, 1, 2, 2, 0, 3],
  },
  wheat: {
    seed: 'seed',
    seasons: ['summer', 'fall'],
    prices: {
      crop: 25,
      seed: 10,
    },
    stages: [0, 1, 1, 1, 0, 1],
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
  strawberry: {
    seed: 'seed',
    seasons: ['spring'],
    prices: {
      crop: 120,
      seed: 75,
    },
    stages: [0, 1, 1, 2, 2, 2],
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
  potato: {
    seed: '',
    seasons: ['spring'],
    prices: {
      crop: 80,
      seed: 50,
    },
    stages: [0, 1, 1, 1, 2, 1],
  },
  coffee: {
    seed: 'bean',
    // seasons: ['spring', 'summer'],
    prices: {
      crop: 15,
      seed: 100,
    },
    stages: [0, 1, 2, 2, 3, 2],
    regrow: 2,
  },
  orange: {
    seed: 'seed',
    seasons: [''],
    prices: {
      crop: 0,
      seed: 0,
    },
    stages: [0],
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
  sunflower: {
    seed: 'seed',
    seasons: ['summer', 'fall'],
    prices: {
      crop: 80,
      seed: 200,
    },
    stages: [0, 1, 2, 3, 0, 2],
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

Crops.days = (({crop, stage}, multiplier = 1) => {
  const info = Crops.info(crop);

  let result = 0;

  if (info) {
    let i = stage % info.stages.length;

    while (i >= 0) {
      result += Math.ceil(info.stages[i] * multiplier);
      i -= 1;
    }
  }

  return result;
});

module.exports = Crops;
