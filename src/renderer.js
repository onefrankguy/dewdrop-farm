const $ = require('./jquery');

const Renderer = {};

const renderFarm = (farm) => {
  console.log(farm);

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

Renderer.render = (farm) => {
  $('#farm').html(renderFarm(farm));
};

Renderer.invalidate = (farm) => {
  requestAnimationFrame(() => Renderer.render(farm));
};

module.exports = Renderer;
