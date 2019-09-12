#!/bin/bash
set +x
ENV=$1
VERSION_avo2types=$(jq '.dependencies | .["@viaa/avo2-types"]'  package.json | sed 's/"//g')
VERSION_avo2components=`jq '.dependencies | .["@viaa/avo2-components"]' package.json| sed 's/"//g'`
VERSION_app=`jq '.version' package.json | sed 's/"//g'`
pod=`oc get pods | grep avo2-client-${ENV} | awk '{print $1}'`
git_tag=`git describe --abbrev=0 --tag`
anno(){
  oc annotate --overwrite  $1 $2 $3 $4
}


echo setting application_version
anno pod $pod application_version=$VERSION_app
anno deploymentconfig avo2-client-${ENV} application_version=$VERSION_app

echo setting version_types
anno pod $pod version_types=$VERSION_avo2types
anno deploymentconfig avo2-client-${ENV} version_types=$VERSION_avo2types

echo setting version_components
anno pod $pod version_components=$VERSION_avo2components
anno deploymentconfig avo2-client-${ENV} version_components=$VERSION_avo2components 

echo setting git_tag
anno pod $pod git_tag=$git_tag
anno deploymentconfig avo2-client-${ENV} git_tag=$git_tag

