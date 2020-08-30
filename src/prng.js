const Utils = require('./utils');

const PRNG = {};

let s1 = Utils.timestamp();
let s2 = Utils.timestamp();
let s3 = Utils.timestamp();

const clamp = (value) => Math.min(Math.max(1, value), 30000);

PRNG.random = () => {
  s1 = (171 * s1) % 30269;
  s2 = (172 * s2) % 30307;
  s3 = (170 * s3) % 30323;

  return ((s1 / 30269) + (s2 / 30307) + (s3 / 30323)) % 1;
};

PRNG.seed = (v1, v2, v3) => {
  s1 = clamp(v1 ? v1 : Utils.timestamp());
  s2 = clamp(v2 ? v2 : Utils.timestamp());
  s3 = clamp(v3 ? v3 : Utils.timestamp());
};

PRNG.shuffle = (array) => {
  const result = array.slice();

  let m = result.length;
  let t;
  let i;

  while (m > 0) {
    i = Math.floor(PRNG.random() * m);
    m -= 1;
    t = result[m];
    result[m] = result[i];
    result[i] = t;
  }

  return result;
};

PRNG.between = (min, max) => PRNG.random() * (max - min) + min;

PRNG.pick = (list) =>
  list ? list[Math.floor(PRNG.random() * list.length)] : undefined;

module.exports = PRNG;
