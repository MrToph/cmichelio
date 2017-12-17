const fsExtra = require(`fs-extra`)
const path = require(`path`)

exports.onPostBuild = async ({ graphql }, pluginOptions) => {
  let filterNodes = nodes => nodes
  if (Array.isArray(pluginOptions.ignoreFileExtensions)) {
    filterNodes = nodes =>
      nodes.filter(
        ({ node }) =>
          !pluginOptions.ignoreFileExtensions.includes(node.extension)
      )
  }
  const { data } = await graphql(`
    {
      allFile(filter: { internal: { mediaType: { regex: "/image//" } } }) {
        edges {
          node {
            extension
            absolutePath
            relativePath
            internal {
              mediaType
            }
          }
        }
      }
    }
  `)

  const nodes = filterNodes(data.allFile.edges)
  return Promise.all(
    Array.from(nodes, async ({ node }) => {
      const pathInSrc = node.absolutePath
      const newFilePath = path.join('public', node.relativePath)
      // Don't copy anything if the file already exists at the location.
      if (!fsExtra.existsSync(newFilePath)) {
        try {
          await fsExtra.ensureDir(path.dirname(newFilePath))
          await fsExtra.copy(pathInSrc, newFilePath)
          if (pluginOptions.verbose) {
            console.log(`copied "${pathInSrc}" to "${newFilePath}"`)
          }
        } catch (err) {
          console.error(
            `error copying file "${pathInSrc}" to "${newFilePath}":`,
            err
          )
        }
      }
    })
  )
}
