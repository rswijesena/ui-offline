const path = require('path');

module.exports = {
  entry: './js/index.js',
  devtool: 'inline-source-map',
  module: {
    noParse: [new RegExp('node_modules/localforage/dist/localforage.js')],
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'ui-offline.js',
    path: path.resolve(__dirname, '../ui-html5/build/js')
  }
};