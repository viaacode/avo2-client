#!/bin/bash
docker run -i \
  -v $PWD:/e2e \
  -e NO_COLOR=1\
  -e PROXY_URL=http://avo2-proxy-qas-sc-avo2.apps.do-prd-okp-m0.do.viaa.be/ \
  -w /e2e \
  --entrypoint sh \
  cypress/included:3.4.0 -c "./scripts/env.sh &&\
  PROXY_URL=http://avo2-proxy-qas-sc-avo2.apps.do-prd-okp-m0.do.viaa.be/ &&\
  cypress run --project . \
  --config baseUrl=http://avo2-client-int-sc-avo2.apps.do-prd-okp-m0.do.viaa.be/"
