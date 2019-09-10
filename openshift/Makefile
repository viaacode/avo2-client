PROJECT=sc-avo2
GIT_VERSION=`git describe --tags`
APP_NAME=avo2-client
WD=/tmp
REPO_URI=https://github.com/viaacode/avo2-client.git
GIT_NAME=avo2-client
JENKINS_WORKDIR=
TOKEN=`oc whoami -t`
openshiftserver=https://do-prd-okp-m0.do.viaa.be:8443
path_to_oc=`which oc`
oc_registry=docker-registry-default.apps.do-prd-okp-m0.do.viaa.be
.ONESHELL:
SHELL = /bin/bash
.PHONY:	all
check-env:
ifndef ENV
  ENV=int
endif
check-prxyurl:
ifndef PROXY_URL
  PROXY_URL=http://avo2-proxy-${ENV}-sc-avo2.apps.do-prd-okp-m0.do.viaa.be
endif
OC_PROJECT=sc-avo2
ifndef BRANCH
  BRANCH=master
endif
TAG=${ENV}
current_qas_version=`oc rollout status deploymentconfig avo2-client-qas| awk '{print $3}'| sed 's/"//g'`
CMD_INT_TEST="npm run integration-tests"
CMD_UNIT_TEST="npm run integration-tests"

login:	check-env
	#oc login ${openshiftserver}
	oc project "${OC_PROJECT}" 
	docker login -p $(TOKEN) -u unused docker-registry-default.apps.do-prd-okp-m0.do.viaa.be 2>/dev/null

build:	login
	docker build . -t docker-registry-default.apps.do-prd-okp-m0.do.viaa.be/sc-avo2/avo2-client:${GIT_VERSION}

push:	login
	docker push docker-registry-default.apps.do-prd-okp-m0.do.viaa.be/sc-avo2/avo2-client:${GIT_VERSION}
tag_int: 
	oc tag sc-avo2/avo2-client:${GIT_VERSION} sc-avo2/avo2-client:int 
rollout_int:	login
	sh ./openshift/wait4rollout.sh int
tag_staging:	login
	oc tag sc-avo2/avo2-client:${GIT_VERSION} sc-avo2/avo2-client:qas 
versions_int:	
	sh ./openshift/versions.sh int
versions_qas:	
	sh ./openshift/versions.sh qas
versions_prd:	
	sh ./openshift/versions.sh prd	
int_test: 
	sh ./openshift/cy-openshift.sh
unit_test:
	sh ./openshift/unittest-openshift.sh



anno_qas:	login versions_qas
anno_prd:	login versions_prd
staging:	tag_staging
	sh ./openshift/wait4rollout.sh qas


	