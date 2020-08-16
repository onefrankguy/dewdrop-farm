const Farm = require('./farm');
const Renderer = require('./renderer');

const Game = {};

let farm;

Game.reset = () => {
  farm = Farm.create();
};

Game.play = () => {
  Game.reset();

  Renderer.invalidate(farm);
};

module.exports = Game;
