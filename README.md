# udia.ca

Static, personal site.

## Quickstart

```bash
# Development server
hugo server -D

# Deployment
hugo && time rsync --whole-file --archive --verbose --groupmap=*:www-data public/* rac:/var/www/udia.ca
```
