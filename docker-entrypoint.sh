#!/bin/bash
WD=/usr/share/nginx/html
cd $WD
node ./env.js
nginx -g 'daemon off;'
