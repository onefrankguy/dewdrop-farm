const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunksHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlInlineCssWebpackPlugin = require('html-inline-css-webpack-plugin').default;

module.exports = (_, argv) => {
  const isProduction = argv.mode === 'production';

  const config = {
    entry: './src',
    devtool: isProduction ? undefined : 'source-map',
    module: {
      rules: [{
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      }],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html',
      }),
      new InlineChunksHtmlPlugin(HtmlWebpackPlugin, ['main']),
      new MiniCssExtractPlugin(),
      new HtmlInlineCssWebpackPlugin(),
    ],
    devServer: {
      host: '127.0.0.1',
      port: 3000,
      stats: 'minimal',
      overlay: {
        warnings: true,
        errors: true,
      },
      watchContentBase: true,
    },
  };

  return config;
};
