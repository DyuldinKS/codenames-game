const path = require('path');

const CLIENT_SRC = path.join(__dirname, 'src/client');

module.exports = {
  mode: 'development',
  entry: path.join(CLIENT_SRC, 'index.js'),
  output: {
    path: CLIENT_SRC,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        resource: {
          test: /\.js$/,
        },
        use: 'babel-loader',
      },
    ],
  },
};
