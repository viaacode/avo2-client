#!/bin/bash
### ARGS: $1 env
### script waits for next rollout 
declare -i cur_ver
declare -i b
cur_ver=`oc rollout status deploymentconfig avo2-client-$1| awk '{print $3}'| sed 's/"//g'|rev|cut -d'-' -f1 |rev`
new_ver=`(( $cur_ver + 1 ))`
new_ver=cur_ver+1              

while [[ $cur_ver != $new_ver ]]; do
   #echo wait
   sleep 1
   cur_ver=`oc rollout status deploymentconfig avo2-client-$1| awk '{print $3}'| sed 's/"//g'|rev|cut -d'-' -f1 |rev`
done