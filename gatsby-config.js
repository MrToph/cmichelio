module.exports = {
  siteMetadata: {
    title: 'Gatsby Starter Blog',
    author: 'Christoph Michel',
    description: 'A starter blog demonstrating what Gatsby can do.',
    siteUrl: 'https:/cmichel.io/',
    twitter: 'cmichelio',
    github: 'MrToph',
    medium: 'cmichel',
    steem: 'cmichel',
    linkedIn: 'christoph-michel-dev'
  },
  pathPrefix: '/',
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/pages`,
        name: 'pages',
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-copy-linked-files`,
            options: {
              // destinationDir: 'linked',
              // ignoreFileExtensions: [],
            },
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
              linkImagesToOriginal: true,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          'gatsby-remark-prismjs',
          'gatsby-remark-smartypants',
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        //trackingId: `ADD YOUR TRACKING ID HERE`,
      },
    },
    `gatsby-plugin-feed`,
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-glamor`,
    `gatsby-plugin-twitter`,
  ],
}
