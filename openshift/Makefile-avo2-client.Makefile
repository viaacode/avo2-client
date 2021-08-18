APP_REPO = https://github.com/viaacode/avo2-client.git
OCP = https://c113-e.private.eu-de.containers.cloud.ibm.com:30227
IS = avo2-client
BRANCH = master
.ONESHELL:
SHELL = /bin/bash
ENV = qas
env = qas
.PHONY: all
NAMESPACE = sc-avo2
OC_PROJECT = ${NAMESPACE}
JENKINS_URL = jenkins-ci-cd.meemoo2-2bc857e5f10eb63ab790a3a1d19a696c-i000.eu-de.containers.appdomain.cloud
JENKINS_PATH = /job/infra/job/DEMO
BASE_IMG = nginxinc/nginx-unprivileged:stable
APP_NAME = avo2-client
IMAGE_NAME = ${NAMESPACE}/${APP_NAME}
REGISTRY = default-route-openshift-image-registry.meemoo2-2bc857e5f10eb63ab790a3a1d19a696c-i000.eu-de.containers.appdomain.cloud
VERSION = `git describe --tags||echo latest`
REPO_NAME = 'avo2-client.git'
login:
	oc login ${OCP}
	oc project ${OC_PROJECT}
	echo __________WORKING_VERSION_________
	echo ________________${VERSION}____________
	echo ____________${APP_NAME}___________

build: login
	{ \
	set -e ;\
	curl -H "Authorization: Bearer `oc whoami -t`" -X POST https://${JENKINS_URL}${JENKINS_PATH}/buildWithParameters?token=ci-demo -F APP_REPO=${APP_NAME} -F APP_REPO=${APP_REPO} -F BRANCH=${BRANCH} -F IS=${IS} -F OC_PROJECT=${OC_PROJECT} -F APP_NAME=${APP_NAME} -F BASE_IMG=${BASE_IMG} -F env=${env} -F TEST=false -F BUILD=true;\
	echo BUILD started from branch ${BRANCH} at ${VERSION} for env ${env}
	}
test: login
	{ \
	set -e ;\
	curl -vv -H "Authorization: Bearer `oc whoami -t`" -X POST https://${JENKINS_URL}${JENKINS_PATH}/buildWithParameters?token=ci-demo -F APP_REPO=${REPO_NAME} -F APP_REPO=${APP_REPO} -F BRANCH=${BRANCH} -F IS=${IS} -F OC_PROJECT=${OC_PROJECT} -F APP_NAME=${APP_NAME} -F BASE_IMG=${BASE_IMG} -F env=${env} -F TEST=true -F BUILD=false;
	}
deploy: login
	{ \
	set -e ;\
	curl -H "Authorization: Bearer `oc whoami -t`" -X POST https://${JENKINS_URL}${JENKINS_PATH}/buildWithParameters?token=ci-demo  -F APP_REPO=${REPO_NAME} -F APP_REPO=${APP_REPO} -F BRANCH=${BRANCH} -F IS=${IS} -F OC_PROJECT=${OC_PROJECT} -F APP_NAME=${APP_NAME} -F BASE_IMG=${BASE_IMG} -F env=${env} -F TEST=false -F BUILD=false ;\
	echo DEPLOY started on ${OCP} in ${OC_PROJECT} for env ${env}
	}

destroy: login
	oc delete -n ${OC_PROJECT} all -l app=${APP_NAME},env=${env} -R || echo no objects found for destroy


configure: login
	{ \
	oc create configmap ${APP_NAME}-${env} --from-env-file=./bootstrap.env  || oc delete configmap ${APP_NAME}-${env} && oc create configmap ${APP_NAME}-${env} --from-env-file=./bootstrap.env  ;\
	oc set env --from=configmap/${APP_NAME}-${env} deployment/${APP_NAME}-${env} -n ${OC_PROJECT} ;
	}

tag-int:
	oc tag ${IMAGE_NAME}:${VERSION} ${IMAGE_NAME}:int

test-qas:

tag-prd:
	oc tag ${IMAGE_NAME}:${VERSION} ${IMAGE_NAME}:prd
deploy-prd:


all: build
	deploy

local-dev: login
	{ \
	docker pull default-route-openshift-image-registry.meemoo2-2bc857e5f10eb63ab790a3a1d19a696c-i000.eu-de.containers.appdomain.cloud/${OC_PROJECT}/${IS}:dev ;\
	docker tag default-route-openshift-image-registry.meemoo2-2bc857e5f10eb63ab790a3a1d19a696c-i000.eu-de.containers.appdomain.cloud/${OC_PROJECT}/${IS}:dev localhost:5000/${OC_PROJECT}/${IS}:dev ;\
	}
