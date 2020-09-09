import fs from 'fs';
import {terser} from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import html from '@rollup/plugin-html';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import postcss from 'rollup-plugin-postcss';
import postcssClean from 'postcss-clean';
import imagemin from 'rollup-plugin-imagemin';
import imageminOptiPng from 'imagemin-optipng';

const htmlConfig = {
  template: ({files}) => {
    const scripts = files.js.map(({code}) => `<script>${code.toString().trim()}</script>`).join(`\n`);
    const styles = files.css.map(({source}) => `<style type="text/css">${source.toString().trim()}</style>`).join(`\n`);
    const htmlTemplate = fs.readFileSync('./src/index.html');
    const templateWithJs = htmlTemplate.toString().replace('</body>', `${scripts}</body>`);
    const templateWithCss = templateWithJs.toString().replace('</head>', `${styles}</head>`);

    return templateWithCss;
  },
};

const serveConfig = {
  contentBase: './dist',
  host: '127.0.0.1',
  port: 3000,
  headers: {
    'Cache-Control': 'no-store',
  },
};

const livereloadConfig = {
  watch: './dist',
  verbose: true,
};

const postcssCleanConfig = {
  level: 2,
};

const postcssConfig = {
  extract: true,
  modules: false,
  use: ['sass'],
  plugins: [
    postcssClean(postcssCleanConfig),
  ],
};

const imageminOptiPngConfig = {
  optimizationLevel: 7,
};

const imageminConfig = {
  fileName: '[name][extname]',
  imageminOptiPng: imageminOptiPng(imageminOptiPngConfig),
  plugins: {
    imageminOptiPng,
  }
};

const defaultPlugins = () => [
  commonjs(),
  terser(),
  postcss(postcssConfig),
  imagemin(imageminConfig),
  html(htmlConfig),
];

const devPlugins = () => [
  serve(serveConfig),
  livereload(livereloadConfig),
];

const rollupConfig = {
  input: './src/index.js',
  output: [{
    file: './dist/main.js',
    format: 'iife',
  }],
  plugins: [],
};

export default (args) => {
  const config = {
    ...rollupConfig,
    plugins: defaultPlugins(),
  };

  if (args.watch) {
    config.plugins = config.plugins.concat(devPlugins());
  }

  return config;
};
