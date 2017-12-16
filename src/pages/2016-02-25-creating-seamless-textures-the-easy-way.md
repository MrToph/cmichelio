---
author: Christoph Michel
comments: true
date: 2016-02-25 17:48:11+00:00
disqus_identifier: 124 http://cmichel.io/?p=124
layout: Post
route: /creating-seamless-textures-the-easy-way/
slug: creating-seamless-textures-the-easy-way
title: Creating seamless textures the easy way
featured: /assets/2016/02/seamless-texture-finished.jpg
categories:
- Games
---
When you design a terrain for a game, you don't just have a single texture that you apply to the whole terrain, as the texture's size would be way too huge. An approach that gives you more flexibility is to instead create small texture chunks that are repeated all over the map. Now it's important that the textures you use are seamless, i.e., there are no visual borders that would indicate the individual tiles. I'll show you how to create seamless textures.

![Non-seamless Ice texture](http://cmichel.io/assets/2016/02/bad-ice-texture-1024x547.jpg)
_Non-seamless texture: You can see the seams/borders of the texture as the shapes do not wrap around and the lighting level differs on opposite sides of the texture._

![Seamless Ice texture](http://cmichel.io/assets/2016/02/seamless-ice-texture-1024x546.png)
_Seamless texture: There is no border around the individual tiles._


### The idea

The intuition of my method is this:
The hardest part is the border, so the first step will be to create a border that wraps around the edges. I do this by drawing the border the usual way in the middle of the screen and then applying two smart cut + translation operations. Then we have a seamless texture at the border. Then the second step is simply drawing the center content of the texture.

#### Creating the border
  1. Draw your border as a cross in the center of the texture.
  ![seamless texture border as a cross](http://cmichel.io/assets/2016/02/seamless-texture-cross.jpg)
  _Draw your border as a cross in the center of the texture_

  2. Cut the texture vertically at the center. Swap the left and right parts.
  ![seamless texture cut vertically](http://cmichel.io/assets/2016/02/seamless-texture-cut-vertically.jpg)
  _Cut the texture vertically at the center. Swap the left and right parts._

  3. Cut the texture from step 2) horizontally at the center. Swap the top and bottom parts.
  ![seamless texture cut horizontally](http://cmichel.io/assets/2016/02/seamless-texture-cut-horizontally.jpg)
  _Cut the texture horizontally at the center. Swap the top and bottom parts._


You have now created a seamless texture. This is how it looks in a game right now:
![texture seamless no center](http://cmichel.io/assets/2016/02/texture-seamless-no-center-1024x545.jpg)


#### Fill in the center of the texture

Now fill in the center of the image however you like:
![seamless texture finished](http://cmichel.io/assets/2016/02/seamless-texture-finished.jpg)

Again the finished result:
![Seamless Ice texture](http://cmichel.io/assets/2016/02/seamless-ice-texture-1024x546.png)
