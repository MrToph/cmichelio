require('dotenv').config()
const medium = require('medium-sdk')

const mediumClient = new medium.MediumClient({
  clientId: process.env.MEDIUM_CLIENT_ID,
  clientSecret: process.env.MEDIUM_CLIENT_SECRET,
})

mediumClient.setAccessToken(process.env.MEDIUM_ACCESS_TOKEN)

const client = {
  createPost({ content, frontmatter, postUrl }) {
    return new Promise((resolve, reject) => {
      mediumClient.getUser(function(err, user) {
        mediumClient.createPost(
          {
            userId: user.id,
            content,
            title: frontmatter.title,
            canonicalUrl: postUrl,
            tags: frontmatter.medium,
            contentFormat: medium.PostContentFormat.MARKDOWN,
            publishStatus: medium.PostPublishStatus.DRAFT,
          },
          function(err, post) {
            if (err) return reject(err)
            return resolve(post)
          }
        )
      })
    })
  },
}

module.exports = client
