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

import { FromSchema, JSONSchema } from 'json-schema-to-ts';

export const systemGetResponseSchema = {
  type: 'object',
  required: ['version', 'git', 'mlflow'],
  properties: {
    version: { type: 'string' },
    git: {
      type: 'object',
      additionalProperties: false,
      required: ['tag'],
      properties: {
        tag: { type: 'string' }
      }
    },
    mlflow: {
      type: 'object',
      additionalProperties: false,
      required: ['default_experiment_id', 'url'],
      properties: {
        url: { type: 'string' },
        default_experiment_id: { type: 'string' }
      }
    }
  }
} as const satisfies JSONSchema;

export type SystemGetResponse = FromSchema<typeof systemGetResponseSchema>;
