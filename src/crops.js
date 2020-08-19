const Utils = require('./utils');

const Crops = {};

const dictionary = {
  strawberry: {
    stages: [0, 1, 1, 2, 2, 2],
  },
};

Crops.info = (type) => Utils.clone(dictionary[type]);

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
