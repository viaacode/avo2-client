FROM node:12-alpine AS build

# set our node environment, defaults to production
ARG NODE_ENV=production
ARG PRODUCTION=$PRODUCTION
ARG CI=true
ENV NODE_ENV $NODE_ENV
ENV CI $CI
ENV TZ=Europe/Brussels
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN chown -R node:node /app
RUN apk add --no-cache tzdata && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
USER node
# This has to be false, otherwise dev dependencies are not correctly installed and we need those for the build
RUN npm ci --production=false

COPY . .
USER root
RUN chown -R node:node /app
USER node
RUN CI=false npm run build
# set permissions for openshift
#USER root
#RUN chmod -R g+rwx /app && chown 101:101 /app

FROM nginxinc/nginx-unprivileged AS run
ENV NODE_ENV $NODE_ENV
ENV CI false
USER root


COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

WORKDIR /usr/share/nginx/html
COPY scripts/env.js ./
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && chown 101:101 /docker-entrypoint.sh
RUN chgrp -R 101 /usr/share/nginx/html && chmod -R g+rwx /usr/share/nginx/html

# Run script which initializes env vars to fs
RUN chmod +x env.js
USER nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
