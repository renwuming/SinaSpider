const port = process.env.PORT || '7878'
const express = require('express')
const webpack = require('webpack')
const WebpackDevMiddleware = require('webpack-dev-middleware')
const WebpackHotMiddleware = require('webpack-hot-middleware')
const config = require('./webpack.dev.config')
const proxyMiddleware = require("http-proxy-middleware")
const utils = require("./utils")
const compiler = webpack(config)

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
  publicPath: config.output.publicPath,
  stats: { colors: true }
}))
app.use(WebpackHotMiddleware(compiler))


app.use(express.static('dist'));

const server = app.listen(port, function () {
  console.log(`Listening on ${port}`);
});
