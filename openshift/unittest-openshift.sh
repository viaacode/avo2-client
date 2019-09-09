#!/bin/bash
docker run -i \
  -v $PWD:/e2e \
  -w /e2e \
  node:12-alpine npm install && sh ./scripts/env.sh && PROXY_URL=http://avo2-proxy-qas-sc-avo2.apps.do-prd-okp-m0.do.viaa.be/ CI=true npm run --no-watch unit-tests 
