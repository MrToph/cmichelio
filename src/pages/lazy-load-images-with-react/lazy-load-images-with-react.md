---
title: Lazy-loading images with React and Semantic UI
featured: /lazy-load-images-with-react/featured.png
date: 2018-03-25
categories:
- Tech
- React
medium:
- Programming
- javascript
- es6
- Development
steem:
- steemdev
- javascript
- programming
- dev
- coding
---

Images make up most of the website's content size and therefore play a huge part in page load times. This is especially problematic with single-page websites like most landing pages are nowadays. A solution to this problem is _lazy loading images_, i.e., the images _below the fold_ are loaded asynchronously at a later time.
There are two main ways to do lazy loading:
1. Delay loading images until the above the fold content is loaded, and then load all images
1. Delay loading the image until it is in the user's viewport

Lazy-loading images when they are in the viewport is really easy with [Semantic UI](https://semantic-ui.com/behaviors/visibility.html#lazy-loading-images):
You define the image `src` as `data-src` instead and then attach a visibility handler to the images:
```js
$('.demo.items .image img')
  .visibility({
    type       : 'image',
    transition : 'fade in',
    duration   : 1000
  })
;
```

Lazy-loading images using React and its [React Semantic UI port](https://react.semantic-ui.com) is a bit different as we won't use `jQuery`, but React components instead.
We can create a `LazyImage` React component that loads the image when it's in the viewport.
For that, we use the `Visibility` component that has a callback when the top edge of the component is in the viewport:

```jsx
import PropTypes from 'prop-types'
import { Visibility, Image, Loader } from 'semantic-ui-react'

export default class LazyImage extends React.Component {
    static propTypes = {
        src: PropTypes.string.isRequired,
        size: PropTypes.string,
    }

    static defaultProps = {
        size: `medium`,
    }

    state = {
        show: false,
    }

    showImage = () => {
        this.setState({
            show: true,
        })
    }

    render() {
        const { size } = this.props
        if (!this.state.show) {
            return (
                <Visibility as="span" onTopVisible={this.showImage}>
                    <Loader active inline="centered" size={size} />
                </Visibility>
            )
        }
        return <Image {...this.props} />
    }
}
```

The usage is exactly the same as [Semantic UI React's Image](https://react.semantic-ui.com/elements/image) component as we just forward the `props` to it:
```jsx
<LazyImage
    src="https://source.unsplash.com/random/400x300"
    size="mini"
    rounded
/>
```

If the image is not in the viewport we render a `Loader`. You might wonder why we do that because if the image is not in the viewport, it's not visible _by definition_ and it doesn't matter what we render as its placeholder.
This is true in theory, but I noticed you can still see a `Loader` when the image is in the initial viewport and you're using server-side rendering. The server will serve the `Loader` and it takes a fraction of a second until the app is rehydrated and the `Visibility` handler is hooked up.

