const path = require(`path`)
const Generator = require(`yeoman-generator`)
const kebabCase = require(`lodash.kebabcase`)
const format = require(`date-fns/format`)

module.exports = class extends Generator {
  initializing() {
    // destinationRoot is set thos 'scripts/scaffold'
    // point it to cmichelio root
    this.destinationRoot(path.resolve(this.destinationRoot(), `../../`))
  }
  async prompting() {
    this.answers = await this.prompt([
      {
        type: `list`,
        name: `postType`,
        message: `Type of post`,
        choices: [`standard`, `eos`],
      },
      {
        type: `input`,
        name: `slug`,
        message: `Slug`,
      },
      {
        type: `input`,
        name: `title`,
        message: `Title`,
      },
    ])
  }

  writing() {
    const { postType, slug, title } = this.answers
    const hyphenedSlug = kebabCase(slug)
    this.slug = hyphenedSlug
    const date = format(Date.now(), `YYYY-MM-DD`)
    this.fs.copyTpl(
      this.templatePath(`${postType}/**`),
      this.destinationPath(`src/pages/${hyphenedSlug}`),
      { title, date, slug: hyphenedSlug }
    )
  }

  end() {
    // open file in VSCode
    this.spawnCommand(`code`, [`src/pages/${this.slug}/index.md`])
  }
}
