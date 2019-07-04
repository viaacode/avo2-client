FROM node:12-alpine AS build

# set our node environment, defaults to production
ARG NODE_ENV=production
ARG REACT_APP_PROXY_URL=http://avo2-proxy-qas-sc-avo2.apps.do-prd-okp-m0.do.viaa.be
ENV NODE_ENV $NODE_ENV
ENV REACT_APP_PROXY_URL $REACT_APP_PROXY_URL

WORKDIR /app

COPY package.json package-lock.json .npmrc ./

RUN npm ci --production=false

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged AS run

COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
USER nginx
