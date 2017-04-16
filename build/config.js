const path = require('path');

module.exports = {
  build: {
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: './',
  },
  dev: {
    assetsSubDirectory: 'static',
  }
}
