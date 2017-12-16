---
author: Christoph Michel
comments: true
date: 2016-10-22 09:36:20+00:00
disqus_identifier: 708 http://cmichel.io/?p=708
layout: Post
route: /charts-in-react-native-svg-and-d3-js/
slug: charts-in-react-native-svg-and-d3-js
title: Charts in React Native with React-Native-SVG and D3.js
featured: /assets/2016/10/react-native-svg-line-chart.png
categories:
- Tech
- React Native
- D3.js
---

Creating charts in **React Native** requires using external libraries as there is no drawing engine built into it. There is a React Native port of [React ART](https://github.com/reactjs/react-art) to draw vector graphics, but the documentation is lacking and it looks like it is not maintained. We will use the newer [**react-native-svg**](https://github.com/react-native-community/react-native-svg) to render SVG. It is really easy to use if you are already familiar with _SVG_, because _react-native-svg_ provides a **JSX wrapper** for every SVG component. Its syntax to render a _circle_ and a _rectangle_ looks like this:

![react-native-svg example](https://github.com/react-native-community/react-native-svg/blob/master/screenShoots/svg.png?raw=true)

```xml
import Svg, { Circle, Rect } from 'react-native-svg'

class SvgExample extends Component {
  render () {
    return (
      <Svg height='100' width='100'>
        <Circle
          cx='50'
          cy='50'
          r='45'
          stroke='blue'
          strokeWidth='2.5'
          fill='green' />
        <Rect
          x='15'
          y='15'
          width='70'
          height='70'
          stroke='red'
          strokeWidth='2'
          fill='yellow' />
      </Svg>
    )
  }
}
```

## Correct size of the chart

This works fine for static images with a fixed width and height, but what if you want to dynamically draw a chart that takes **all the available space**? The `Svg` component also supports the flexbox layout which you can use in conjunction with the **viewBox** props to scale your graphics to the available space automatically. For that you define an _arbitrary_ width and height in the **viewBox** property, which you then use as a base for your computation, and it will be rescaled to the actual available width and height of the `Svg` component.

```xml
<Svg style={{flex: 1, alignSelf: 'stretch'}} viewBox='0 0 1000 1000'>
  <Rect
    x='50'
    y='50'
    width='900'
    height='900' />
</Svg>
```

This might work out in your case, however, I found this to be insufficient for my purpose as the **aspect ratio** of your **viewBox**, the ratio of the width to the height, will most likely **not match** the aspect ratio of the actual available space, because you simply don't know it. The result is your width and height will be scaled inpropotional, making the stretching look bad.

![React Native Svg Chart wrong aspectRatio](http://cmichel.io/assets/2016/10/react-native-svg-chart-wrong-aspectRatio.png)![React Native Svg Line Chart](http://cmichel.io/assets/2016/10/react-native-svg-line-chart.png)
_
Left: Width and height scaling is not proportional.</br>
Right: Width and height uses all available space.
_

You can try playing around with the [preserveAspectRatio](https://developer.mozilla.org/de/docs/Web/SVG/Attribute/preserveAspectRatio) property, but I found it easiest to use React Native View's `onLayout` to get the actual width and height of the available space, and simply pass this information to the `Svg` component. [In this post](http://cmichel.io/how-to-get-the-size-of-a-react-native-view-dynamically/), I described the approach using `onLayout` to dynamically get the size of a `View`.

## Creating Charts in React Native

Once you know the width and the height of your component, you can start building the above **Line Chart** in React Native.

The line chart consists of two _axes_ and an _SVG path_ for each set of data points. The nice thing is we can make use of the component model of React to create a _reusable_ line chart with reusable axis components and lines. We create an **Axis** component that we simply insert into our `Svg` JSX, and the **Axis'** `render` function returns some react-native-svg JSX in its own _render_ function.

```xml
<Svg width={width} height={height}>
  <Axis
    width={width - 2 * this.padding}
    x={this.padding}
    y={height - this.padding}
    ticks={8}
    startVal={minDate}
    endVal={maxDate}
    scale={xScale} />
  <Axis
    width={height - 2 * this.padding}
    x={this.padding}
    y={height - this.padding}
    ticks={8}
    startVal={minVal}
    endVal={maxVal}
    scale={yScale}
    vertical />
  {data.map(
     (pathD, i) => <Path
                     fill='none'
                     stroke={colors[i % colors.length]}
                     strokeWidth='5'
                     d={pathD}
                     key={i} />
   )}
</Svg>
```
### Convert data points to coordinates

First, we need a way to convert the data points to SVG coordinates. Here is where **d3.js** comes into play with its [**d3-scale**](https://github.com/d3/d3-scale#linear-scales) classes. A **scale** takes as input values from a **domain** interval, the values/dates on the axes, and maps it (in our case _linearly_) to a **range** interval, the width or height of the `Svg` component. For the _y-Axis_ we will use [`d3.scaleLinear()`](https://github.com/d3/d3-scale#linear-scales), for the _x-Axis_ we use a linear _date_ scale, [`d3.scaleTime()`](https://github.com/d3/d3-scale#time-scales).
If the data points for the lines are stored as (date, value) pairs in `dataPoints`, we can write:

```javascript
import * as d3scale from 'd3-scale'
createScales = (dataPoints, width, height, padding) => {
    let xScale = d3scale.scaleTime().domain([padding, width - padding])
    // y grows to the bottom in SVG, but our y axis to the top
    let yScale = d3scale.scaleLinear().domain([height - padding, padding])
    let dateTimes = dataPoints.map(pair => pair[0].getTime())
    let values = dataPoints.map(pair => pair[1])
    xScale.range(new Date(Math.min(...dateTimes)),
                    new Date(Math.max(...dateTimes)))
    yScale.range(Math.min(...values), Math.max(...values))
    return {xScale, yScale}
}
```

### Creating the Axes

Now we use these scales to build the axes and the lines. The axis will be a simple SVG `line` element with a _marker_ (a smaller perpendicular SVG `line`) after every _x_ points, calculated from the axis' **ticks** property. At the ticks we also create an SVG `Text` element transforming the position into the _tick value_ using the previously defined **d3.js scale**. The skeleton for rendering a horizontal axis will be:

```xml
<G fill='none'>
    <Line
      stroke='#000'
      strokeWidth='3'
      x1={x}
      x2={endX}
      y1={y}
      y2={endY} />
    {tickPoints.map(
       pos => <Line
                key={pos}
                stroke='#000'
                strokeWidth='3'
                x1={pos}
                y1={y}
                x2={pos}
                y2={y + TICKSIZE} />
     )}
    {tickPoints.map(
       pos => <Text
                key={pos}
                fill='#000'
                stroke='#000'
                fontSize='30'
                textAnchor='middle'
                x={pos}
                y={y + 2 * TICKSIZE}>
                {typeof startVal === 'number' ? Math.round(scale(pos), 2)
                                            :scale(pos).toLocaleDateString()}
              </Text>
     )}
</G>
```

The actual code also takes into account _vertical_ axes and computes the `tickPoints`. It's available [here](https://gist.github.com/MrToph/5ed5d9ba03a84eb98e46d707ffbb8783).

![React Native Svg Axes](http://cmichel.io/assets/2016/10/react-native-svg-chart-axes.png)

### Creating the Lines

We will use an SVG `path` element to represent the individual lines. The coordinates are specified within the path's _d_ attribute, however it has its own language and [set of instructions](https://www.w3.org/TR/SVG/paths.html#PathData) that we don't want to deal with. Instead, we make use of **[d3-shape's line](https://github.com/d3/d3-shape#lines)** function transforming the data points into the corresponding _d_ attribute. Therefore, we must provide `line` with the _SVG coordinates_, so we first apply the **inverse** function of our `xScale` and `yScale` to the pairs. The idea is as follows:

```javascript
import * as d3shape from 'd3-shape'
render() {
    let lineGenerator = d3shape.line()
      .x(d => xScale.invert(d[0]))
      .y(d => yScale.invert(d[1]))
    let data = []
    // lines is an array of arrays of pairs
    // where an array of pairs represents a line
    lines.forEach(lineDataPoints => {
      data.push(lineGenerator(lineDataPoints))
    })
    return (
        <Svg ...>
            <Axis ... />
            <Axis ... />
            {data.map(
                (pathD, i) => <Path
                                fill='none'
                                stroke={colors[i % colors.length]}
                                strokeWidth='5'
                                d={pathD}
                                key={i}
                                />
            )}
        </Svg>
    )
}
```

### Conclusion

If you combine all these steps, you end up with reusable **Charts in React Native**, and in general you can build the same profound _D3.js_ visualizations with _react-native-svg_ that you can build in standard web development.

![React Native Svg Line Chart](http://cmichel.io/assets/2016/10/react-native-svg-line-chart.png)
