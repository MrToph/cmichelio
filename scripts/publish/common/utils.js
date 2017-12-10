const path = require('path')
const fs = require('fs')

module.exports = {
  postExistsLocally: filePath => {
    return fs.existsSync(filePath)
  },
  prefixLocalRelativePaths: relativePath => {
    return path.posix.normalize(path.posix.join('src/pages', relativePath))
  },
  slugFromPath: filePath => {
    // should be the same logic as in gatsby-node.js
    const pathRelativeToPages = path.posix.relative('src/pages', filePath)
    // return only the first folder/file, up to first slash (including)
    const matches = /^[\s\S]+?\//.exec(pathRelativeToPages)
    if(!matches) throw new Error(`Could not get slug from path for path "${filePath}" ("${pathRelativeToPages}")`)
    return matches[0]
  },
}
