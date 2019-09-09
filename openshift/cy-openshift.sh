#!/bin/bash
docker run -it \
  -v $PWD:/e2e \
  -w /e2e \
  --entrypoint cypress \
  cypress/included:3.4.0 run --project . \
  --config baseUrl=http://avo2-client-int-sc-avo2.apps.do-prd-okp-m0.do.viaa.be/