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

import './utils/load-config.js';

import Fastify from 'fastify';
import { RequestContext } from '@mikro-orm/core';
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';

import { initTerminus } from './utils/terminus.js';
import { authPlugin } from './utils/auth.js';
import { createTTLIndexes, initORM } from './utils/db.js';
import { swaggerPlugin } from './utils/swagger.js';
import { constants } from './utils/constants.js';
import traceModule from './trace/trace.module.js';
import spanModule from './span/span.module.js';
import systemModule from './system/system.module.js';
import { LogLabels, fastifyLogger, getCorrelationId } from './utils/logger.js';
import { contextPlugin } from './utils/context.js';
import { errorPlugin } from './utils/error.js';
import { traceProtobufBufferParser } from './trace/trace.service.js';

interface BootstrapOptions {
  port: number;
}

export async function bootstrap({ port }: BootstrapOptions) {
  const app = Fastify({
    logger: fastifyLogger,
    requestIdHeader: false,
    genReqId: getCorrelationId,
    requestIdLogLabel: LogLabels.CORRELATION_ID,
    pluginTimeout: 60_000,
    bodyLimit: constants.FASTIFY_BODY_LIMIT
  }).withTypeProvider<JsonSchemaToTsProvider>();

  // Custom parser for "application/x-protobuf"
  app.addContentTypeParser(
    'application/x-protobuf',
    { parseAs: 'buffer' },
    traceProtobufBufferParser
  );

  // orm
  const db = await initORM();
  //// "request context" per request
  app.addHook('onRequest', (request, reply, done) => {
    RequestContext.create(db.em, done);
  });
  app.addHook('onClose', async () => {
    await db.orm.close();
  });
  //// TTL Indexes
  await createTTLIndexes({
    expireAfterSeconds: constants.DATA_EXPIRATION_IN_DAYS * 24 * 60 * 60
  });

  // terminus
  initTerminus(app, {
    gracefulPeriod: process.env.NODE_ENV === 'production' ? 10000 : 0, // 10s in production
    timeout: 25000 // 25s
  });

  // error
  app.register(errorPlugin);

  // auth
  app.register(authPlugin);

  // swagger
  app.register(swaggerPlugin);

  // context
  app.register(contextPlugin);

  // Declare all routes
  app.after(() => {
    app.register(traceModule, { prefix: '/v1' });
    app.register(spanModule, { prefix: '/v1' });
    app.register(systemModule);
  });

  const url = await app.listen({ port, host: '0.0.0.0' });

  return { url, app };
}
