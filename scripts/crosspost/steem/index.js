const client = require(`./client`)

const publish = async post => {
  console.log(
    `Checking post "${post.frontmatter.title}" (${post.slug}) on Steem ...`
  )
  const postExists = await client.postExists(post)
  if (postExists) {
    throw new Error(`Post already exists on Steem. Aborting ...`)
  }

  console.log(`Post does not yet exist. Publishing ...`)
  const response = await client.createPost(post)

  console.log(`Published to Steem: ${response.id}`)
  if (response.operations.comment) {
    const url = JSON.stringify(response.operations.comment.permlink)
    return { url }
  } else {
    return { url: response.id }
  }
}

module.exports = publish
