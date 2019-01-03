const path = require(`path`)
const Generator = require(`yeoman-generator`)
const kebabCase = require(`lodash.kebabcase`)
const format = require(`date-fns/format`)
const subMonths = require(`date-fns/sub_months`)

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
        choices: [`standard`, `eos`, `progress-report`],
      },
      {
        type: `input`,
        name: `title`,
        message: `Title`,
        when: function(response) {
          return response.postType !== `progress-report`
        },
      },
      {
        type: `input`,
        name: `slug`,
        message: `Slug`,
        when: function(response) {
          return response.postType !== `progress-report`
        },
      },
    ])
    this.answers.slug = this.answers.slug || kebabCase(this.answers.title)
  }

  createEosPost() {
    return this.createStandardPost()
  }

  createStandardPost() {
    const { slug, title } = this.answers
    const hyphenedSlug = kebabCase(slug)
    const date = format(Date.now(), `YYYY-MM-DD`)
    return { title, date, slug: hyphenedSlug }
  }

  createProgressReport() {
    const createSlugFromDate = (date) => `progress-report-${format(date, `MMMM-YYYY`).toLowerCase()}`

    const today = Date.now()
    const date = format(today, `YYYY-MM-DD`)

    const dayOfMonth = parseInt(format(today, `DD`), 10)
    let reportDate = today
    if(dayOfMonth < 5) {
      // we create a report for _last_ month
      reportDate = subMonths(today, 1)
    }

    const currentMonth = format(reportDate, `MMMM`)
    const previousReportSlug = createSlugFromDate(subMonths(reportDate, 1))
    const slug = createSlugFromDate(reportDate)
    const title = `Progress Report - ${format(reportDate, `MMMM YYYY`)}`

    return { title, date, slug, previousReportSlug, currentMonth }
  }

  writing() {
    const { postType } = this.answers

    let templateVariables
    switch (postType) {
      case `eos`: {
        templateVariables = this.createEosPost()
        break
      }
      case `progress-report`: {
        templateVariables = this.createProgressReport()
        break
      }
      default: {
        templateVariables = this.createStandardPost()
        break
      }
    }

    this.slug = templateVariables.slug
    console.log(JSON.stringify(templateVariables, null, 4))
    this.fs.copyTpl(
      this.templatePath(`${postType}/**`),
      this.destinationPath(`src/pages/${this.slug}`),
      templateVariables
    )
  }

  end() {
    // open file in VSCode
    this.spawnCommand(`code`, [`src/pages/${this.slug}/index.md`])
  }
}
