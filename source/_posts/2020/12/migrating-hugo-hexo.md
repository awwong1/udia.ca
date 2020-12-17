---
title: Migrating from Hugo to Hexo
date: 2020-12-17 15:09:07
draft: false
description: Why I moved away from the newer Hugo static site generator to the older Hexo alternative.
status: complete
tags:
- personal
---

Due to a lack of official support for server-side rendered latex mathematics in [Hugo](https://gohugo.io/), I've decided to port my website to the JavaScript static site generator [Hexo](https://hexo.io/).
Previously, I was using an approach inspired by [graemephi's katex workaround](https://graemephi.github.io/posts/server-side-katex-with-hugo-part-2/) but found that this approach was brittle to upstream changes made in Hugo's core and slowed down the site generation time considerably.

While porting over my site, I struggled with subtle terminology differences and template languages used by the two frameworks. eg) Hugo `posts` are Hexo `archives`; rather than [Golang templates](https://golang.org/pkg/text/template/), embedded JavaScript templates [`ejs`](https://ejs.co/) is used by the example theme (which I based mine off of).

I have redesigned the theme to follow the [practical typography](https://practicaltypography.com/) book, with a few minor modifications, such as decreasing the default font-size slightly.
The dark/light mode toggling functionality is pending a full rewrite, as I am unsatisfied with my original implementation that uses the [`css invert()` filter function](https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/invert()).
This original invert logic caused too much tearing and glitch-esque artifacts on my mobile device and no longer is up to my aesthetic standard.

Pending future motivation and availability, I need to update all of the inline-math snippets in my prior posts to use the new `mathjax` shortcodes.

Inline math {% mathjax %}c = \pm\sqrt{a^2 + b^2}{% endmathjax %} can be inserted directly into paragraphs with little issue.

{% mathjax %}F = \{F_{x} \in  F_{c} : (|S| > |C|) \cap 
(minPixels  < |S| < maxPixels) \cap
(|S_{connected}| > |S| - \epsilon)\}{% endmathjax %}

Large formulas are still displayed when kept standalone.
It is not necessary to distinguish between display and inline math.

I miss the live-reloading browser on source file edit- it is surprising to me that this is not default behavior (I guess I am spoiled).
More work needs to be done to ensure no global x-overflow scrolling occurs.
This is functionality that I aim to add back into the theme next.
The current state of this theme is also missing a sitemap and RSS feed.
