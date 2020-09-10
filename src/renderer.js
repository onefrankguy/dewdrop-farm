const $ = require('./jquery');
const Farm = require('./farm');
const Crops = require('./crops');

const Renderer = {};

const renderClasses = (klasses) =>
  klasses.filter((klass) => klass).join(' ').trim();

const renderNth = (value) => {
  if (value > 3 && value < 21) {
    return 'th';
  }
  switch (value % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

const renderTime = (farm) => {
  const day = Farm.day(farm);
  const season = Farm.season(farm);

  return `<span class="capitalize">${season}</span> ${day}<sup>${renderNth(day)}</sup>`;
};

const renderNumber = (value) =>
  new Intl.NumberFormat().format(value);

const renderCash = (cash) => {
  let html = '';

  html += '<div class="cash">';
  html += `<span class="value">${renderNumber(cash)}</span>`;
  html += '<span class="tile coins"></span>';
  html += '</div>';

  return html;
};

const renderSticker = (amount) => {
  let html = '';

  if (+amount > 0) {
    html += `<span class="tile amount sticker"><span class="inner">${amount}</span></span>`;
  }

  return html;
};

const renderKey = (key) => {
  let html = '';

  if (key !== undefined) {
    html += `<kbd class="key">${key}</kbd>`;
  }

  return html;
};

const renderInventoryItem = (item) => {
  let html = '<span class="picture">';

  if (item) {
    if (item.seed) {
      html += '<span class="tile seeds"></span>';
      html += `<span class="tile ${item.type} stage6 crop small"></span>`;
      html += renderSticker(item.amount);
      html += renderKey(item.key);
    } else {
      html += `<span class="tile ${item.type} stage6 crop"></span>`;
      html += renderSticker(item.amount);
      html += renderKey(item.key);
    }
  }

  html += '</span>';

  return html;
};

const renderStoreItem = (item) => {
  const info = Crops.info(item.type);
  const name = item.seed ? `${info.type} ${info.seed}` : info.type;

  let html = '';

  html += '<div class="row crop">';
  html += '<div class="picture">';
  if (item.seed) {
    html += '<span class="tile seeds"></span>';
    html += `<span class="tile ${item.type} stage6 crop small"></span>`;
    html += renderSticker(item.amount);
  } else {
    html += `<span class="tile ${item.type} stage6 crop"></span>`;
    html += renderSticker(item.amount);
  }
  html += '</div>';

  html += '<div class="col">';
  if (item.disabled) {
    html += '<span class="capitalize name">404 Not Found</span>';
    html += `<span class="unlock"><span class="capitalize">${name}</span> available at Level&nbsp;${item.disabled}</span>`;
  } else {
    html += `<span class="capitalize name">${name}</span>`;
  }
  html += '</div>';

  html += '</div>';

  return html;
};

const renderStoreCash = ({type, seed, cash, disabled}) => {
  let html = '';
  const klasses = ['register', disabled ? 'disabled' : ''];

  html += '<span class="col center">';
  html += `<span class="${renderClasses(klasses)}" data-crop="${type}" data-seed="${seed}">`;
  html += renderCash(cash);
  html += '</span>';
  html += '</span>';

  return html;
};

const renderStoreRow = (item) => {
  let html = '';

  html += '<div class="row slot item">';
  html += renderStoreItem(item);
  html += renderStoreCash(item);
  html += '</div>';

  return html;
};

const renderFarmPlotGround = (farm, row, col) => {
  const klasses = ['tile', 'ground'];
  const tilled = Farm.tilled(farm, {row, col}) ? 'till' : '';

  if (tilled) {
    const upTilled = Farm.tilled(farm, { row: row - 1, col }) ? 1 : 0
    const downTilled = Farm.tilled(farm, { row: row + 1, col }) ? 1 : 0;
    const leftTilled = Farm.tilled(farm, { row, col: col - 1 }) ? 1 : 0;
    const rightTilled = Farm.tilled(farm, { row, col: col + 1 }) ? 1 : 0;
    const stage = `stage${upTilled}${rightTilled}${downTilled}${leftTilled}`;

    klasses.push(tilled);
    klasses.push(stage);
  } else {
    const grass = Farm.grass(farm, {row, col});
    const rotate = (grass && grass.rotate) ? `rotate${grass.rotate}` : '';

    klasses.push(rotate);
  }

  return `<div class="${renderClasses(klasses)}"></div>`
};

const renderFarmPlotFertilizer = (farm, row, col) => {
  const fertilizer = Farm.fertilized(farm, {row, col});

  if (fertilizer) {
    const rotate = fertilizer.rotate ? `rotate${fertilizer.rotate}` : '';
    const klasses = ['tile', 'fertilizer', rotate];

    return `<div class="${renderClasses(klasses)}"></div>`
  }

  return '';
};

const renderFarmPlotWater = (farm, row, col) => {
  let html = '';
  const water = Farm.watered(farm, {row, col});

  if (water) {
    const rotate = water.rotate ? `rotate${water.rotate}` : '';
    const klasses = renderClasses(['tile', 'water', rotate]);
    html += `<div class="${klasses}"></div>`;
  }

  return html;
};

const renderFarmPlotCrop = (farm, row, col) => {
  let html = '';

  const plant = Farm.planted(farm, {row, col});

  if (plant) {
    const stage = plant.stage ? `stage${plant.stage}` : '';
    const rotate = plant.rotate ? `rotate${plant.rotate}` : '';
    const klasses = renderClasses(['tile', 'crop', plant.crop, stage, rotate]);
    html += `<div class="${klasses}"></div>`;
  }

  return html;
};

const renderFarmPlotBunny = (farm, row, col) => {
  let html = '';

  const bunny = Farm.bunny(farm, {row, col});

  if (bunny) {
    const klasses = ['tile', 'bunny', 'animal', bunny.rotate ? `rotate${bunny.rotate}` : ''];
    html += `<div class="${renderClasses(klasses)}"></div>`;
  }

  return html;
};

const renderFarmPlot = (farm, row, col) => {
  let html = '';

  html += `<div class="tile plot" data-crop="${row}${col}">`;
  html += renderFarmPlotGround(farm, row, col);
  html += renderFarmPlotFertilizer(farm, row, col);
  html += renderFarmPlotCrop(farm, row, col);
  html += renderFarmPlotWater(farm, row, col);
  html += renderFarmPlotBunny(farm, row, col);
  html += '</div>';

  return html;
};

const renderFarm = (farm) => {
  let html = '';

  for (let row = 0; row < farm.rows; row += 1) {
    for (let col = 0; col < farm.cols; col += 1) {
      html += renderFarmPlot(farm, row, col);
    }
  }

  return html;
};

const renderNotFound = (type) => {
  let html = '';
  let message = '';

  if (type === 'market') {
    message = `It looks like you don't have any crops to sell. You can use seeds to grow crops.`;
  }

  html += '<div class="slot">';
  html += '<div class="center title">404 Not Found</div>';
  html += `<div class="message">${message}</div>`;
  html += '</div>';

  return html;
};

const renderStore = (farm) => {
  let html = '';

  Farm.store(farm).forEach((item) => {
    html += renderStoreRow(item);
  });

  if (!html) {
    html = renderNotFound('store');
  }

  return html;
};

const renderMarket = (farm) => {
  let html = '';

  Farm.market(farm).forEach((item) => {
    html += renderStoreRow(item);
  });

  if (!html) {
    html = renderNotFound('market');
  }

  return html;
};

const renderInformation = (farm) => {
  let html = '';

  const level = Farm.level(farm);
  const [xp, needed] = Farm.xp(farm).map(renderNumber);
  const luck = Math.floor(Farm.luck(farm) * 100);

  html += `<div>Level: ${level}</div>`;
  html += `<div>Experience: ${xp} / ${needed}</div>`;
  html += `<div>Luck: ${luck}%</div>`;

  return html;
};

const renderTool = (tool, screen) => {
  $(`#${tool}`).addClass('active');
  $(`#${screen}`).addClass('active');

  if (screen === 'tend') {
    $('#farm').removeClass('hidden');
    $('#store').addClass('hidden');
    $('#market').addClass('hidden');
    $('#info').addClass('hidden');
    return;
  }

  if (screen === 'buy') {
    $('#farm').addClass('hidden');
    $('#store').removeClass('hidden');
    $('#market').addClass('hidden');
    $('#info').addClass('hidden');
    return;
  }

  if (screen === 'sell') {
    $('#farm').addClass('hidden');
    $('#store').addClass('hidden');
    $('#market').removeClass('hidden');
    $('#info').addClass('hidden');
    return;
  }

  if (screen === 'geek') {
    $('#farm').addClass('hidden');
    $('#store').addClass('hidden');
    $('#market').addClass('hidden');
    $('#info').removeClass('hidden');
    return;
  }
};

const renderInventory = (farm) => {
  farm.inventory.forEach((item, index) => {
    const html  = renderInventoryItem({
      ...item,
      key: index + 3,
    });

    renderIfChanged(`#slot${index}`, html);
  });
};

const renderIfChanged = (selector, newHtml) => {
  const element = $(selector);
  const oldHtml = element.html();

  if (newHtml !== oldHtml) {
    element.html(newHtml);
  }
};

Renderer.clear = () => {
  $('#hoe').removeClass('active');
  $('#water').removeClass('active');
  $('#slot0').removeClass('active');
  $('#slot1').removeClass('active');
  $('#slot2').removeClass('active');
  $('#slot3').removeClass('active');
  $('#tend').removeClass('active');
  $('#buy').removeClass('active');
  $('#sell').removeClass('active');
  $('#geek').removeClass('active');
  $('#season').removeClass('spring').removeClass('summer').removeClass('fall').removeClass('winter');
};

Renderer.render = (farm, tool, screen) => {
  Renderer.clear();
  renderTool(tool, screen);
  renderInventory(farm);
  renderIfChanged('#time', renderTime(farm));
  renderIfChanged('#cash', renderCash(farm.cash));
  renderIfChanged('#farm', renderFarm(farm));
  renderIfChanged('#store', renderStore(farm));
  renderIfChanged('#market', renderMarket(farm));
  renderIfChanged('#information', renderInformation(farm));
  $('#season').addClass(Farm.season(farm));
};

Renderer.invalidate = (farm, tool, screen) => {
  requestAnimationFrame(() => Renderer.render(farm, tool, screen));
};

module.exports = Renderer;
