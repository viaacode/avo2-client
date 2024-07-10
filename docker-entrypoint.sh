#!/bin/bash
WD=/usr/share/nginx/html
cd $WD


echo "setting env"
sh ./env.sh


# Copy the scripts/robots-QAS.txt file or the scripts/robots-PROD.txt file to public/robots.txt based on the ENV environment variable
echo "copy robots.txt file"
if  [[ "$ENV" == "qas" ]]; then
		cp ./robots-QAS.txt ./robots.txt
else
		cp ./robots-PRD.txt ./robots.txt
fi


if  [[ "$1" -eq "bash" ]]; then
    bash
else nginx -g 'daemon off;'
fi
