FROM nginxinc/nginx-unprivileged
USER nginx
FROM docker.io/library/node:24-alpine AS compile
# set our node environment, defaults to production
ARG NODE_ENV=ci
ARG PRODUCTION=$PRODUCTION
ARG CI=true
ENV NODE_ENV $NODE_ENV
ENV CI $CI
ENV TZ=Europe/Brussels
WORKDIR /app
RUN mkdir ./dist/ && mkdir ./dist-embed &&chown -R node:node /app && chmod -R  g+s /app && chmod -R  g+w /app
COPY  --chown=node:node . .
RUN chown -R node:node /app && chmod -R  g+sw /app
RUN apk update
RUN apk add --no-cache --virtual python2 make g++ tzdata && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
USER node
RUN npm ci --include=dev --legacy-peer-deps

## Builder image
FROM docker.io/library/node:24-alpine AS build
USER node
COPY --from=compile /app /app
# set our node environment, defaults to production
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV
ENV NODE_OPTIONS="--max_old_space_size=2048"
WORKDIR /app
# Build the app
# try alias to keep --max_old_space_size=2048 in subprocesses
RUN alias npm='node --max_old_space_size=2048 /usr/bin/npm' >> ~/.bash_aliases && . ~/.bash_aliases && npm run build
# Add cookiebot attribute to script in index.html. Fails if no replacements were made.
RUN npm run add-cookiebot-attribute

## final image with static serving with nginx
FROM nginxinc/nginx-unprivileged
ENV NODE_ENV $NODE_ENV
USER root
COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
WORKDIR /usr/share/nginx/html
COPY scripts/env.sh ./
COPY scripts/robots-enable-indexing.txt ./
COPY scripts/robots-disable-indexing.txt ./
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && chown 101:101 /docker-entrypoint.sh
RUN chgrp -R 101 /usr/share/nginx/html && chmod -R g+rwx /usr/share/nginx/html
# Run script which initializes env vars to fs
RUN chmod +x env.sh
USER nginx
ENTRYPOINT ["/docker-entrypoint.sh"]


