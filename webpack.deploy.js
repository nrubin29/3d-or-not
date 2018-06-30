const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/docs'
  },
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  module: {
    rules: [
      {test: /\.tsx?$/, loader: 'awesome-typescript-loader'},
      {test: /\.s?css$/, use: ['style-loader', 'css-loader', 'sass-loader']},
      {enforce: 'pre', test: /.js$/, loader: 'source-map-loader'}
    ]
  },
  node: {
    fs: 'empty'
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'public/model.bin', to: '.' }
    ]),
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      favicon: 'public/favicon.ico'
    })
  ]
};