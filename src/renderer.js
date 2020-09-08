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

const renderLevel = (farm) => {
  const level = Farm.level(farm);

  return `<span class="level">Level ${level}</span>`;
};

const renderCash = (cash) => {
  const value = new Intl.NumberFormat().format(cash);
  let html = '';

  html += '<div class="cash">';
  html += `<span class="value">${value}</span>`;
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
  const crop = Crops.info(item.type);
  const name = item.seed ? `${crop.type} ${crop.seed}` : crop.type;

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
  html += `<span class="capitalize name">${name}</span>`;
  html += '</div>';
  return html;
};

const renderStoreCash = ({type, seed, cash}) => {
  let html = '';

  html += '<span class="col center">';
  html += `<span class="register" data-crop="${type}" data-seed="${seed}">`;
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

  const crop = Farm.crop(farm, {row, col});

  if (crop) {
    const stage = crop.stage ? `stage${crop.stage}` : '';
    const rotate = crop.rotate ? `rotate${crop.rotate}` : '';
    const klasses = renderClasses(['tile', 'crop', crop.crop, stage, rotate]);
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
};

Renderer.render = (farm, tool, screen) => {
  Renderer.clear();
  renderTool(tool, screen);
  renderInventory(farm);
  renderIfChanged('#time', renderTime(farm));
  renderIfChanged('#level', renderLevel(farm));
  renderIfChanged('#cash', renderCash(farm.cash));
  renderIfChanged('#farm', renderFarm(farm));
  renderIfChanged('#store', renderStore(farm));
  renderIfChanged('#market', renderMarket(farm));
};

Renderer.invalidate = (farm, tool, screen) => {
  requestAnimationFrame(() => Renderer.render(farm, tool, screen));
};

module.exports = Renderer;
