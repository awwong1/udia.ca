# udia.ca

Static, personal site.

## Up and Running

The hugo binary that this site requires relies on custom math rendering functionality, as well as sass stylesheet support.
Both are not part of standard Hugo, therefore a build from source is necessary.

```bash
# Custom Hugo source code
git clone https://github.com/awwong1/hugo
cd hugo
go install --tags extended
```

```
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
