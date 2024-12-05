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
import { StatusCodes } from 'http-status-codes';

import { systemGetResponseSchema } from './system.dto.js';
import { getSystemData } from './system.service.js';

const module: FastifyPluginAsyncJsonSchemaToTs = async (app) => {
  app.get(
    '/system',
    {
      preHandler: app.auth([app.beeAuth]),
      schema: {
        hide: true,
        response: {
          [StatusCodes.OK]: systemGetResponseSchema
        }
      }
    },
    () => {
      return getSystemData();
    }
  );
};

export default module;