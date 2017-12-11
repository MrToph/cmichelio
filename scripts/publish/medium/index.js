const argv = require('yargs').argv
const helpers = require('../common')
const remarkMedium = require('./remark-medium')

const publishToMedium = async pathsToPosts => {
  for (let path of pathsToPosts) {
    try {
      const transformedPost = await helpers.transformPostFromPath(
        path,
        remarkMedium
      )
      // console.log(transformedPost)
    } catch (ex) {
      console.log(ex)
    }
  }
}

module.exports = publishToMedium
