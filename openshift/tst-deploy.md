## Build the image for openshift
'''npx nodeshift --strictSSL=false --dockerImage=bucharestgold/centos7-s2i-web-app --imageTag=10.x --build.env --expose'''
### resulting buildconfig for reference 
'''openshift/avo2-client-dc.yaml'''


TOKEN=$(oc whoami -t)
ENDPOINT=$(oc config current-context | cut -d/ -f2 | tr - .)
NAMESPACE=$(oc config current-context | cut -d/ -f1)

oc policy add-role-to-user edit system:serviceaccount:ci-cd:jenkins -n avo
