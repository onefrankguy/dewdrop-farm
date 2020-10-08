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

const distance = (color1, color2) => {
  const rmean = (color1.r + color2.r) / 2;
  const dr = color1.r - color2.r;
  const dg = color1.g - color2.g;
  const db = color1.b - color2.b;
  const r = (2 + (rmean / 256)) * dr * dr;
  const g = 4 * dg;
  const b = (2 + ((255 - rmean) / 256)) * db * db;

  return Math.sqrt(r + g + b);
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

const sortLuminance = (a, b) => b.luminance - a.luminance;

const paletteByLuminance = colors.slice().sort(sortLuminance);
const darkestColor = paletteByLuminance[paletteByLuminance.length - 1];

const sortDistance = (a, b) => {
  const da = distance(a, darkestColor);
  const db = distance(b, darkestColor);

  return db - da;
};

const sortPairs = (a, b) => {
  if (a.background.id === b.background.id) {
    return sortDistance(a.foreground, b.foreground);
  }

  return sortDistance(a.background, b.background);
};

const palette = colors.slice()
  .sort(sortDistance);

const aaaColorPairs = colorPairs
  .filter(({contrast}) => contrast >= 7)
  .sort(sortPairs);

const aaColorPairs = colorPairs
  .filter(({contrast}) => contrast < 7 && contrast >= 4.5)
  .sort(sortPairs);

const uiColorPairs = colorPairs
  .filter(({contrast}) => contrast < 4.5 && contrast >= 3)
  .sort(sortPairs);

const svg = [];
const tileWidth = 4;
const tileHeight = 4;
const svgWidth = (colors.length * tileWidth) / 2;
let dx = 0;
let dy = 0;
const fontSize = 8;
const fontFamily = 'monospace';

const drawColorPairs = (colorPairs, someDx, someDy) => {
  const svg = [];
  let dx = someDx;
  let dy = someDy;

  colorPairs.forEach((pair) => {
    const foreground = toCssRgb(pair.foreground);
    const background = toCssRgb(pair.background);

    svg.push(`<rect x="${dx}" y="${dy}" width="${tileWidth}" height="${tileHeight}" fill="${background}" fill-opacity="1" stroke="none"/>`);
    svg.push(`<rect x="${dx + (tileWidth / 4)}" y="${dy + (tileHeight / 4)}" width="${tileWidth / 2}" height="${tileHeight / 2}" fill="${foreground}" fill-opacity="1" stroke="none"/>`);
    
    dx += (tileWidth * 1.25);

    if (dx + tileWidth > svgWidth) {
      dx = 0;
      dy += (tileHeight * 1.25);
    }
  });
  dy += tileHeight;

  return {
    svg,
    dx,
    dy,
  };
};

dx = 0;
dy += fontSize;
svg.push(`<text x="${dx}" y="${dy}" font-family="${fontFamily}" font-size="${fontSize}">Palette</text>`);
palette.forEach((color) => {
  const fill = toCssRgb(color);

  svg.push(`<rect x="${dx}" y="${dy}" width="${tileWidth}" height="${tileHeight}" fill="${fill}" fill-opacity="1" stroke="none"/>`);

  dx += tileWidth;

  if (dx + tileWidth > svgWidth) {
    dx = 0;
    dy += tileHeight;
  }
});
dy += tileHeight;

dx = 0;
dy += fontSize;
svg.push(`<text x="${dx}" y="${dy}" font-family="${fontFamily}" font-size="${fontSize}">AAA - 7:1</text>`);
const aaaResult = drawColorPairs(aaaColorPairs, dx, dy);
svg.push(...aaaResult.svg);
dx = aaaResult.dx;
dy = aaaResult.dy;

dx = 0;
dy += fontSize;
svg.push(`<text x="${dx}" y="${dy}" font-family="${fontFamily}" font-size="${fontSize}">AA - 4.5:1</text>`);
const aaResult = drawColorPairs(aaColorPairs, dx, dy);
svg.push(...aaResult.svg);
dx = aaResult.dx;
dy = aaResult.dy;

dx = 0;
dy += fontSize;
svg.push(`<text x="${dx}" y="${dy}" font-family="${fontFamily}" font-size="${fontSize}">UI - 3:1</text>`);
const uiResult = drawColorPairs(uiColorPairs, dx, dy);
svg.push(...uiResult.svg);
dx = uiResult.dx;
dy = uiResult.dy;

dy += tileHeight;

const header = [
  '<?xml version="1.0" standalone="no"?>',
  `<svg width="${svgWidth}" height="${dy}" viewBox="0 0 ${svgWidth} ${dy}" xmlns="http://www.w3.org/2000/svg" version="1.1">`,
];
const footer = ['</svg>'];

const result = header.concat(svg).concat(footer);

console.log(result.join("\n"));
