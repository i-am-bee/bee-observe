FROM node:20-alpine AS base
ENV APP_DIR=/home/node/app
ENV YARN_VERSION=4.3.1

RUN deluser --remove-home node \
  && addgroup -S node -g 1001 \
  && adduser -S -G node -u 1001 node

RUN mkdir -p ${APP_DIR}
WORKDIR ${APP_DIR}

# Install and use Yarn 4.x
RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

#### Build stage
FROM base AS builder
COPY --chown=node:node . .

## I had to remove the `--immutable` setting because there is a bug in the yarn 4.x versions. 
## There is probably an error in the checksum in the yarn.lock that is regenerated in the pipeline. Here are some sources:
##  - https://stackoverflow.com/questions/67062308/getting-yn0028-the-lockfile-would-have-been-modified-by-this-install-which-is-e
##  - https://github.com/renovatebot/renovate/discussions/9481
##  - https://community.redwoodjs.com/t/fsevents-causing-yarn-0028-error-deploying-to-netlify-and-the-lockfile-would-have-been-modified/7147/4
RUN yarn install

# Build the application
RUN yarn build

#### Runtime stage
FROM base AS runtime
COPY --chown=node:node --from=builder ${APP_DIR} ./

# 1. make group root (which has id 0) owner of the directory
# 2. add write permissions for the group to the directory
RUN chown -R 1001:0 ${APP_DIR} &&\
  chmod -R g+w ${APP_DIR}

ENV NODE_ENV=production
## RUN yarn install --immutable
RUN yarn workspaces focus --production && rm -rf "$(yarn cache clean)"

CMD ["node", "./dist/index.js"]
