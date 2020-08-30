const $ = require('./jquery');
const Rules = require('./rules');
const Farm = require('./farm');
const Crops = require('./crops');

const Renderer = {};

const renderClasses = (klasses) =>
  klasses.filter((klass) => klass).join(' ').trim();

const renderTime = (farm) => {
  const day = Farm.day(farm);
  const season = Farm.season(farm);

  return `Day ${day} of <span class="capitalize">${season}</span>`;
};

const renderCash = (cash) => {
  let html = '';
  html += '<div class="cash">';
  html += `<span class="value">${cash}</span>`;
  html += '<span class="tile cash"></span>';
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

const renderInventoryItem = (item) => {
  let html = '<span class="picture">';

  if (item) {
    if (item.seed) {
      html += '<span class="tile seeds"></span>';
      html += renderSticker(item.amount);
      html += `<span class="tile ${item.type} stage6 crop small"></span>`;
    } else {
      html += renderSticker(item.amount);
      html += `<span class="tile ${item.type} stage6 crop"></span>`;
    }
  }

  html += '</span>';

  return html;
};

const renderStoreSeeds = (item) => {
  let html = '';
  html += '<span class="tile seeds small">';
  html += `<span class="tile ${item.type} stage6 small"></span>`;
  html += '</span>';
  return html;
};

const renderStoreItem = (item) => {
  const crop = Crops.info(item.type);
  const name = item.seed ? `${crop.type} ${crop.seed}` : crop.type;

  let html = '';
  html += '<div class="row crop">';
  html += '<div class="picture">';
  if (item.seed) {
    html += '<span class="tile seeds"></span>';
    html += renderSticker(item.amount);
    html += `<span class="tile ${item.type} stage6 crop small"></span>`;
  } else {
    html += renderSticker(item.amount);
    html += `<span class="tile ${item.type} stage6 crop"></span>`;
  }
  html += '</div>';
  html += `<span class="capitalize name">${name}</span>`;
  html += '</div>';
  return html;
};

const renderStoreRow = (item) => {
  let html = '';
  html += `<div class="row slot item" data-crop="${item.type}" data-seed="${item.seed}">`;
  html += renderStoreItem(item);
  html += renderCash(item.cash);
  html += '</div>';
  return html;
};

const renderFarmPlotGround = (farm, row, col) => {
  const upTilled = Farm.tilled(farm, {row: row - 1, col}) ? 1 : 0
  const downTilled = Farm.tilled(farm, {row: row + 1, col}) ? 1 : 0;
  const leftTilled = Farm.tilled(farm, {row, col: col - 1}) ? 1 : 0;
  const rightTilled = Farm.tilled(farm, {row, col: col + 1}) ? 1 : 0;

  const tilled = Farm.tilled(farm, {row, col}) ? 'till' : '';
  const stage = `stage${upTilled}${rightTilled}${downTilled}${leftTilled}`;
  const klasses = renderClasses(['tile', 'ground', tilled, stage]);

  return `<div class="${klasses}"></div>`
};

const renderFarmPlotWater = (farm, row, col) => {
  let html = '';
  const water = Farm.watered(farm, {row, col});

  if (water) {
    const klasses = ['tile', 'water', water.rotate ? `rotate${water.rotate}` : ''];
    html += `<div class="${renderClasses(klasses)}"></div>`;
  }

  return html;
};

const renderFarmPlotCrop = (farm, row, col) => {
  let html = '';

  const crop = Farm.crop(farm, {row, col});

  if (crop) {
    const stage = crop.stage ? `stage${crop.stage}` : '';
    const klasses = renderClasses(['tile', 'crop', crop.crop, stage]);
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

  html += `<div class="tile plot" data-crop="p${row}${col}">`;
  html += renderFarmPlotGround(farm, row, col);
  html += renderFarmPlotWater(farm, row, col);
  html += renderFarmPlotBunny(farm, row, col);
  html += renderFarmPlotCrop(farm, row, col);
  html += '</div>';

  return html;
};

const renderFarm = (farm) => {
  let html = '';

  for (let row = 0; row < farm.rows; row += 1) {
    html += '<div class="row">';

    for (let col = 0; col < farm.cols; col += 1) {
      html += renderFarmPlot(farm, row, col);
    }

    html += '</div>';
  }

  return html;
};

const renderNotFound = (type) => {
  let html = '';
  let message = `The store is closed right now. Come back again later!`;

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

const renderTool = (tool, screen) => {
  $(`#${tool}`).addClass('active');
  $(`#${screen}`).addClass('active');

  if (screen === 'tend') {
    $('#farm').removeClass('hidden');
    $('#store').addClass('hidden');
    $('#market').addClass('hidden');
    return;
  }

  if (screen === 'buy') {
    $('#farm').addClass('hidden');
    $('#store').removeClass('hidden');
    $('#market').addClass('hidden');
    return;
  }

  if (screen === 'sell') {
    $('#farm').addClass('hidden');
    $('#store').addClass('hidden');
    $('#market').removeClass('hidden');
    return;
  }
};

const renderInventory = (farm) => {
  farm.inventory.forEach((item, index) => {
    const html  = renderInventoryItem(item);

    renderIfChanged(`#slot${index}`, html);
  });
};

const renderIfChanged = (selector, newHtml) => {
  const element = $(selector);
  const oldHtml = element.html();

  if (newHtml !== oldHtml) {
    console.log({
      oldHtml,
      newHtml,
    });

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
};

Renderer.invalidate = (farm, tool, screen) => {
  requestAnimationFrame(() => Renderer.render(farm, tool, screen));
};

module.exports = Renderer;
