const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunksHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');

module.exports = (_, argv) => {
  const isProduction = argv.mode === 'production';

  const config = {
    entry: './src',
    devtool: isProduction ? undefined : 'source-map',
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html',
      }),
      new InlineChunksHtmlPlugin(HtmlWebpackPlugin, ['main']),
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
