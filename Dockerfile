###################################################################
## Build image: install all dependencies and build the app
###################################################################
FROM docker.io/library/node:24-alpine AS build
ARG NODE_ENV=production
ARG CI=true
ENV NODE_ENV=$NODE_ENV
ENV CI=$CI
# Node ships its own timezone data (ICU), so no need to install tzdata
ENV TZ=Europe/Brussels
# NODE_OPTIONS is inherited by all child processes (npm run, vite, ...)
ENV NODE_OPTIONS="--max_old_space_size=2048"
WORKDIR /app
RUN chown node:node /app
USER node

# Install node dependencies first, so this layer is cached as long as the lockfile doesn't change
COPY --chown=node:node package.json package-lock.json .npmrc ./
RUN npm ci --include=dev --no-audit --no-fund

# Copy source code and build the app
COPY --chown=node:node . .
RUN npm run build
# Add cookiebot attribute to script in index.html. Fails if no replacements were made.
RUN npm run add-cookiebot-attribute

###################################################################
## Release files: only keep what the server needs at runtime
###################################################################
FROM build AS release
# Remove the dev dependencies that were only needed during the build stage
# and collect all runtime files in /app/release
# Openshift runs the container with a random uid in the root group,
# so the group needs the same permissions as the owner (g=u).
# Doing this in an intermediate stage avoids duplicating all files in an extra layer of the final image.
RUN npm prune --omit=dev --no-audit --no-fund \
  && mkdir -p release/scripts dist/client dist/server/.vite \
  && mv dist node_modules package.json package-lock.json release/ \
  && cp scripts/env.js scripts/copy-robots-txt-file.js scripts/robots-enable-indexing.txt scripts/robots-disable-indexing.txt release/scripts/ \
  && chmod -R g=u release

###################################################################
## Serve client using a node server for server side rendering
###################################################################
FROM docker.io/library/node:24-alpine AS serve
ENV NODE_ENV=production
WORKDIR /app
COPY --from=release --chown=node:0 /app/release /app
RUN chgrp 0 /app && chmod g=u /app
USER node
# Write env variables to js file, copy robots.txt file and start server
CMD ["sh", "-c", "node ./scripts/env.js && node ./scripts/copy-robots-txt-file.js && node ./dist/server/server.js"]
