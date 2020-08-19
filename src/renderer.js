const $ = require('./jquery');
const Rules = require('./rules');
const Crops = require('./crops');

const Renderer = {};

const renderFarmClasses = (farm, row, col) =>
  farm.land[row][col].map((land) => {
    const result = [land.crop || land.type];

    if (land.stage) {
      result.push(`stage${land.stage}`);
    }

    return result.join(' ');
  }).join(' ');

const renderFarm = (farm) => {
  let html = '';

  for (let row = 0; row < farm.rows; row += 1) {
    html += '<div class="row">';

    for (let col = 0; col < farm.cols; col += 1) {
      const klasses = renderFarmClasses(farm, row, col);

      html += `<div class="${klasses}" id="p${row}${col}"></div>`;
    }

    html += '</div>';
  }

  return html;
};

const renderMarket = (farm) => {
  let html = '<div>Market</div>';

  Object.keys(farm.market).forEach((type) => {
    const crop = Crops.info(type);
    const amount = farm.market[type];

    html += '<div class="item row">';
    html += `<span class="picture ${crop.type}"></span><span>${crop.name}</span>`;
    html += `<span class="amount">${amount}</span> &times; <span class="price">${crop.price}</span>`;
    html += '</div>';
  });

  Crops.seasonal('spring').forEach((crop) => {
    if (!farm.market[crop.type]) {
      html += '<div class="item row">';
      html += `<span class="picture ${crop.type}"></span><span>${crop.name}</span>`;
      html += `<span class="amount">0</span> x <span class="price">${crop.price}</span>`;
      html += '</div>';
    }
  });

  return html;
};

const renderTool = (tool) => {
  $(`#${tool}`).addClass('active');

  if (tool === 'buy') {
    $('#farm').addClass('hidden');
    $('#store').removeClass('hidden');
    $('#market').addClass('hidden');
    return;
  }

  if (tool === 'sell') {
    $('#farm').addClass('hidden');
    $('#store').addClass('hidden');
    $('#market').removeClass('hidden');
    return;
  }

  $('#farm').removeClass('hidden');
  $('#store').addClass('hidden');
  $('#market').addClass('hidden');
};

const renderIfChanged = (selector, newHtml) => {
  const element = $(selector);
  const oldHtml = element.html();

  if (newHtml !== oldHtml) {
    console.log({newHtml, oldHtml});
    element.html(newHtml);
  }
};

Renderer.clear = () => {
  $('#hoe').removeClass('active');
  $('#water').removeClass('active');
  $('#plant').removeClass('active');
  $('#buy').removeClass('active');
  $('#sell').removeClass('active');
};

Renderer.render = (farm, tool) => {
  Renderer.clear();
  renderTool(tool);

  $('#time').html(Rules.time(farm));

  renderIfChanged('#farm', renderFarm(farm, tool));
  renderIfChanged('#market', renderMarket(farm));
};

Renderer.invalidate = (farm, tool) => {
  requestAnimationFrame(() => Renderer.render(farm, tool));
};

module.exports = Renderer;
