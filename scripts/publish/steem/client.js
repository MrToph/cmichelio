require('dotenv').config()
const steem = require('steem')
const trim = require('lodash/trim')

const accountName = `cmichel`
const slugTransform = s => trim(s, '/').toLowerCase()

const client = {
  async createPost({ content, frontmatter, slug, images, links }) {
    const category =
      Array.isArray(frontmatter.steem) && frontmatter.steem.length > 0
        ? frontmatter.steem[0]
        : 'programming'
    // https://steemit.com/steemdev/@jfollas/write-a-steemit-web-app-part-11-posting-content
    // https://steemdb.com/programming/@cmichel/progress-report-november-2017/data
    const query = {
      parent_author: '',
      // main tag
      parent_permlink: category,
      permlink: slugTransform(slug),
      json_metadata: {
        tags: frontmatter.steem,
        format: 'markdown',
        app: 'steemit/0.1',
        links,
        image: images,
      },
    }
    const result = await steem.broadcast.commentAsync(
      process.env.STEEM_POSTING_KEY,
      query.parent_author /* empty for new posts */,
      query.parent_permlink /* category */,
      accountName /* author */,
      query.permlink /* slug */,
      frontmatter.title,
      content,
      query.json_metadata
    )
    if (result.error) throw new Error(result.error)
    return result
  },
  async postExists({ slug }) {
    const postSlugs = []
    // iterate over all posts
    let pagination = {
      start_permlink: undefined,
      start_author: undefined,
    }
    let result
    do {
      const query = Object.assign(
        {
          limit: 100,
          tag: accountName,
          // no retweets, only posts by author himself
          select_authors: [accountName],
          truncate_body: 1,
        },
        pagination
      )
      result = await steem.api.getDiscussionsByBlogAsync(query)
      if (result.error) throw new Error(result.error)

      postSlugs.push(...result.map(({ permlink }) => permlink))

      if (result.length > 0) {
        const lastPost = result.slice(-1).pop()
        pagination = {
          start_permlink: lastPost.permlink,
          start_author: lastPost.author,
        }
        // console.log(postSlugs.length, lastPost.permlink)
      }
    } while (result.length >= 100)

    // set to remove doubles that come from pagination
    const postSlugsNoDuplicates = [...new Set(postSlugs)]
    console.log(
      `Found ${postSlugsNoDuplicates.length} existing posts for account "${
        accountName
      }". Checking if post already exists ...`
    )

    const slugTrimmed = slugTransform(slug)
    return postSlugsNoDuplicates.some(
      postSlug => slugTrimmed === slugTransform(postSlug)
    )
  },
}

module.exports = client
