// import generateFeed from './src/scripts/feed.js';

exports.modifyWebpackConfig = function(config, env) {
  // config.removeLoader('svg')
  // config.loader('svg', function(cfg) {
  //   cfg.test = /\.svg$/
  //   cfg.loader = 'svg-inline-loader'
  //   return cfg
  // })
  return config
}

exports.postBuild = function(pages, callback) {
  // generateFeed(pages);
  callback();
}
