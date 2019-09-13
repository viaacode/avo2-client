#!/bin/bash
WD=/usr/share/nginx/html
cd $WD
echo "setting env"
sh ./env.sh

if  [[ "$1" -eq "bash" ]]; then 
    bash   
else nginx -g 'daemon off;'
fi
