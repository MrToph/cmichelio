const argv = require('yargs').argv
const helpers = require('./common')

const publishToMedium = async pathsToPosts => {
  for(let path of pathsToPosts) {
    try {
      const normalizedMarkdownPosts = await helpers.pathToNormalizedMarkdownAST(path)
    } catch(ex) {
      console.log(ex)
    }
  }
}

module.exports = publishToMedium
