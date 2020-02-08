const program = require(`commander`)
const inquirer = require(`inquirer`)
const lodash = require(`lodash`)
const { AVAILABLE_PLATFORMS, getSortedPosts, publish } = require(`./crosspost`)

require(`dotenv`).config()

program
  .description(`crosspost a markdown post to another platform`)
  .option(`-s, --slug <slug>`, `slug of the post to crosspost`)
  .option(`-p, --platform <platform>`, `platform to crosspost to`)
  .action(async (options = {}) => {
    try {
      // console.log(`CLI options`, options.platform, options.slug)
      const questions = []
      const posts = await getSortedPosts()

      if (!options.platform) {
        if (AVAILABLE_PLATFORMS.length === 1) {
          options.platform = AVAILABLE_PLATFORMS[0]
        } else {
          questions.push({
            type: `list`,
            name: `platform`,
            message: `Choose a platform to crosspost to`,
            choices: AVAILABLE_PLATFORMS,
          })
        }
      }

      if (!options.slug) {
        if (posts.length === 0) {
          throw new Error(
            `No posts cached to publish. Make sure you build your blog with "npm run build" first, and the website is deployed and accessible before crossposting.`
          )
        }
        questions.push({
          type: `list`,
          name: `slug`,
          message: `Choose a post to crosspost`,
          choices: posts.map(post => ({
            name: `${post.slug} (updated: ${post.cachedAt.format(
              `YYYY-MM-DD HH:mm`
            )})`,
            value: post.slug,
          })),
        })
      }

      const answers = await inquirer.prompt(questions)
      options.platform = answers.platform || options.platform
      options.slug = lodash.trim(answers.slug || options.slug, `/`)

      if (!AVAILABLE_PLATFORMS.includes(options.platform))
        throw new Error(`Platform "${options.platform}" is not supported.`)

      const foundPost = posts.find(p => p.slug === options.slug)
      if (!foundPost)
        throw new Error(
          `Post with slug "${
            options.slug
          }" was not found. Available post slugs:\n${posts
            .map(p => p.slug)
            .join(` `)}`
        )

      const { url } = await publish(options.platform, foundPost)

      // sometimes medium does not respond with publishInfo
      if (url) {
        console.log(`Published at ${url}`)
      } else {
        console.log(`Published!`)
      }
      process.exit(0)
    } catch (error) {
      console.error(error.message)
      process.exit(1)
    }
  })
  .on(`--help`, () => {
    console.log(``)
    console.log(`Examples:`)
    console.log(``)
    console.log(`  $ crosspost -p medium -s 'hello-world'`)
  })

function cli(argv) {
  program.parse(argv)
}
cli(process.argv)
