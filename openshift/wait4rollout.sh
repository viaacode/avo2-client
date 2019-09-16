#!/bin/bash
### ARGS: $1 env
### script waits for next rollout
set +x
declare -i cur_ver
declare -i new_ver
#oc rollout latest dc/avo2-client-${1} && sleep 3
get_currentversion(){
   cur_ver=`oc rollout status deploymentconfig avo2-client-${1}| awk '{print $3}'| sed 's/"//g'|rev|cut -d'-' -f1 |rev |tail -n1`|| echo error
   if echo $cur_ver | grep -Eq '^[+-]?[0-9]+$'
   then
      echo revision-nr $cur_ver
   else
      echo "!! got string  sleeping!"
      sleep 40
      cur_ver=`oc rollout status deploymentconfig avo2-client-${1}| awk '{print $3}'| sed 's/"//g'|rev|cut -d'-' -f1 |rev| tail -n1` 
   fi
   new_ver="$((cur_ver + 1))" || exit 1

}
get_currentversion $1
oc rollout latest dc/avo2-client-${1}


echo "${1} version to compare ${cur_ver}, new version ${new_ver}"
#is_ready=`oc get pod $(oc get pods | grep avo2-client-${1}| grep Running| awk '{print $1}' ) -o json | jq .status.containerStatuses[].ready`


while true ; do
   if [ $new_ver -eq 1 ]  ;then
      echo "Maybe other rollout is going on sleeping.. "
      sleep 25
      get_currentversion $1
      oc rollout latest dc/avo2-client-${1}

   fi


   oc rollout status deploymentconfig avo2-client-${1} --revision=${new_ver} 
   if [ $? -ne 0 ]; then
    sleep 40
    else echo "$1" ROLLED OUT && exit 0
   fi
done