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

import { includeProperty, unkownDataObjectSchema } from '../utils/swagger.js';

export const spanSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'start_time', 'end_time', 'context', 'attributes', 'status_code'],
  properties: {
    name: { type: 'string' },
    parent_id: { type: 'string' },
    start_time: { type: 'string', format: 'date-time' },
    end_time: { type: 'string', format: 'date-time' },
    status_code: { type: 'string', enum: ['ERROR', 'OK'] },
    status_message: { type: 'string' },
    context: {
      type: 'object',
      required: ['span_id'],
      additionalProperties: false,
      properties: {
        span_id: { type: 'string' }
      }
    },
    attributes: {
      type: 'object',
      required: ['target'],
      additionalProperties: false,
      properties: {
        target: { type: 'string' },
        data: { ...unkownDataObjectSchema, nullable: true },
        ctx: { ...unkownDataObjectSchema, nullable: true }
      }
    }
  }
} as const satisfies JSONSchema;

export const spanGetOneQueryStringSchema = {
  type: 'object',
  required: ['trace_id'],
  properties: {
    trace_id: { type: 'string' },
    include_attributes_ctx: includeProperty
  }
} as const satisfies JSONSchema;

export type SpanDto = FromSchema<typeof spanSchema>;
export type SpanGetOneQueryString = FromSchema<typeof spanGetOneQueryStringSchema>;
