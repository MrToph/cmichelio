const helpers = require('../common')
const remarkMedium = require('./remark-medium')
const client = require('./client')

const publishToMedium = async pathsToPosts => {
  console.log(`=========== MEDIUM ===========`)
  for (let path of pathsToPosts) {
    try {
      console.log(`----------- ${path.split('/').pop()} -----------`)
      const transformedPost = await helpers.transformPostFromPath(
        path,
        remarkMedium
      )
      // console.log(transformedPost)
      const { frontmatter, postUrl } = transformedPost
      console.log(
        `Creating post "${frontmatter.title}" (${postUrl}) on medium ...`
      )
      const response = await client.createPost(transformedPost)
      console.log(
        `Published to medium: ${response.url}\n${JSON.stringify(response)}`
      )
    } catch (ex) {
      console.log(ex)
    }
  }
}

module.exports = publishToMedium
