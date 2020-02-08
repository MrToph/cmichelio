# copy-images-structure
A gatsby plugin that copies over all images sourced from `gatsby-source-filesystem` to `public` while keeping the same subfolder structure.

## Example:
It will copy `src/pages/hello/world.png` to `public/hello/world.png`

## Usage
Add to `gatsby-config.js`
```js
{
    resolve: `copy-images-structure`,
    options: {
      ignoreFileExtensions: ['psd'],
      verbose: true,
    },
},
```
