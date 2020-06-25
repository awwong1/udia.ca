# udia.ca

Static, personal site.

## Up and Running

This theme requires sass stylesheet support, available in the `hugo_extended_*` versions of Hugo.
Please see the latest [releases](https://github.com/gohugoio/hugo/releases).


```bash
# Install latest hugo from source
git clone https://github.com/gohugo/hugo
cd hugo
go install --tags extended

# Checkout this repo, initialize theme
git clone https://git.udia.ca/alex/udia.ca
cd udia.ca
git submodule update --init --recursive
```

```bash
# Development server
hugo server -D # or make

# Deployment
hugo && time rsync --whole-file --archive --verbose --groupmap=*:www-data public/* rac:/var/www/udia.ca
# or make deploy
```
