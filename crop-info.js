#!/usr/bin/env node

const options = {
  season: 'spring',
  crops: true,
  flowers: false,
  tools: false,
  growingDays: 28,
  water: false,
  rows: false,
};

process.argv.forEach((arg) => {
  if (arg.startsWith('--season')) {
    options.season = arg.split('=')[1];
  }
  if (arg.startsWith('--crops')) {
    options.crops = true;
  }
  if (arg.startsWith('--no-crops')) {
    options.crops = false;
  }
  if (arg.startsWith('--flowers')) {
    options.flowers = true;
  }
  if (arg.startsWith('--no-flowers')) {
    options.flowers = false;
  }
  if (arg.startsWith('--tools')) {
    options.tools = true;
  }
  if (arg.startsWith('--no-tools')) {
    options.tools = false;
  }
  if (arg.startsWith('--growing-days')) {
    options.growingDays = arg.split('=')[1];
  }
  if (arg.startsWith('--water')) {
    options.water = true;
  }
  if (arg.startsWith('--no-water')) {
    options.water = false;
  }
  if (arg.startsWith('--rows')) {
    options.rows = true;
  }
  if (arg.startsWith('--no-rows')) {
    options.rows = false;
  }
});

const Crops = require('./src/crops');

const getCropData = (crop, season) => {
  let x = 0;
  if (options.water) {
    x += 1;
  }
  if (options.rows) {
    x += 1;
  }
  const adjust = (value) => value - x;
  const info = Crops.info(crop);
  const days = Crops.days({crop, stage: 5, regrow: 0}, adjust);
  const regrow = info.regrow ? Crops.days({crop, stage: 5, regrow: info.regrow}, adjust) : 0;

  let growingDays = 0;
  if (info.seasons.includes(season)) {
    growingDays += 1;

    if (season === 'spring' && info.seasons.includes('summer')) {
      growingDays += 1;
    }

    if (season === 'summer' && info.seasons.includes('fall')) {
      growingDays += 1;
    }
  }
  growingDays *= 28;

  if (options.growingDays !== 'max') {
    growingDays = parseInt(options.growingDays, 10);
  }

  const maxHarvests = regrow ? Math.ceil((growingDays - days) / regrow) : Math.ceil((growingDays - days) / days);
  const minPurchases = regrow ? 1 : maxHarvests;
  const maxActiveDays = days + ((maxHarvests - 1) * regrow);
  const price = info.prices.seed
  const baseValue = info.prices.crop;
  const profitPerDay = ((maxHarvests * baseValue) - (minPurchases * price)) / growingDays;

  return {
    crop,
    days,
    price,
    value: baseValue,
    sales: maxHarvests,
    profit: profitPerDay,
    regrow,
    seasons: info.seasons,
    xp: info.xp,
  };
};


console.log(`\n= ${options.season.toUpperCase()} =`);

const crops = Crops.seasonal(options.season)
  .filter((crop) => {
    if (['sprinkler', 'fertilizer', 'cow'].includes(crop)) {
      return options.tools;
    }

    if (['rose', 'tulip', 'sunflower', 'wildflower'].includes(crop)) {
      return options.flowers;
    }

    return options.crops;
  })
  .map((crop) => getCropData(crop, options.season));

crops.sort((a, b) => b.profit - a.profit);

crops.forEach((crop) => {
  const {days, sales, profit, seasons, regrow, price, value, xp} = crop;
  const regrowth = regrow ? `(${regrow} to regrow)` : '';

  console.log(`${crop.crop}:`);
  console.log(`- grows in ${seasons.join(', ')}`);
  console.log(`- takes ${days} days to grow ${regrowth}`);
  console.log(`- can sell ${sales} this year`);
  console.log(`- buy for ${price}, sell for ${value}`);
  console.log(`- ${profit.toFixed(2)} cash per day`);
  console.log(`- ${xp * sales} XP this year`);
});
