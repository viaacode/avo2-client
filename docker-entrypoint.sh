#!/bin/sh
WD=/app

echo "setting env"
sh ./env.sh


# Copy the scripts/robots-enable-indexing.txt file or the scripts/robots-enable-indexing.txt file to public/robots.txt based on the ENABLE_GOOGLE_INDEXING environment variable
echo "copy robots.txt file"
ls -l
if  [[ "$ENABLE_GOOGLE_INDEXING" == "true" ]]; then
		cp $WD/robots-enable-indexing.txt $WD/robots.txt
else
		cp $WD/robots-disable-indexing.txt $WD/robots.txt
fi
rm $WD/robots-enable-indexing.txt
rm $WD/robots-disable-indexing.txt


if  [[ "$1" == "bash" ]]; then
    bash
else
    exec node $WD/dist/server/server.js
fi
