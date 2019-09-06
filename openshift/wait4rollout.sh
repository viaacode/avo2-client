#!/bin/bash
### ARGS: $1 env
### script waits for next rollout
set +x
declare -i cur_ver
declare -i new_ver
cur_ver=`oc rollout status deploymentconfig avo2-client-$1| awk '{print $3}'| sed 's/"//g'|rev|cut -d'-' -f1 |rev`
#new_ver=`(( $cur_ver + 1 ))`
new_ver=$cur_ver+1
echo "xxxxxxxxx ${new_ver}"

while [ $cur_ver -ne $new_ver ]; do
   #echo wait
   sleep 2
   if  [ $cur_ver -eq $new_ver ] || exit 0;then echo;fi
   cur_ver=$(oc rollout status deploymentconfig avo2-client-$1| awk '{print $3}'| sed 's/"//g'|rev|cut -d'-' -f1 |rev) 1>/dev/null
done
