const $ = require('./jquery');

const Game = {};

Game.play = () => {
  let html = '';

  for (let row = 0; row < 6; row += 1) {
    html += '<div class="row">';

    for (let col = 0; col < 6; col += 1) {
      html += `<div class="plot" id="p${row}${col}"></div>`;
    }

    html += '</div>';
  }

  $('#farm').html(html);
};

module.exports = Game;
