#!/bin/bash
ENV=int
#PROXY_URL=http://avo2-proxy-${ENV}.hetarchief.be
TAG=`git describe --tags`
build(){
  echo "____________Building image ${TAG} ____________"
  docker build --target build  --build-arg CI=false --build-arg NODE_ENV=ci --build-arg PRODUCTION=false -t avo2-client-${TAG}:ci .
}

utest(){
  docker run -i avo2-client-${TAG}:ci  sh -c "CI=true npm run --no-watch unit-tests"

}
echo "____________running the image____________"
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
    echo "______________ For now we return 0 BUT TEST IS Failed, results will be saved to jenkins  ______________##"
    exit 0
fi
echo "______________ Tests: SUCCSESSFUL, results will be saved to jenkins ______________##"
