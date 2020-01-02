default: dev

dev:
	hugo server -D
deploy:
	hugo
	rsync --whole-file --archive --verbose --groupmap=*:www-data public/* rac:/var/www/udia.ca

