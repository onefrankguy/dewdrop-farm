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
    stages: [0, 1, 1, 1, 0, 1],
    regrow: 0,
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
      crop: 70,
      seed: 50,
    },
    stages: [0, 2, 2, 2, 2, 3],
    regrow: 4,
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
  },
  potato: {
    seed: '',
    seasons: ['spring'],
    prices: {
      crop: 80,
      seed: 50,
    },
    stages: [0, 1, 1, 1, 2, 1],
    regrow: 0,
  },
  corn: {
    seed: 'seed',
    seasons: ['summer', 'fall'],
    prices: {
      crop: 55,
      seed: 150,
    },
    stages: [0, 2, 3, 3, 3, 3],
    regrow: 4,
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
      crop: 120,
      seed: 60,
    },
    stages: [0, 1, 3, 3, 0, 3],
    regrow: 0,
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
  },
  sprinkler: {
    seed: '',
    seasons: ['spring'],
    prices: {
      crop: 100,
      seed: 200,
    },
    stages: [0, 0, 0, 0, 0, 0],
    regrow: 0,
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

const getCropData = (crop, season) => {
  const x = Math.max(0, parseInt(process.argv[3], 10));
  const adjust = (value) => value - x;
  const info = Crops.info(crop);
  const days = Crops.days({crop, stage: 5, regrow: 0}, adjust);
  const regrow = info.regrow ? Crops.days({crop, stage: 5, regrow: info.regrow}, adjust) : 0;

  let growingDays = 0;
  for (let i = 0; i < info.seasons.length; i += 1) {
    if (info.seasons[i] === season) {
      growingDays = 1;
    } else if (growingDays) {
      growingDays += 1;
    }
  }
  growingDays *= 28;

  const maxHarvests = regrow ? Math.ceil((growingDays - days) / regrow) : Math.ceil((growingDays - days) / days);
  const minPurchases = regrow ? 1 : maxHarvests;
  const maxActiveDays = days + ((maxHarvests - 1) * regrow);
  const price = info.prices.seed
  const baseValue = info.prices.crop;
  const profitPerDay = ((maxHarvests * baseValue) - (minPurchases * price)) / maxActiveDays;

  return {
    crop,
    days,
    price,
    value: baseValue,
    sales: maxHarvests,
    profit: profitPerDay,
    regrow: info.regrow,
    seasons: info.seasons,
  };
};

[process.argv[2]].forEach((season) => {
  console.log(`\n= ${season.toUpperCase()} =`);

  Crops.seasonal(season).forEach((crop) => {
    const {days, sales, profit, seasons, regrow, price, value} = getCropData(crop, season);
    const regrowth = regrow ? `(${regrow} to regrow)` : '';

    console.log(`${crop}:`);
    console.log(`- grows in ${seasons.join(', ')}`);
    console.log(`- takes ${days} days to grow ${regrowth}`);
    console.log(`- can sell ${sales} per year`);
    console.log(`- buy for ${price}, sell for ${value}`);
    console.log(`- ${profit.toFixed(2)} per day`);
  });
});

module.exports = Crops;
