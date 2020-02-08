const glob = require(`glob`)
const path = require(`path`)
const fs = require(`fs-extra`)
const moment = require(`moment`)
const lodash = require(`lodash`)
const mediumPublish = require(`./medium`)
const steemPublish = require(`./steem`)
const testPublish = require(`./test`)

const AVAILABLE_PLATFORMS = [`medium`, `steem`, `test`]

const CROSSPOST_CACHE = path.resolve(
  __dirname,
  `../../.cache/caches/prepare-crosspost`
)

const makeUnique = posts => {
  return posts.filter((post, i) =>
    posts.every(
      p => p.slug !== post.slug || post.cachedAt.unix() >= p.cachedAt.unix()
    )
  )
}

const getSortedPosts = () =>
  new Promise((resolve, reject) => {
    glob(path.join(CROSSPOST_CACHE, `./**/*.json`), function(err, files) {
      if (err) {
        reject(`Could not read cached posts: `, err.message)
        return
      }
      let posts = []

      files.forEach(file => {
        try {
          const fileContents = fs.readFileSync(file, `utf8`)
          const parsedContent = JSON.parse(fileContents)

          let date = moment(lodash.get(parsedContent, `val.frontmatter.date`))
          if (!date.isValid()) {
            date = moment(new Date(0)) // put oldest date, so unknown dates get sorted to back
          }
          const post = {
            ...parsedContent.val,
            slug: lodash.trim(parsedContent.key.split(`|`)[1], `/`),
            date,
            cachedAt: moment(new Date(parsedContent.val.cachedAt)),
          }
          posts.push(post)
        } catch (error) {
          console.error(`Could not read cached post ${file}: ${error.message}`)
        }
      })

      // the same post can be cached several times
      posts = makeUnique(posts)
      posts.sort((p1, p2) => p2.date.unix() - p1.date.unix())
      resolve(posts)
    })
  })

const publish = async (platform, post) => {
  const publishArgs = [post]
  switch (platform) {
    case `medium`: {
      return mediumPublish(...publishArgs)
    }
    case `steem`: {
      return steemPublish(...publishArgs)
    }
    case `test`: {
      return testPublish(...publishArgs)
    }
    default:
      throw new Error(`Unsupported platform "${platform}".`)
  }
}

module.exports = {
  AVAILABLE_PLATFORMS,
  getSortedPosts,
  publish,
}
