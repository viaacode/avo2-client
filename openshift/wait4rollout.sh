#!/bin/bash
### ARGS: $1 env
### script waits for next rollout
set +x
declare -i cur_ver
declare -i new_ver
sleep 1
cur_ver=`oc rollout status deploymentconfig avo2-client-$1| awk '{print $3}'| sed 's/"//g'|rev|cut -d'-' -f1 |rev` 
new_ver="$((cur_ver + 1))"
echo "${1} version to compare ${cur_ver}, new version ${new_ver}"


while true ; do
   sleep 10
   [ -n "$cur_ver" ] && [ "${cur_ver}" -eq "${new_ver}" ]  2>/dev/null
   if [ $? -ne 0 ]; then
    echo version is not changed
    cur_ver=`oc rollout status deploymentconfig avo2-client-$1 |tail -n1 | awk '{print $3}'| sed 's/"//g'|rev|cut -d'-' -f1 |rev` 2>/dev/null
    else echo "$1" ROLLED OUT && exit 0
   fi
done