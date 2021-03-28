default: dev

dev:
	yarn start
deploy:
	yarn clean
	yarn build
	cp -r source/.well-known public
	rsync --whole-file --archive --verbose --compress --progress --groupmap=*:www-data public/ hydrogen:/var/www/udia.ca

