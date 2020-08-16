const Utils = require('./utils');

let now = Utils.timestamp();
let dt = 0;
let last = Utils.timestamp();
let step = 1/20;

const onFrame = (update, render) => {
  const frame = () => {
    now = Utils.timestamp();
    dt += Math.min(1, (now - last) / 1000);
    while (dt > step) {
      dt -= step;
      if (update) {
        update(step);
      }
    }

    if (render) {
      render(dt);
    }

    last = now;
    requestAnimationFrame(frame);
  };

  return frame;
};

const Engine = {};

Engine.run = (update, render) => {
  requestAnimationFrame(onFrame(update, render));
};

module.exports = Engine;
