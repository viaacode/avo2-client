###################################################################
## Compile image
###################################################################
FROM docker.io/library/node:24-alpine AS compile
# set our node environment, defaults to production
ARG NODE_ENV=ci
ARG PRODUCTION=$PRODUCTION
ARG CI=true
ENV NODE_ENV $NODE_ENV
ENV CI $CI
ENV TZ=Europe/Brussels
WORKDIR /app

# update timezone for image
RUN apk update
RUN apk add --no-cache tzdata
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime
RUN echo $TZ > /etc/timezone

# prep folders to copy source code
RUN mkdir ./dist
RUN mkdir ./dist-embed
RUN chown -R node:node /app
RUN chmod -R g+s /app
RUN chmod -R g+w /app

# copy source code
COPY --chown=node:node . .
RUN chmod -R g+sw /app

# install node dependencies
USER node
RUN npm ci --include=dev

###################################################################
## Builder image
###################################################################
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

# Remove the dev dependencies that were only needed during the build stage
RUN npm prune --omit=dev

###################################################################
## Servce client using a node server for server side rendering
###################################################################
FROM docker.io/library/node:24-alpine AS serve
USER node
ENV NODE_ENV $NODE_ENV
WORKDIR /app

# copy folders
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/node_modules ./node_modules

# copy files
COPY --from=build --chown=node:node /app/scripts/env.js ./scripts/env.js
COPY --from=build --chown=node:node /app/scripts/copy-robots-txt-file.js ./scripts/copy-robots-txt-file.js
COPY --from=build --chown=node:node /app/scripts/robots-enable-indexing.txt ./scripts/robots-enable-indexing.txt
COPY --from=build --chown=node:node /app/scripts/robots-disable-indexing.txt ./scripts/robots-disable-indexing.txt
COPY --from=build --chown=node:node /app/package*.json ./

RUN ls -l /app/scripts

USER root
# Ensure vite can write cache to /app/dist/server/.vite
# Ensure node can write to app/dist for adding the robots.txt and env-config.js file
RUN mkdir -p /app/dist/client /app/dist/server/.vite \
  && chgrp -R 0 /app \
  && chmod -R g=u /app

USER node
# Run npm run start script
CMD ["npm", "run", "start"]
