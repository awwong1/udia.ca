---
title: "UDIA"
date: 2019-12-26T15:30:12-07:00
draft: false
description: Home and meta page describing udia.ca philosophy and technology.
status: in-progress
---

This page is about `udia.ca`; for information about the author, **see [about](/about)**.

# Overview

UDIA came into existence in February 2016, largely as a result of being one of the few domain names available in the [`.ca` TLD](https://cira.ca/) satisfying a four character length limit.
It is also my preferred online moniker.

Occasionally, I expand the four characters as **U**niverse **D**ream **I**nference **A**gent, albeit this has changed multiple times since inception.

## Content

I keep various public notes regarding my personal Linux setup and systems administration here.
Occasionally, I will also post some computing science research, cooking recipes, and unimportant musings about life.

In an attempt to overcome crippling perfectionism, the quality of the published content may vary drastically.

## Audience

The goal of writing is to explain ideas and processes to my future self.

My target is the "I" who has forgotten, but remains engaged and intelligent.

## License

All website content is licensed under the [Creative Commons](https://creativecommons.org/) [Attribution-NonCommercial 4.0 International License](https://creativecommons.org/licenses/by-nc/4.0/).
You are **free** to copy and reuse any of my content (non-commercially) as long as you tell people where it is from.

## Technology & Hosting

- The site is built with the [Hexo](https://hexo.io/) static site generator using a custom theme built from scratch.
- We are hosted on an Ubuntu 18.04, 4GB RAM, 2 VCPU instance provided by [Cybera Rapid Access Cloud](https://www.cybera.ca/services/rapid-access-cloud/)
- Domain Name Servers are managed and proxied using [Cloudflare](https://www.cloudflare.com/)
- Content is served using the [nginx web server](https://nginx.org/en/)
- Secure Sockets Layer certificates are issued by [Let's Encrypt](https://letsencrypt.org/)

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
    location ~* .*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|json)$ {
      add_header Cache-Control "public, max-age=31536000";
    }
    try_files $uri $uri/ =404;
  }
  # ... certbot
}
```

# Miscellaneous

I borrow heavily from [gwern.net](https://www.gwern.net), which I discovered while browsing a Hacker News post of [well-designed personal sites](https://news.ycombinator.com/item?id=21737529).

I am not affiliated with the [Urban Development Institute of Australia](http://udia.com.au).
