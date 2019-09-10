#!/bin/bash
docker run -i \
  -v $PWD:/e2e \
  -e NO_COLOR=1\
  -e PROXY_URL=http://avo2-proxy-qas-sc-avo2.apps.do-prd-okp-m0.do.viaa.be/ \
  -w /e2e \
  -e ENV=int \
  --entrypoint sh \
  cypress/included:3.4.0 -c "CI=true npm ci --save-dev &&CI=true npm build . &&\
   npm run integration-tests"
