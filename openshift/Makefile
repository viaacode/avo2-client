.ONESHELL:
SHELL = /bin/bash

.PHONY: all test

test:
	chown node:node $${WORKSPACE} -R
	cd ./tests
	npm run ci
	npm run test:e2e:install-chrome
	npm run test:e2e
