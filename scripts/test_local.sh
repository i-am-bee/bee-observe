#!/bin/sh
# Copyright 2024 IBM Corp.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


## exit on first error
set -e

## turn off testing containers if are running
docker compose down
docker compose -f compose-before.yml down

## run containers
### pull latest versions
docker compose pull

### build the observe image
docker compose build

### run compose up and wait 120 seconds - in case of failure - cancel the operation and print logs
if timeout 120 yarn start:infra 2>/dev/null ; then
    echo '🆗 docker containers are working and ready to test'
else
    echo '❌ There is some error with the docker compose up command. Check your environments in .env.testing.docker and see docker logs ...'
    docker compose logs
    exit 1;
fi

### run migrations
yarn mikro-orm-esm migration:up

### run compose up and wait 120 seconds - in case of failure - cancel the operation and print logs
if timeout 120 docker compose up -d 2>/dev/null ; then
    echo '🆗 docker containers are working and ready to test'
else
    echo '❌ There is some error with the docker compose up command. Check your environments in .env.testing.docker and see docker logs ...'
    docker compose logs
    exit 1;
fi

## run integration tests
yarn run vitest --run

## 7) clean
docker compose down
docker compose -f compose-before.yml down

## 8) info
echo "✅ tests done"
