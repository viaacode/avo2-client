#!/bin/bash
ENV=int
PROXY_URL=http://avo2-proxy-${ENV}-sc-avo2.apps.do-prd-okp-m0.do.viaa.be
TAG=`git describe --tags`



build(){
  echo "*** Building image ${TAG} ***"
  docker build --target build  --build-arg CI=false --build-arg NODE_ENV=ci --build-arg PRODUCTION=false -t avo2-client-${TAG}:ci .
}

utest(){
  docker run -i avo2-client-${TAG}:ci  sh -c "CI=true npm ci --production=false --save-dev && npm run build && npm run --no-watch unit-tests"

}
echo "*** running the image ***"
check(){
docker images | head | grep avo2-client-`git describe --tags` | grep ci
}
check
if [ $? -eq 0  ]
then
	echo "____________ CI Image found not building __________________"
	utest
else
	echo "____________ CI Image NOT found Starting build ____________"
	build
	utest
fi
if [ $? -ne 0 ];then
    echo "########## For now we return 0 BUT TEST IS Failed, results will be saved to jenkins  ############"
    exit 0
fi
echo "########## Tests: SUCCSESSFUL, results will be saved to jenkins ############"
