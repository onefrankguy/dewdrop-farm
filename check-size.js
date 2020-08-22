#!/usr/bin/env node

const fs = require('fs');

const MAX = 13 * 1024;

const numberFormatter = new Intl.NumberFormat();
const numberFormat = (value) => numberFormatter.format(value);

fs.stat('game.zip', (error, stats) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  const bytes = stats.size;
  const percent = ((bytes * 100) / MAX).toFixed(2);

  console.log(`${numberFormat(bytes)} bytes used (${percent}%).`);
  console.log(`${numberFormat(MAX - bytes)} bytes remaining.`);

  if (bytes > MAX) {
    console.error('zip file is too big!');
    process.exit(2);
  }
});
