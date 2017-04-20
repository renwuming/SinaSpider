const port = process.env.PORT || '7878'
const path = require('path')
const express = require('express')
const webpack = require('webpack')
const WebpackDevMiddleware = require('webpack-dev-middleware')
const WebpackHotMiddleware = require('webpack-hot-middleware')
const webpackConfig = require('./webpack.dev.config')
const proxyMiddleware = require("http-proxy-middleware")
const compiler = webpack(webpackConfig)
const utils = require("./utils")
const config = require("./config")

const app = express();

const proxyTable = utils.proxyTable();
Object.keys(proxyTable).forEach(function (context) {
  let options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(context, options))
})

app.use(WebpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
  stats: { colors: true }
}))
app.use(WebpackHotMiddleware(compiler))

const assetsPath = path.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(assetsPath, express.static('static'));

const server = app.listen(port, function () {
  console.log(`Listening on ${port}`);
});
