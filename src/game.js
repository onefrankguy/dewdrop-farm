const $ = require('./jquery');
const Farm = require('./farm');
const Renderer = require('./renderer');
const Rules = require('./rules');
const Engine = require('./engine');

const Game = {};

let farm;
let tool;
let slot;

const offFarm = (_, event) => {
  if (event.target && event.target.matches('.plot') && event.target.id) {
    const [_, row, col] = event.target.id.split('');

    const action = {
      tool,
      row,
      col,
      slot,
    };

    farm = Rules.dispatch(farm, action);
    Renderer.invalidate(farm, tool);
  }
};

const onStore = (_, event) => {
  let element = event.target;

  while (element && !element.dataset.crop) {
    element = element.parentElement;
  }

  if (element && element.dataset.crop) {
    const action = {
      tool: 'buy',
      row: 0,
      col: 0,
      crop: element.dataset.crop,
    }

    farm = Rules.dispatch(farm, action);
    Renderer.invalidate(farm, tool);
  }
};

const onMarket = (_, event) => {
  let element = event.target;

  while (element && !element.dataset.crop) {
    element = element.parentElement;
  }

  if (element && element.dataset.crop) {
    const action = {
      tool: 'sell',
      row: 0,
      col: 0,
      crop: element.dataset.crop,
    }

    farm = Rules.dispatch(farm, action);
    Renderer.invalidate(farm, tool);
  }
};

const onTool = (aTool) => () => {
  tool = aTool;
  slot = ['slot0', 'slot1', 'slot2', 'slot3'].findIndex((type) => type === tool);

  if (slot < 0) {
    slot = undefined;
  }

  Renderer.invalidate(farm, tool);
};

const onUpdate = (dt) => {
  const action = {
    tool: 'update',
    row: 0,
    col: 0,
    dt,
  };

  farm = Rules.dispatch(farm, action);
  Renderer.invalidate(farm, tool);
};

const onRender = () => {
};

Game.reset = () => {
  farm = Farm.create();
  tool = 'hoe';
  crop = undefined;
};

Game.play = () => {
  $('#hoe').click(onTool('hoe'));
  $('#water').click(onTool('water'));
  $('#slot0').click(onTool('slot0'));
  $('#slot1').click(onTool('slot1'));
  $('#slot2').click(onTool('slot2'));
  $('#slot3').click(onTool('slot3'));
  $('#buy').click(onTool('buy'));
  $('#sell').click(onTool('sell'));
  $('#store').click(onStore);
  $('#market').click(onMarket);
  $('#farm').click(undefined, offFarm, offFarm);

  Game.reset();
  Engine.run(onUpdate, onRender);

  Renderer.invalidate(farm, tool);
};

module.exports = Game;
