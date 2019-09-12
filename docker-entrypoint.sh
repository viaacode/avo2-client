#!/bin/bash
WD=/usr/share/nginx/html
cd $WD
sh ./env.sh
nginx -g 'daemon off;'
