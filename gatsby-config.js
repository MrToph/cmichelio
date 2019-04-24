/* eslint-env node */
const url = require(`url`)
const proxy = require(`http-proxy-middleware`)

module.exports = {
  siteMetadata: {
    title: `cmichel`,
    author: `Christoph Michel`,
    description: `Christoph Michel's blog about software engineering and business.`,
    keywords: `software tech programming business`,
    socialImage: `https://cmichel.io/images/logo.png`,
    siteUrl: `https://cmichel.io/`,
    twitter: `cmichelio`,
    github: `MrToph`,
    medium: `cmichel`,
    steem: `cmichel`,
    linkedIn: `christoph-michel-dev`,
  },
  pathPrefix: `/`,
  // for avoiding CORS while developing Netlify Functions locally
  // read more: https://www.gatsbyjs.org/docs/api-proxy/#advanced-proxying
  developMiddleware: app => {
    app.use(
      `/.netlify/functions/`,
      proxy({
        target: `http://localhost:9000`,
        pathRewrite: {
          '/.netlify/functions/': ``,
        },
      })
    )
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/pages`,
        name: `pages`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/assets`,
        name: `images`,
      },
    },
    {
      resolve: `copy-images-structure`,
      options: {
        ignoreFileExtensions: [`psd`],
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            // copies svg images, and all other _linked_ non-image files
            resolve: `gatsby-remark-copy-linked-files`,
            options: {
              destinationDir: `static`,
              // ignoreFileExtensions: [],
            },
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 720,
              linkImagesToOriginal: true,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-87152739-1`,
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map(edge => {
                const absoluteUrl = url.resolve(
                  site.siteMetadata.siteUrl,
                  edge.node.fields.slug
                )
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  url: absoluteUrl,
                  guid: absoluteUrl,
                  custom_elements: [{ 'content:encoded': edge.node.html }],
                })
              })
            },
            query: `
            {
              allMarkdownRemark(
                limit: 20,
                sort: { order: DESC, fields: [frontmatter___date] },
              ) {
                edges {
                  node {
                    excerpt
                    html
                    fields { slug }
                    frontmatter {
                      title
                      date
                    }
                  }
                }
              }
            }
            `,
            output: `/feed.xml`,
          },
        ],
      },
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-postcss`,
    {
      resolve: `gatsby-plugin-layout`,
      options: {
        component: require.resolve(`./src/components/layout/index.js`),
      },
    },
  ],
}
