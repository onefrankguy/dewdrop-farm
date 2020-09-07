#!/usr/bin/env node

const fs = require('fs');
const PNG = require('pngjs').PNG;

const inputFile = process.argv[2];
const inputData = fs.readFileSync(inputFile);
const png = PNG.sync.read(inputData);

const colorKeys = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const colors = {};

const toHex = (value) => {
  const hex = value.toString(16);

  return hex.length > 1 ? hex : `0${hex}`;
}

const toHexColor = (r, g, b) => `${toHex(r)}${toHex(g)}${toHex(b)}`;

const pixels = [];

for (let y = 0; y < png.height; y += 1) {
  for (let x = 0; x < png.width; x += 1) {
    const i = (png.width * y + x) * 4;
    const r = png.data[i + 0];
    const g = png.data[i + 1];
    const b = png.data[i + 2];

    const color = toHexColor(r, g, b);
    let colorIndex = colors[color];

    if (!colorIndex) {
      const usedKeys = Object.values(colors);

      colorIndex = colorKeys.find((key) => !usedKeys.includes(key));
      colors[color] = colorIndex;
    }

    pixels.push(colorIndex);
  }
}

const rleAppend = (char, count) => {
  const value = count > 1 ? count.toString() : '';

  return `${value}${char}`;
};

const rleEncode = (data) => {
  let count = 0;
  let char = '';
  let result = '';

  data.forEach((letter) => {
    count += 1;
    if (letter === char) {
      return;
    }
    if (char !== '') {
      result += rleAppend(char, count);
    }
    char = letter;
    count = 0;
  });

  result += rleAppend(char, count + 1);

  return result;
};

const data = [];

data.push(png.width);
data.push(png.height);
data.push(Object.keys(colors).map((color) => `${colors[color]}${color}`).join(''));
data.push(rleEncode(pixels));

const code = [];

code.push(`const image = '${data.join(',')}';`)
code.push(`
const rleDecode = (data) => {
  let count = '';
  let result = '';

  data.forEach((char) => {
    if (char.match(/\\d/)) {
      count += char;
      return;
    }

    count = count ? parseInt(count, 10) : 1;

    for (let i = 0; i < count; i += 1) {
      result += char;
    }

    count = '';
  });

  return result;
};
`);

code.push(`
const svgDecode = (imageData) => {
  let [width, height, colorData, pixels] = imageData.split(',');

  const colors = {};
  colorData.match(/.{1,7}/g).forEach((color) => {
    const key = color.substr(0, 1);
    const value = color.substr(1);
    colors[key] = value;
  });

  pixels = rleDecode(pixels.split(''));
  pixels = pixels.split('');

  let svg = [];
  // svg.push('<?xml version="1.0" standalone="no"?>');
  svg.push(\`<svg width="\${width}" height="\${height}" xmlns="http://www.w3.org/2000/svg" version="1.1">\`);
  let pixelIndex = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const colorIndex = pixels[pixelIndex];
      const fill = colors[colorIndex];
      const opacity = fill !== '000000' ? 1 : 0;

      svg.push(\`<rect x="\${x}" y="\${y}" width="1" height="1" fill="#\${fill}" fill-opacity="\${opacity}" stroke="none"/>\`);
      pixelIndex += 1;
    }
  }

  svg.push('</svg>');

  return svg.join('');
};
`);

code.push(`
const svg = btoa(svgDecode(image));
const styles = \`.tile { background-image: url('data:image/svg+xml;base64,\${svg}'); }\`;
const css = document.createElement('style');
css.type = 'text/css';
css.appendChild(document.createTextNode(styles));
document.getElementsByTagName('head')[0].appendChild(css);
`);

const script = [];

script.push('<script type="text/javascript">');
script.push(code.join("\n"));
script.push('</script>');

console.log(script.join("\n"));