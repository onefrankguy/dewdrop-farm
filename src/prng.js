const PRNG = {};

PRNG.random = Math.random;

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
