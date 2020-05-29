#!/bin/bash
## create two arrays one for uimages and one for tags
declare -a images
declare -a tags
logon_okd(){
echo logging in to OKD dco
login_oc.sh https://do-prd-okp-m0.do.viaa.be:8443/  > /dev/null 2>&1
oc project sc-avo2 1>/dev/null
}
login_ibm(){
echo logging in to OCP ibm
login_oc.sh  https://c100-e.eu-de.containers.cloud.ibm.com:31240 > /dev/null 2>&1
oc project sc-avo2 1>/dev/null
}
onprem_versions(){
# login to local OKD
logon_okd
# mombojumbo for filling the image array for ENV ($1)
for dc in ` oc get dc | grep dev |grep -- 'client\|proxy'|awk '{print $1}'`
  do images+=(`oc get dc/$dc -o json | jq .spec.template.spec.containers[].image| sed 's/"//g'`) 
done

# mombojumbo for filling the tags array for IMAGE in image array
for image in "${images[@]}"
  do tags+=(`oc get imagestreamtag| grep  ${image}| grep ':v'|awk '{print $1}'`)
done
 
echo found these tags for env dev ${tags[@]}
}

qas_ibm_version_client(){
onprem_versions
login_ibm
for tag in "${tags[@]}"
  do if [[ $tag == "avo2-client"* ]]; then
    client_onprem_version=$tag
    echo "I will tag qas ibm to version sc-avo2/$client_onprem_version"
    name=`echo "sc-avo2/${tag}"|  cut -d ':' -f1`
    version=`echo "sc-avo2/${tag}"| cut -d ':' -f2`
    #oc tag "${name}:${version}" ${name}:qas  
  fi 

done
}




qas_ibm_version_client
