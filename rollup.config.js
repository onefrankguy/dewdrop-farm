import fs from 'fs';
import {terser} from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import html from '@rollup/plugin-html';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import postcss from 'rollup-plugin-postcss';
import postcssClean from 'postcss-clean';
import postcssUrl from 'postcss-url';
import {minify} from 'html-minifier-terser';

const htmlMinifierTerserConfig = {
  collapseBooleanAttributes: true,
  collapseWhitespace: true,
  decodeEntities: true,
  removeAttributeQuotes: true,
  removeComments: true,
  removeEmptyAttributes: true,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
  sortAttributes: true,
  sortClassName: true,
  useShortDoctype: true,
};

const htmlConfig = {
  template: ({files}) => {
    const scripts = files.js.map(({code}) => `<script>${code.toString().trim()}</script>`).join(`\n`);
    const styles = files.css.map(({source}) => `<style>${source.toString().trim()}</style>`).join(`\n`);
    const htmlTemplate = fs.readFileSync('./src/index.html');
    const templateWithJs = htmlTemplate.toString().replace('</body>', `${scripts}</body>`);
    const templateWithCss = templateWithJs.toString().replace('</head>', `${styles}</head>`);

    return minify(templateWithCss, htmlMinifierTerserConfig);
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
  watch: ['./src', './img'],
  verbose: true,
};

const postcssCleanConfig = {
  level: 2,
};

const postcssUrlConfig = {
  url: 'inline',
};

const postcssConfig = {
  extract: true,
  modules: false,
  use: ['sass'],
  plugins: [
    postcssUrl(postcssUrlConfig),
    postcssClean(postcssCleanConfig),
  ],
};

const defaultPlugins = () => [
  commonjs(),
  terser(),
  postcss(postcssConfig),
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
