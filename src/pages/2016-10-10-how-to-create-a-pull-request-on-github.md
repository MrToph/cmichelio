---
author: Christoph Michel
comments: true
date: 2016-10-10 14:43:55+00:00
disqus_identifier: 645 http://cmichel.io/?p=645
layout: Post
route: /how-to-create-a-pull-request-on-github/
slug: how-to-create-a-pull-request-on-github
title: How to create a Pull Request on GitHub
featured: /assets/2016/10/pull-request-github-clone.gif
categories:
- Tech
---
If you want to contribute to a project on GitHub, the way to do it is by creating a pull request. I broke it down into these easy-to-follow steps:
 	
  1. **Fork the project:** You start off by going to the project you want to contribute to on GitHub and create a fork. This will create a _copy_ of the project in _your_ repositories![Pull Request GitHub Fork](http://cmichel.io/assets/2016/10/pull-request-github-fork.gif)
  2. **Clone the Fork:** Click on _Clone or download_ in your forked repository, copy the link, create a folder on your local machine and run `git clone git@github.com:Username/fork.git`
  ![Pull Request GitHub Clone](http://cmichel.io/assets/2016/10/pull-request-github-clone.gif)

  3. **(Optional:) Create a new branch:** If you want your changes to be in an own branch, run `git checkout -B branchName`
  4. **Make local changes:** Make the changes in your cloned repository.
  5. **Commit the changes to your fork:** Change into your repository and run  
  `git add .`  
  `git commit -a -m "Describe your fixes"`  
  `git push`  
  (Optional for new branches:) `git push --set-upstream origin branchName`
 	
  6. **Create the pull request on GitHub:** Go to your fork on GitHub and click on Pull-Request and fill out the description. You're done.


