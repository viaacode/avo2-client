#!/bin/bash

# Recreate config file
rm -rf ./env-config.js
touch ./env-config.js

# Add assignment
echo "window._ENV_ = {" >> ./env-config.js

# TODO get a list of env variables from the global .env file, so we don't need to maintain these in both locations
echo "  PROXY_URL: \"$PROXY_URL\"," >> ./env-config.js

echo "};" >> ./env-config.js
