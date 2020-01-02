---
title: "UDIA"
date: 2019-12-26T15:30:12-07:00
draft: false
description: Home and meta page describing udia.ca philosophy and technology.
status: in-progress
---

This page is about `udia.ca`; for information about the author, see [about]({{% ref "posts/2019/12/about.md" %}}).

# Overview

UDIA came into existence in February 2016, largely as a result of being one of the few domain names available in the ['.ca' TLD](https://cira.ca/) satisfying a four character length limit.
It is also my preferred online pseudonym.

## Content

There is currently very little to no content on this site, but I intend on keeping various public notes regarding computer science research (general neural network and deep learning experiments), instant pot pressure cooking recipes, and unimportant musings about life.

In an attempt to overcome crippling perfectionism, the quality of the published content may vary drastically.

## Audience

The goal of writing is to explain ideas and processes to my future self.
My target is the "I" who has forgotten, but remains engaged and intelligent.

## License

All website content is licensed under the [Creative Commons](https://creativecommons.org/) [Attribution-NonCommercial 4.0 International License](https://creativecommons.org/licenses/by-nc/4.0/).
You are **free** to copy and reuse any of my content (non-commercially) as long as you tell people where it is from.

## Technology & Hosting

- The site is built with the [Hugo](https://gohugo.io/) static site generator using a custom theme written by the author.
- Source files are written in [CommonMark 0.29](https://spec.commonmark.org/0.29/) compliant markdown, parsed by [goldmark](https://github.com/yuin/goldmark/).
- We are hosted on an Ubuntu 18.04, 4GB RAM, 2 VCPU instance provided by [Cybera Rapid Access Cloud](https://www.cybera.ca/services/rapid-access-cloud/).
- Domain Name Servers are managed and proxied using [Cloudflare](https://www.cloudflare.com/).
- Content is served using the [nginx web server](https://nginx.org/en/).
- Secure Sockets Layer certificates are issued by [Let's Encrypt](https://letsencrypt.org/).

### NGINX Configuration

```nginx 
server {
  listen 80 backlog=4096;
  listen [::]:80 backlog=4096;

  server_name www.udia.ca udia.ca;

  root /var/www/udia.ca;
  index index.html;
  error_page 404 /404.html;

  if ($host = www.udia.ca) {
    return 301 $scheme://udia.ca$request_uri;
  }

  location / {
    location ~* .*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
      add_header Cache-Control "public, max-age=31536000";
    }
    try_files $uri $uri/ =404;
  }
}
```

# Miscellaneous

I borrow heavily from [gwern.net](https://www.gwern.net), which I discovered while browsing a Hacker News post of [well-designed personal sites](https://news.ycombinator.com/item?id=21737529).

UDIA is not affiliated with the [Urban Development Institute of Australia](http://udia.com.au) in any way, shape, or form.
