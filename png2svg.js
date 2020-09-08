#!/usr/bin/env node

const fs = require('fs');
const PNG = require('pngjs').PNG;

const inputSize = process.argv[2];
const inputFile = process.argv[3];

const data = fs.readFileSync(inputFile);
const png = PNG.sync.read(data);

const tileHeight = inputSize[1]
  .split('x')
  .map((value) => parseInt(value, 10));

const pixels = [];

for (let y = 0; y < png.height; y += 1) {
  for (let x = 0; x < png.width; x += 1) {
    const i = (png.width * y + x) * 4;
    const r = png.data[i + 0];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    const a = png.data[i + 3];

    const fill = `rgb(${r}, ${g}, ${b})`;
    const opacity = a / 255;

    const newX = png.width * Math.floor(y / tileHeight) + x;
    const newY = y % tileHeight;

    pixels.push({
      x: newX,
      y: newY,
      fill,
      opacity,
    });
  }
}

const svgWidth = Math.max(...pixels.map(({x}) => x)) + 1;
const svgHeight = Math.max(...pixels.map(({y}) => y)) + 1;

const svg = [];

svg.push('<?xml version="1.0" standalone="no"?>');
svg.push(`<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" version="1.1">`);

pixels.forEach(({x, y, fill, opacity}) => {
  svg.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${fill}" fill-opacity="${opacity}" stroke="none"/>`);
});

svg.push('</svg>');

console.log(svg.join("\n"));