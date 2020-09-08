#!/usr/bin/env node

const season = process.argv[2] || 'spring';
const SEASONS = ['spring', 'summer', 'fall', 'winter'];

const Crops = require('./src/crops');

const getCropData = (crop, season) => {
  const x = Math.max(0, parseInt(process.argv[3], 10));
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
    xp: info.xp,
  };
};


console.log(`\n= ${season.toUpperCase()} =`);

const crops = Crops.seasonal(season).map((crop) => getCropData(crop, season));
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
