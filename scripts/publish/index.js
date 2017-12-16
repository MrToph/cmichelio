/**
 * How to run:
 * `npm run crosspost` to publish all new posts to all platforms
 * `npm run crosspost -- medium --path "trying-dynamodb/trying-dynamodb.md"`
 * to publish `src/pages/trying-dynamodb/trying-dynamodb.md` to medium only`
 */

const argv = require('yargs').argv
const publishToMedium = require('./medium')
const publishToSteem = require('./steem')
const helpers = require('./common')

const publishPosts = async () => {
  let pathsToPosts = []
  if (argv.path) {
    pathsToPosts.push(argv.path)
  } else {
    pathsToPosts.push('TODO get from git')
  }
  pathsToPosts = pathsToPosts.map(helpers.prefixLocalRelativePaths)

  if (pathsToPosts.length === 0) {
    console.info('No posts to publish found.')
    return
  }

  const nonExistentPaths = pathsToPosts.filter(
    path => !helpers.postExistsLocally(path)
  )
  if (nonExistentPaths.length > 0) {
    console.info(
      `These ${nonExistentPaths.length} provided posts don't exist:\n`,
      nonExistentPaths.join('\n'),
      '\nAborting ...'
    )
    return
  }

  console.info(
    `Found ${pathsToPosts.length} posts to publish:\n`,
    pathsToPosts.join('\n')
  )

  const parameterlessOptions = Array.isArray(argv._)
    ? argv._.map(option => option.toLowerCase())
    : []
  if (parameterlessOptions.length === 0) {
    // publish to all platforms
    await publishToMedium(pathsToPosts)
    await publishToSteem(pathsToPosts)
  } else if (parameterlessOptions.some(option => option === 'medium')) {
    await publishToMedium(pathsToPosts)
  } else if (parameterlessOptions.some(option => option === 'steem')) {
    await publishToSteem(pathsToPosts)
  }
  process.exit()
}

publishPosts()
