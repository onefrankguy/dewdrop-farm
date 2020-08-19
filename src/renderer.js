const $ = require('./jquery');
const Rules = require('./rules');

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

const renderTool = (tool) => {
  $(`#${tool}`).addClass('active');
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

  $('#time').html(Rules.time(farm));

  const newFarm = renderFarm(farm, tool);
  const oldFarm = $('#farm').html();

  if (newFarm !== oldFarm) {
    $('#farm').html(newFarm);
  }

  renderTool(tool);
};

Renderer.invalidate = (farm, tool) => {
  requestAnimationFrame(() => Renderer.render(farm, tool));
};

module.exports = Renderer;
