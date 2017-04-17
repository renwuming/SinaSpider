const utils = require('./utils')
const baseWebpackConfig = require('./webpack.base.config')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const vuxLoader = require("vux-loader")

const devWebpackConfig = merge(baseWebpackConfig, {
  entry: {
    app:[
      'webpack-hot-middleware/client'
    ],
  },
  module: {
    rules: utils.styleLoaders()
  },
  devtool: '#cheap-module-eval-source-map',
  devServer:{
    historyApiFallback:true,
    hot:true,
    inline:true,
    progress:true, // 报错无法识别，删除后也能正常刷新
  },
  plugins: [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  new HtmlWebpackPlugin({
    filename: "index.html",
    template: "index.html",
    inject: 'body'
  })
  ]
});

module.exports = vuxLoader.merge(devWebpackConfig, {
  plugins: ['vux-ui']
});
