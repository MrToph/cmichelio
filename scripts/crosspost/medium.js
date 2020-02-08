const medium = require(`medium-sdk`)

const REQUIRED_ENV_VARS = [
  `MEDIUM_CLIENT_ID`,
  `MEDIUM_CLIENT_SECRET`,
  `MEDIUM_ACCESS_TOKEN`,
]

const publish = async post => {
  REQUIRED_ENV_VARS.forEach(envVar => {
    if (!process.env[envVar])
      throw new Error(
        `Environment variable "${envVar}" is not set but required for publishing.`
      )
  })

  const {
    MEDIUM_CLIENT_ID,
    MEDIUM_CLIENT_SECRET,
    MEDIUM_ACCESS_TOKEN,
  } = process.env

  const mediumClient = new medium.MediumClient({
    clientId: MEDIUM_CLIENT_ID,
    clientSecret: MEDIUM_CLIENT_SECRET,
  })

  mediumClient.setAccessToken(MEDIUM_ACCESS_TOKEN)

  return new Promise((resolve, reject) => {
    mediumClient.getUser(function(err, user) {
      if (err) {
        return reject(new Error(`Medium-client getUser error: ${err.message}`))
      }
      mediumClient.createPost(
        {
          userId: user.id,
          content: post.content,
          title: post.frontmatter.title,
          canonicalUrl: post.canonicalUrl,
          tags: post.frontmatter.tags,
          contentFormat: medium.PostContentFormat.MARKDOWN,
          publishStatus: medium.PostPublishStatus.DRAFT,
        },
        function(err, publishInfo) {
          if (err) {
            reject(new Error(`Medium-client createPost error: ${err.message}`))
          }
          if (publishInfo) {
            return resolve({ url: publishInfo.url })
          } else resolve({})
        }
      )
    })
  })
}

module.exports = publish
