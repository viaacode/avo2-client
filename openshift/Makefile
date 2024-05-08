.ONESHELL:
SHELL = /bin/bash

.PHONY: all test

test:
	apk add --no-cache make
	chown node:node $${WORKSPACE} -R
	npm ci --include=dev
	npm run lint
# 	npm run unit-tests # TODO fix unit tests

