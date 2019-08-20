FROM node:12-alpine AS build

# set our node environment, defaults to production
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /app

COPY package.json package-lock.json .npmrc ./

RUN npm ci --production=false

COPY . .
RUN npm run build
# set permissions for openshift
RUN chgrp -R 0 /app/build && chmod -R g+rwX /app/build 

FROM nginxinc/nginx-unprivileged AS run

COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

WORKDIR /usr/share/nginx/html
COPY .env scripts/env.sh ./

# Run script which initializes env vars to fs
RUN chmod +x env.sh
RUN ./env.sh

USER nginx
