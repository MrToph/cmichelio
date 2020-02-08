const _ = require(`lodash`)

// use vertical bar as delimiter as it does not appear in slug
const htmlCacheKey = node =>
  `crosspost|${_.get(node, `fields.slug`, `unknown-slug`)}|${
    node.internal.contentDigest
  }`

const writePostToCache = (cache, node, objToWrite) => {
  cache.set(htmlCacheKey(node), { ...objToWrite, cachedAt: Date.now() })
}

module.exports = {
  writePostToCache,
}
