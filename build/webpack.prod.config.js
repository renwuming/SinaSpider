const utils = require('./utils');
const baseWebpackConfig = require('./webpack.base.config')
const webpack = require('webpack');
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin');

const vuxLoader = require("vux-loader")

const prodWebpackConfig = merge(baseWebpackConfig, {
  output: {
    publicPath: "./"
  },
  module: {
    rules: utils.styleLoaders()
  },
  devtool: false,
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "index.html",
      inject: 'body',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
    })
  ]
});

module.exports = vuxLoader.merge(prodWebpackConfig, {
  plugins: ['vux-ui']
});
