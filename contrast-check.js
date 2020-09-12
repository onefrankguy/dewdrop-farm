#!/usr/bin/env node

const fs = require('fs');
const PNG = require('pngjs').PNG;

const inputFile = process.argv[2];

const data = fs.readFileSync(inputFile);
const png = PNG.sync.read(data);
const colors = [];

const toHex = (value) => {
  const hex = value.toString(16);

  return hex.length > 1 ? hex : `0${hex}`;
}

const toHexColor = (r, g, b, a) => `${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;

const toCssRgb = ({r, g, b}) => `rgb(${r}, ${g}, ${b})`;

const luminance = (r, g, b) => {
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;

  const lR = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
  const lG = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
  const lB = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);

  return 0.2126 * lR + 0.7152 * lG + 0.0722 * lB;
};

for (let y = 0; y < png.height; y += 1) {
  for (let x = 0; x < png.width; x += 1) {
    const i = (png.width * y + x) * 4;
    const r = png.data[i + 0];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    const a = png.data[i + 3];

    colors.push({
      id: toHexColor(r, g, b, a),
      r,
      g,
      b,
      a,
      luminance: luminance(r, g, b),
    });
  }
}

const svg = [];
const tileWidth = 32;
const tileHeight = 32;
const svgWidth = colors.length * tileWidth
const svgHeight = tileHeight;

svg.push('<?xml version="1.0" standalone="no"?>');
svg.push(`<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg" version="1.1">`);

colors
  .sort((a, b) => b.luminance - a.luminance) 
  .forEach((color, index) => {
    const x = index * tileWidth;
    const fill = toCssRgb(color);
    const opacity = 1;

    svg.push(`<rect x="${x}" y="0" width="${tileWidth}" height="${tileHeight}" fill="${fill}" fill-opacity="${opacity}" stroke="none"/>`);
    svg.push(`<text x="${x}" y="${tileHeight / 2}" textLength="${tileWidth}" lengthAdjust="spacingAndGlyphs">${fill}</text>`);
  });

svg.push('</svg>');

console.log(svg.join("\n"));

/*
const colorPairs = [];

colors.forEach((foreground) => {
  colors.forEach((background) => {
    if (foreground.id !== background.id) {
      const lighter = foreground.luminance > background.luminance ? foreground : background;
      const darker = foreground.luminance < background.luminance ? foreground : background;
      const contrast = (lighter.luminance + 0.05) / (darker.luminance + 0.05);
      const pairId = `${background.id}-${foreground.id}`;

      if (!colorPairs.find(({id}) => id === pairId)) {
        colorPairs.push({
          id: pairId,
          foreground,
          background,
          contrast,
        })
      }
    }
  });
});

colorPairs.forEach((pair) => {
  if (pair.contrast >= 3) {
    console.log(`${toCssRgb(pair.foreground)} ${toCssRgb(pair.background)}`);
  }
});
*/