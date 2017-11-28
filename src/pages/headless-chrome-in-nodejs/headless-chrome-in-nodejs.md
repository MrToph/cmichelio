---
author: Christoph Michel
comments: true
date: 2017-09-24
disqus_identifier: headless-chrome-in-nodejs
layout: Post
route: /headless-chrome-in-nodejs/
slug: headless-chrome-in-nodejs
title: Headless Chrome in Node.js
featured: https://thefriendlytester.co.uk/images/blogpostimages/headlesschrome.jpg
categories:
- Tech
---

![Headless Chrome in Node.js](https://thefriendlytester.co.uk/images/blogpostimages/headlesschrome.jpg)

Since some months ago Chrome ships with a _headless_ option that allows you to script the browser behavior.
It's basically like [phantomjs](http://phantomjs.org/) but using the Chrome engine.

I wrote some scripts to automate taking screenshots and collecting the data for [my monthly progress reports](http://cmichel.io/progress-report-august-2017/).

### How it works
You can use the [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-captureScreenshot) to navigate to a page, inject javascript, or take screenshots.

It's best to have the latest Chrome canary version installed, because the functions and options in the protocol are still not final.

The easiest way to use headless chrome in _Node.js_ is to use an existing wrapper around the [chrome-remote-interface](https://github.com/cyrus-and/chrome-remote-interface).
I found [simple-headless-chrome](https://github.com/LucianoGanga/simple-headless-chrome) to be the best / simplest for my use case and it worked pretty much out of the box.

> _Note_: There's also [puppeteer](https://github.com/GoogleChrome/puppeteer) by Google now.

### Taking a Screenshot of Google Analytics with headless Chrome
I scrape my [time-tracking software](/redirects/rescuetime), Google Analytics and Google AdMob to take screenshots of last month's charts.

The full code [is on GitHub](), here's the part taking a screenshot of Google Analytics website statistics with headless chrome:

```javascript
// index.js to start headless chrome
const HeadlessChrome = require("simple-headless-chrome");
const fs = require("fs");
const scrapeAnalytics = require("./analytics");

const browser = new HeadlessChrome({
  headless: true, // can be set to false to see the browser window
  deviceMetrics: {
    width: 1920,
    height: 1080
  }
});

async function scrapeSites() {
  try {
    await browser.init();
    await scrapeAnalytics(browser);
  } catch (err) {
    console.log("ERROR!", err);
  } finally {
    await browser.close();
  }
}

scrapeSites();

// analytics.js
const fs = require("fs");
const moment = require("moment");
const config = require("./config/config.json");
const { needsGoogleLogin, googleLogin } = require("./common");

module.exports = async function scrapeAnalytics(browser) {
  try {
    console.log("=== Scraping Google Analytics ===");
    const dateYearMonth = moment().subtract(1, "month").format("YYYYMM");
    const lastDayOfLastMonth = moment().subtract(1, "month").daysInMonth();
    const url = `${config.analytics.url}/%3F_u.date00%3D${dateYearMonth}01%26_u.date01%3D${dateYearMonth}${lastDayOfLastMonth}/`;
    const mainTab = await browser.newTab({ privateTab: false });
    console.log(url);
    // Navigate to a URL
    await mainTab.goTo(url);

    if (await needsGoogleLogin(mainTab)) {
      console.log("Logging in ...");
      await googleLogin(mainTab);
    } else {
      console.log("Already logged in ...");
    }

    // Wait some time! (2s)
    await mainTab.wait(2000);
    await mainTab.goTo(url);
    await mainTab.waitForSelectorToLoad("#ID-overview-graph");

    console.log("Getting Image Viewport ...");
    const graphClip = await mainTab.getSelectorViewport("#ID-overview-graph");
    const infoClip = await mainTab.getSelectorViewport(
      "#ID-overview-graph + table"
    );
    const clip = {
      x: graphClip.x,
      y: graphClip.y,
      width: graphClip.width,
      height: graphClip.height + 10 + infoClip.height,
      scale: graphClip.scale
    };
    console.log(clip);
    // wait until the svg animation finishes
    await mainTab.wait(1000);

    console.log("Saving Screenshot ...");
    await mainTab.saveScreenshot(`${config.outputDir}website-traffic`, {
      clip
    });
  } catch (err) {
    console.log("ERROR!", err);
  }
};
```

When you run it with Node version 8, you'll get this screenshot as a result:

[![Website Traffic](/progress-report-august-2017/website-traffic.png)](/progress-report-august-2017/website-traffic.png)