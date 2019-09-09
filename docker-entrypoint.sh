#!/bin/bash
WD=/usr/share/nginx/html
cd $WD
echo "setting env"
sh ./env.sh
if [[ "$1" -eq "int_test" ]]; then    
    npm run integration-tests
elif  [[ "$1" -eq "unit_test" ]]; then 
    npm run unit-tests
elif  [[ "$1" -eq "bash" ]]; then 
    bash   
else nginx -g 'daemon off;'
fi
