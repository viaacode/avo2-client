#!/bin/bash
### ARGS: $1 env
### script waits for next rollout
set +x
declare -i cur_ver
declare -i new_ver

cur_ver=`oc rollout status deploymentconfig avo2-client-$1| awk '{print $3}'| sed 's/"//g'|rev|cut -d'-' -f1 |rev` 
new_ver="$((cur_ver + 1))"
echo "${1} version to compare ${cur_ver}, new version ${new_ver}"
oc rollout latest dc/avo2-client-${1} 


while true ; do
   oc rollout status deploymentconfig avo2-client-int  --revision=${new_ver} 
   if [ $? -ne 0 ]; then
    sleep 4
    else echo "$1" ROLLED OUT && exit 0
   fi
done