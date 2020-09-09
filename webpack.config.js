const path = require('path');
const { env } = require('process');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const CLIENT_SRC = path.join(__dirname, 'src/client');
const DIST = path.join(__dirname, 'dist');

const jsLoader = {
  test: /\.js$/,
  use: 'babel-loader',
};

const cssLoader = {
  test: /\.css$/,
  use: ['style-loader', 'css-loader'],
};

const elmLoader = {
  test: /\.elm$/,
  exclude: [/elm-stuff/, /node_modules/],
  use: {
    loader: 'elm-webpack-loader',
    options: {
      optimize: env.NODE_ENV === 'production',
      debug: Boolean(env.DEBUG),
    },
  },
};

module.exports = {
  target: 'web',
  mode: env.NODE_ENV || 'development',
  entry: path.join(CLIENT_SRC, 'index.js'),
  output: {
    path: DIST,
    filename: '[name].bundle.js',
    publicPath: '/static',
  },
  module: {
    rules: [jsLoader, cssLoader, elmLoader],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /Main.elm/,
          name: 'elm',
          chunks: 'all',
        },
      },
    },
  },
  devtool: 'cheap-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(CLIENT_SRC, 'index.html'),
    }),
    new CleanWebpackPlugin(),
  ],
};
