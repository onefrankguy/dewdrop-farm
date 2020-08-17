const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunksHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (_, argv) => {
  const isProduction = argv.mode === 'production';

  const config = {
    entry: './src',
    devtool: isProduction ? undefined : 'eval-cheap-source-map',
    module: {
      rules: [{
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      }, {
        test: /\.png$/,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                enabled: false,
              },
              optipng: {
                enabled: true,
              },
              pngquant: {
                enabled: false,
              },
              svgo: {
                enabled: false,
              },
              gifsicle: {
                enabled: false,
              },
            },
          },
        ],
      }],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html',
      }),
      new InlineChunksHtmlPlugin(HtmlWebpackPlugin, ['main']),
      new MiniCssExtractPlugin(),
    ],
    devServer: {
      host: '127.0.0.1',
      port: 3000,
      stats: 'minimal',
      overlay: {
        warnings: true,
        errors: true,
      },
      contentBase: path.join(__dirname, 'dist'),
      watchContentBase: true,
    },
  };

  return config;
};
