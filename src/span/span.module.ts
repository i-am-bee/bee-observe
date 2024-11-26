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

import { Tags, withResultsResponse } from '../utils/swagger.js';

import { getSpans } from './span.service.js';
import { spanGetOneParamsSchema, spanGetOneQuerySchema, spanSchema } from './span.dto.js';

const module: FastifyPluginAsyncJsonSchemaToTs = async (app) => {
  app.get(
    '/traces/:trace_id/spans', // TODO:
    {
      preHandler: app.auth([app.beeAuth]),
      schema: {
        response: withResultsResponse(spanSchema),
        querystring: spanGetOneQuerySchema,
        params: spanGetOneParamsSchema,
        tags: [Tags.Span]
      }
    },
    async ({ query, params }) => {
      const { spans, totalCount } = await getSpans({ ...query, ...params });
      return {
        total_count: totalCount,
        results: spans
      };
    }
  );
};

export default module;
