default: dev

dev:
	hugo server -D
deploy:
	hugo
	rsync --whole-file --archive --verbose --compress --progress --groupmap=*:www-data public/ rac:/var/www/udia.ca

