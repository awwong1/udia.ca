default: dev

dev:
	yarn start
deploy:
	yarn clean
	yarn build
	rsync --whole-file --archive --verbose --compress --progress --groupmap=*:www-data public/ rac:/var/www/udia.ca

