#!/bin/bash
WD=/usr/share/nginx/html
cd $WD
echo "setting env"
sh ./env.sh
nginx -g 'daemon off;'
