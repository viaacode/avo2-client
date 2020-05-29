FROM debian:9-slim
COPY login_oc.sh /usr/local/bin/login_oc.sh
ARG OCTOKEN
ENV OCTOKEN $OCTOKEN
ARG OCP_IBM
ENV OCP_IBM $OCP_IBM
RUN echo $OCTOKEN > ~/.meemoo-ibm-oc_token
RUN apt-get update && apt-get install --no-install-recommends --yes curl openssl  ca-certificates
RUN  curl -L --output /tmp/oc.tar.gz -X GET https://github.com/openshift/origin/releases/download/v3.11.0/openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit.tar.gz
RUN tar xvf /tmp/oc.tar.gz && cp openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit/oc /usr/local/bin && chmod +x /usr/local/bin/oc 
RUN login_oc.sh $OCP_IBM  && oc project sc-avo2
CMD /bin/bash
