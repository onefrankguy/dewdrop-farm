const $ = require('./jquery');
const Rules = require('./rules');
const Farm = require('./farm');

const Renderer = {};

const renderTime = (farm) => {
  const day = Rules.day(farm);
  const season = Rules.season(farm);

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

const renderInventorySeeds = (crop) => {
  let html = '';
  html += '<span class="row tile seeds">';
  if (+crop.amount > 0) {
    html += `<span class="row amount sticker"><span class="inner">${crop.amount}</span></span>`;
  }
  html += `<span class="tile ${crop.type} stage6 small"></span>`;
  html += '</span>';
  return html;
};

const renderStoreSeeds = (crop) => {
  let html = '';
  html += '<span class="tile seeds small">';
  html += `<span class="tile ${crop.type} stage6 small"></span>`;
  html += '</span>';
  return html;
};

const renderStoreCrop = (crop, amount, type) => {
  const name = type === 'store' ? `${crop.type} ${crop.seed}` : crop.type;

  let html = '';
  html += '<div class="row crop">';
  if (type === 'store') {
    html += renderStoreSeeds(crop);
  } else {
    if (+amount > 0) {
      html += `<span class="row amount sticker"><span class="inner">${amount}</span></span>`;
    }
    html += `<span class="tile ${crop.type} stage6 small"></span>`;
  }
  html += `<span class="capitalize name">${name}</span>`;
  html += '</div>';
  return html;
};

const renderStoreRow = (crop, amount, type) => {
  const cash = type === 'store' ? crop.prices.seed : crop.prices.crop;

  let html = '';
  html += `<div class="row slot item" data-crop="${crop.type}">`;
  html += renderStoreCrop(crop, amount, type);
  html += renderCash(cash, amount);
  html += '</div>';
  return html;
};

const renderFarmPlotClasses = (farm, row, col) => {
  const upTilled = Farm.tilled(farm, {row: row - 1, col}) ? 1 : 0
  const downTilled = Farm.tilled(farm, {row: row + 1, col}) ? 1 : 0;
  const leftTilled = Farm.tilled(farm, {row, col: col - 1}) ? 1 : 0;
  const rightTilled = Farm.tilled(farm, {row, col: col + 1}) ? 1 : 0;

  const tilled = Farm.tilled(farm, {row, col}) ? 'till' : '';
  const stage = `stage${upTilled}${rightTilled}${downTilled}${leftTilled}`;

  return [tilled, stage].join(' ').trim();
};

const renderFarmCrop = (farm, row, col) => {
  const watered = Farm.watered(farm, {row, col});
  const crop = Farm.crop(farm, {row, col});

  if (!watered && !crop) {
    return '';
  }

  let html = '';

  if (watered) {
    html += '<div class="tile water">';
  }

  if (crop) {
    const klasses = ['tile', crop.crop];
    if (crop.stage) {
      klasses.push(`stage${crop.stage}`);
    }

    html += `<div class="${klasses.join(' ').trim()}"></div>`;
  }

  if (watered) {
    html += '</div>';
  }

  return html;
};

const renderFarm = (farm) => {
  let html = '';

  for (let row = 0; row < farm.rows; row += 1) {
    html += '<div class="row">';

    for (let col = 0; col < farm.cols; col += 1) {
      const plotClasses = renderFarmPlotClasses(farm, row, col);

      html += `<div class="tile plot ${plotClasses}" data-crop="p${row}${col}">`;
      html += renderFarmCrop(farm, row, col);
      html += '</div>';
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

  Rules.store(farm).slice(0, 5).forEach((crop) => {
    html += renderStoreRow(crop, 1, 'store');
  });

  if (!html) {
    html = renderNotFound('store');
  }

  return html;
};

const renderMarket = (farm) => {
  let html = '';

  Rules.market(farm).slice(0, 5).forEach((crop) => {
    const amount = farm.market[crop.type] || 0;

    html += renderStoreRow(crop, amount, 'market');
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
  farm.inventory.forEach((seed, index) => {
    let html  = '';

    if (seed) {
      html += renderInventorySeeds(seed);
      html += '<span></span>';
    } else {
      html += '<span class="tile"></span>';
      html += '<span></span>';
    }

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
