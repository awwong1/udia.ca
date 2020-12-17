# udia.ca

Static, personal site.

## Up and Running

```bash
# Development server
yarn && yarn start

# Deployment
hugo && time rsync --whole-file --archive --verbose --groupmap=*:www-data public/* rac:/var/www/udia.ca
# or make deploy
```
