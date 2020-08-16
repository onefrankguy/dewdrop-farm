const $ = require('./jquery');

const Renderer = {};

const renderFarm = (farm) => {
  let html = '';

  for (let row = 0; row < farm.rows; row += 1) {
    html += '<div class="row">';

    for (let col = 0; col < farm.cols; col += 1) {
      const klasses = farm.land[row][col].join(' ');

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

  $('#farm').html(renderFarm(farm, tool));

  renderTool(tool);
};

Renderer.invalidate = (farm, tool) => {
  requestAnimationFrame(() => Renderer.render(farm, tool));
};

module.exports = Renderer;
