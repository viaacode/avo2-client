#!/bin/bash
#docker login -u iamapikey de.icr.io
if [ -z $1 ];then echo "Please give the endpoint url as arg"  &exit 1  ;fi
cd /tmp
echo $1
set +x
## set defaults
ENDPOINT="$1"
## openshift login function
oc_login(){
        echo logging in to openshift
	if [ `echo $ENDPOINT | egrep ".containers.cloud.ibm.com"` ]; then echo IBM endpoint &&
		if [ -f ~/.meemoo-ibm-oc_token ]; then oc login --token=`cat ~/.meemoo-ibm-oc_token` "${ENDPOINT}"; else oc login "${ENDPOINT}" && \
		OC_REGISTRY=`oc get route docker-registry -n default | awk '{print $2}' | tail -n1` || exit 1
		fi
	else echo OKD endpoint && \
		if [ -f ~/.meemoo-okd-oc_token ]; then oc login --token=`cat ~/.meemoo-okd-oc_token` "${ENDPOINT}"; else oc login "${ENDPOINT}" && \
                OC_REGISTRY=`oc get route docker-registry -n default | awk '{print $2}' | tail -n1` || exit 1
                fi

	fi
}
## docker (openshift registry login)
docker_login(){
        OC_TOKEN=`oc whoami -t`
        OC_USER=`oc whoami`
	OC_REGISTRY=`oc get route docker-registry -n default | awk '{print $2}' | tail -n1`
	if [[ $OC_USER ==  system:serviceaccount:default:meemoodeploy ]]; then OC_USER=meemoodeploy;fi
        echo logging in to the docker registry
	docker login -u "$OC_USER" -p $(oc whoami -t) $OC_REGISTRY 
}
#USER_NAME=$(oc whoami)
## run the functions
oc_login && docker_login

echo "You are now logged in as ${OC_USER} in openshift and the docker registry on ENDPOINT ${ENDPOINT}"
echo "You are now logged in as ${OC_USER} in openshift and the docker registry on oc_REGISTRY ${OC_REGISTRY}"

