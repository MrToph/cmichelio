const helpers = require('../common')
const remarkSteem = require('./remark-steem')
const client = require('./client')

const publishToSteem = async (pathsToPosts, dryRun) => {
  console.log(`=========== STEEM ===========`)
  for (let path of pathsToPosts) {
    try {
      console.log(`----------- ${path.split('/').pop()} -----------`)
      const transformedPost = await helpers.transformPostFromPath(
        path,
        remarkSteem
      )

      const { frontmatter, postUrl, content } = transformedPost

      if (dryRun) {
        console.log(content)
        return
      }

      console.log(
        `Checking post "${frontmatter.title}" (${postUrl}) on Steem ...`
      )
      const postExists = await client.postExists(transformedPost)
      if (postExists) {
        console.log(`Post already exists on Steem. Aborting ...`)
        return
      }

      console.log(`Post does not yet exist. Publishing ...`)
      const response = await client.createPost(transformedPost)

      console.log(`Published to Steem: ${response.id}`)
      if (response.operations.comment) {
        console.log(JSON.stringify(response.operations.comment.permlink))
      }
    } catch (ex) {
      console.log(ex)
    }
  }
}

module.exports = publishToSteem
