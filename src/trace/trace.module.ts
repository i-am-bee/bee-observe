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

import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';

import { withResultsResponse, withResultResponse, Tags } from '../utils/swagger.js';

import {
  traceSchema,
  traceGetOneParamsSchema,
  TraceGetOneParams,
  TracePostBodySchema,
  TracePostBody,
  TraceGetOneQuery,
  traceGetOneQuerySchema,
  traceGetQuerySchema,
  TraceGetQuery
} from './trace.dto.js';
import { createTrace, getTrace, getTraces } from './trace.service.js';

const module: FastifyPluginAsyncJsonSchemaToTs = async (app) => {
  app.get<{ Querystring: TraceGetQuery }>(
    '/trace',
    {
      preHandler: app.auth([app.beeAuth]),
      schema: {
        response: withResultsResponse(traceSchema),
        querystring: traceGetQuerySchema,
        tags: [Tags.Trace]
      }
    },
    async ({ query }) => {
      const { traces, totalCount } = await getTraces(query);
      return {
        total_count: totalCount,
        results: traces
      };
    }
  );

  app.get<{ Params: TraceGetOneParams; Querystring: TraceGetOneQuery }>(
    '/trace/:id',
    {
      preHandler: app.auth([app.beeAuth]),
      schema: {
        response: withResultResponse(traceSchema),
        params: traceGetOneParamsSchema,
        querystring: traceGetOneQuerySchema,
        tags: [Tags.Trace]
      }
    },
    async ({ params, query }) => {
      const trace = await getTrace({ id: params.id, query });

      return {
        result: trace
      };
    }
  );

  app.post<{ Body: TracePostBody }>(
    '/trace',
    {
      preHandler: app.auth([app.beeAuth]),
      schema: {
        response: withResultResponse(traceSchema),
        body: TracePostBodySchema,
        tags: [Tags.Trace]
      }
    },
    async ({ body }) => {
      const trace = await createTrace(body);

      return {
        result: trace
      };
    }
  );
};

export default module;