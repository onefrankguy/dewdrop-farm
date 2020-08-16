const $ = require('./jquery');
const Farm = require('./farm');
const Renderer = require('./renderer');
const Rules = require('./rules');

const Game = {};

let farm;
let tool;

const offFarm = (_, event) => {
  if (event.target && event.target.matches('.plot') && event.target.id) {
    const [_, row, col] = event.target.id.split('');

    const action = {
      tool,
      row,
      col,
    };

    farm = Rules.play(farm, action);
    Renderer.invalidate(farm, tool);
  }
};

const onTool = (aTool) => () => {
  tool = aTool;

  Renderer.invalidate(farm, tool);
};

Game.reset = () => {
  farm = Farm.create();
  tool = 'hoe';
};

Game.play = () => {
  $('#hoe').click(onTool('hoe'));
  $('#water').click(onTool('water'));
  $('#plant').click(onTool('plant'));
  $('#buy').click(onTool('buy'));
  $('#sell').click(onTool('sell'));
  $('#farm').click(undefined, offFarm, offFarm);

  Game.reset();

  Renderer.invalidate(farm, tool);
};

module.exports = Game;
