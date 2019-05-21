FROM node:12-alpine AS build

# set our node environment, defaults to production
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --production=false

COPY . .

RUN npm run build

FROM nginx:alpine AS run

COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
