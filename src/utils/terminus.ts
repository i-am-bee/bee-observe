/**
 * Copyright 2024 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { setTimeout as setTimeoutPromise } from 'node:timers/promises';

import { createTerminus } from '@godaddy/terminus';
import { FastifyInstance } from 'fastify';

interface Options {
  // Time in miliseconds since receiving SIGTERM to stoping server.
  // needed for kubernetes because its all asynchronous so pod can be
  // terminated but still kubernetes could route new connections for it
  gracefulPeriod?: number;
  // Timeout for in-flight requests to complete until they are forcefuly terminated
  timeout?: number;
}

export function initTerminus(
  app: FastifyInstance<any, any, any, any, any>,
  { gracefulPeriod = 0, timeout }: Options = {}
) {
  const beforeShutdown = async () => {
    app.log.info('Server received SIGTERM, closing...');
    if (gracefulPeriod > 0) await setTimeoutPromise(gracefulPeriod);
  };

  createTerminus(app.server, {
    signals: ['SIGTERM', 'SIGINT'],
    timeout,
    useExit0: true,
    healthChecks: {
      '/health': () => Promise.resolve()
    },
    beforeShutdown,
    onShutdown: async () => app.log.info('Server has successfully shut down'),
    sendFailuresDuringShutdown: false,
    logger: (msg, error) => {
      app.log.error({ error }, msg);
    }
  });
}
