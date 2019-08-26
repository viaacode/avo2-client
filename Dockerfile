FROM node:12-alpine AS build

# set our node environment, defaults to production
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN chown -R node:node /app

USER node
RUN npm ci --production=false

COPY . .
#COPY .env scripts/env.sh ./ 
RUN npm run build
# set permissions for openshift
USER root
#RUN chmod -R g+rwx /app && chown 101:101 /app

FROM nginxinc/nginx-unprivileged AS run
USER root
#RUN useradd -u 1000  -G 101,0 -m -s /bin/sh node


COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

WORKDIR /usr/share/nginx/html
COPY .env scripts/env.sh ./
RUN chgrp -R 101 /usr/share/nginx/html && chmod -R g+rwx /usr/share/nginx/html

# Run script which initializes env vars to fs
RUN chmod +x env.sh
USER nginx
#RUN ./env.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
