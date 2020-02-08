const url = require(`url`)
const visit = require(`unist-util-visit`)
const isRelativeUrl = require(`is-relative-url`)
const path = require(`path`)
const _ = require(`lodash`)
const cheerio = require(`cheerio`)
const { writePostToCache } = require(`./cache`)
const ast2Markdown = require(`./ast-to-markdown`)
const gatsbyConfig = require(`../../gatsby-config`)

const DEPLOY_DIR = `public`
const SITE_URL = _.get(gatsbyConfig, `siteMetadata.siteUrl`, ``)

const invalidDestinationDirMessage = dir =>
  `[prepare-crosspost You have supplied an invalid destination directory. The destination directory must be a child but was: ${dir}`
const invalidSiteUrlMessage = `[prepare-crosspost You have specified an invalid site url for prefixing relative URLs. The site url must be set in gatsby-config.js->siteMetadata.siteUrl`
const invalidSlugMessage = `[prepare-crosspost The post does not have a slug field in the frontmatter`

// dest must be a child
const destinationIsValid = dest => !path.relative(`./`, dest).startsWith(`..`)

const validateDestinationDir = dir => {
  if (typeof dir === `undefined`) {
    return true
  } else if (typeof dir === `string`) {
    // need to pass dummy data for validation to work
    return destinationIsValid(`${dir}/h/n`)
  } else if (_.isFunction(dir)) {
    // need to pass dummy data for validation to work
    return destinationIsValid(`${dir({ name: `n`, hash: `h` })}`)
  } else {
    return false
  }
}

module.exports = (
  {
    files,
    markdownNode,
    markdownAST: _markdownAST,
    pathPrefix,
    getNode,
    cache,
  },
  pluginOptions = {}
) => {
  try {
    if (!markdownNode.frontmatter) return

    const blogPostDate = new Date(markdownNode.frontmatter.date)
    // ignore posts older than 60 days for crossposting
    if (blogPostDate.getTime() + 60 * 24 * 60 * 60 * 1000 < Date.now()) return
  } catch (err) {
    console.error(
      `[gatsby crosspost: Error while reading date: ${err.message}]`
    )
  }
  // we don't want our rewrites to modify anything
  const markdownAST = _.cloneDeep(_markdownAST)
  const defaults = {
    ignoreFileExtensions: [],
    destinationDir: path.posix.resolve(
      __dirname + `./.cache/markdown-crosspost`
    ),
  }
  const { destinationDir } = pluginOptions
  if (!validateDestinationDir(destinationDir))
    return Promise.reject(invalidDestinationDirMessage(destinationDir))
  if (!SITE_URL) return Promise.reject(invalidSiteUrlMessage)
  const slug = _.get(markdownNode, `fields.slug`, undefined)
  if (!slug) return Promise.reject(invalidSlugMessage)

  const options = _.defaults(pluginOptions, defaults)
  console.log(
    `Markdown post with absolute URLs cached for crossposting: "${slug}"`
  )

  const relativeAbsoluteLinksMap = new Map()
  const postBaseUrl = url.resolve(SITE_URL, slug)

  // Copy linked files to the destination directory and modify the AST to point
  // to new location of the files.
  const visitor = (linkableNode, htmlOptions = {}) => {
    if (isRelativeUrl(linkableNode.url)) {
      const ext = linkableNode.url.split(`.`).pop()
      if (options.ignoreFileExtensions.includes(ext)) {
        return
      }
      
      const absoluteSiteUrl = url.resolve(
        postBaseUrl,
        htmlOptions.newUrl || linkableNode.url
        )
      // console.log(`LINK NODE URL`. linkableNode.url)
      relativeAbsoluteLinksMap.set(linkableNode.url, absoluteSiteUrl)
      linkableNode.url = absoluteSiteUrl
      if (
        linkableNode.type === `html` &&
        htmlOptions.originalMarkdownNodeType
      ) {
        delete linkableNode.value
        linkableNode.type = htmlOptions.originalMarkdownNodeType
      }
    }
  }

  visit(markdownAST, `link`, link => {
    visitor(link)
  })

  visit(markdownAST, `definition`, definition => {
    visitor(definition)
  })

  visit(markdownAST, `image`, image => {
    visitor(image)
  })

  visit(markdownAST, [`html`, `jsx`], node => {
    const $ = cheerio.load(node.value)

    function processUrl({ url }, htmlOptions = {}) {
      try {
        const ext = url.split(`.`).pop()
        if (isRelativeUrl(url) && !options.ignoreFileExtensions.includes(ext)) {
          // we want to key the map by the _Markdown_ node URL not the HTML element's URL
          visitor(node, {
            originalMarkdownNodeType: htmlOptions.originalMarkdownNodeType,
            newUrl: url,
          })
        }
      } catch (err) {
        // Ignore
      }
    }

    // extracts all elements that have the provided url attribute
    function extractUrlAttributeAndElement(selection, attribute) {
      return (
        selection
          // extract the elements that have the attribute
          .map(function() {
            const element = $(this)
            const url = $(this).attr(attribute)
            if (url && isRelativeUrl(url)) {
              return { url, element }
            }
            return undefined
          })
          // cheerio object -> array
          .toArray()
          // filter out empty or undefined values
          .filter(Boolean)
      )
    }

    // Handle Images
    extractUrlAttributeAndElement($(`img[src]`), `src`).forEach(
      ({ url, element }) => {
        try {
          const ext = url.split(`.`).pop()
          if (!options.ignoreFileExtensions.includes(ext)) {
            const imgSrc = element.attr(`src`)
            processUrl({ url: imgSrc }, { originalMarkdownNodeType: `image` })
          }
        } catch (err) {
          // Ignore
        }
      }
    )

    // Handle video tags.
    extractUrlAttributeAndElement(
      $(`video source[src], video[src]`),
      `src`
    ).forEach(processUrl)

    // Handle audio tags.
    extractUrlAttributeAndElement(
      $(`audio source[src], audio[src]`),
      `src`
    ).forEach(processUrl)

    // Handle flash embed tags.
    extractUrlAttributeAndElement($(`object param[value]`), `value`).forEach(
      processUrl
    )

    // Handle a tags.
    extractUrlAttributeAndElement($(`a[href]`), `href`).forEach(processUrl)
  })

  console.log(relativeAbsoluteLinksMap)

  const canonicalUrl = postBaseUrl
  const post = { canonicalUrl, frontmatter: markdownNode.frontmatter || {} }
  const finalMarkdown = ast2Markdown(markdownAST, post)
  writePostToCache(cache, markdownNode, { ...post, content: finalMarkdown })
}
