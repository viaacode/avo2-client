FROM nginxinc/nginx-unprivileged
USER nginx

FROM node:16-alpine AS compile
# set our node environment, defaults to production
ARG NODE_ENV=ci
ARG PRODUCTION=$PRODUCTION
ARG CI=true
ENV NODE_ENV $NODE_ENV
ENV CI $CI
ENV TZ=Europe/Brussels
WORKDIR /app
RUN mkdir ./build/ &&chown -R node:node /app && chmod -R  g+s /app && chmod -R  g+w /app
COPY  . .
RUN chown -R node:node /app && chmod -R  g+sw /app
RUN apk add --no-cache --virtual .gyp python2 make g++ tzdata && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
#USER node
RUN npm ci --production=false
FROM node:16-alpine AS build
USER node
COPY --from=compile /app /app
# set our node environment, defaults to production
ARG NODE_ENV=production
ARG PRODUCTION=$PRODUCTION
ARG CI=true
ENV NODE_ENV $NODE_ENV
ENV CI $CI
ENV TZ=Europe/Brussels
ENV NODE_OPTIONS="--max_old_space_size=4096"
WORKDIR /app
USER node
RUN CI=false npm run build
# set permissions for openshift
#USER root
#RUN chmod -R g+rwx /app && chown 101:101 /app
FROM nginxinc/nginx-unprivileged
ENV NODE_ENV $NODE_ENV
ENV CI false
USER root
COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
WORKDIR /usr/share/nginx/html
COPY scripts/env.sh ./
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && chown 101:101 /docker-entrypoint.sh
RUN chgrp -R 101 /usr/share/nginx/html && chmod -R g+rwx /usr/share/nginx/html
# Run script which initializes env vars to fs
RUN chmod +x env.sh
USER nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
