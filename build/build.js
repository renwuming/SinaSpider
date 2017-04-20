require('shelljs/global')

var path = require('path')
var config = require('./config')
var webpack = require('webpack')
var webpackConfig = require('./webpack.prod.config')


var assetsPath = path.join(config.build.assetsRoot, config.build.assetsSubDirectory)
rm('-rf', assetsPath)
mkdir('-p', assetsPath)
cp('-R', 'static/*', assetsPath)


webpack(webpackConfig, function (err, stats) {
  if (err) throw err
  process.stdout.write(stats.toString({
    colors: true
  }) + '\n')
})
