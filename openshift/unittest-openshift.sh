#!/bin/bash
export PROXY_URL=http://avo2-proxy-qas-sc-avo2.apps.do-prd-okp-m0.do.viaa.be
export ENV=int
docker run -i \
  -v $PWD:/e2e \
  -w /e2e \
  -e ENV=qas \
  node:12-alpine sh -c "TZ=Europe/Brussels && apk add --no-cache tzdata && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone &&\
   sed -i \"6s/.*/uri: 'http:\/\/avo2-proxy-${ENV}-sc-avo2.apps.do-prd-okp-m0.do.viaa.be,'/\" src/shared/services/data-service.ts && CI=true npm ci --save-dev &&\
   CI=true npm run --no-watch unit-tests" 
