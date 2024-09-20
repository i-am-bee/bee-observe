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

import { baseErrorResponseSchema } from '../utils/error.js';
import { unkownDataObjectSchema } from '../utils/swagger.js';

import { MlflowTraceStep } from './mlflow-trace.document.js';

export const traceMlflowTreeItemSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'name',
    'context',
    'attributes',
    'start_time',
    'end_time',
    'status_code',
    'status_message',
    'events'
  ],
  properties: {
    name: { type: 'string' },
    parent_id: { type: 'string', nullable: true },
    context: {
      type: 'object',
      additionalProperties: false,
      required: ['span_id', 'trace_id'],
      properties: {
        span_id: { type: 'string' },
        trace_id: { type: 'string' }
      }
    },
    attributes: {
      type: 'object',
      additionalProperties: true,
      required: ['mlflow.traceRequestId', 'mlflow.spanType'],
      properties: {
        'mlflow.traceRequestId': { type: 'string' },
        'mlflow.spanType': { type: 'string' }
      }
    },
    // mlflow requires number format for `start_time` and `end_time`
    start_time: { type: 'number' },
    end_time: { type: 'number' },
    status_code: { type: 'string' },
    status_message: { type: 'string' },
    events: {
      type: 'array',
      items: unkownDataObjectSchema
    }
  }
} as const satisfies JSONSchema;

export const traceMlflowSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'created_at', 'step'],
  properties: {
    id: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    request_id: { type: 'string' },
    step: {
      type: 'string',
      enum: [
        MlflowTraceStep.ADD_TREE,
        MlflowTraceStep.CHECK_TREE,
        MlflowTraceStep.CLOSE_TRACE,
        MlflowTraceStep.START_TRACE
      ]
    },
    error: { ...baseErrorResponseSchema, nullable: true },
    tree: {
      type: 'array',
      items: traceMlflowTreeItemSchema
    }
  }
} as const satisfies JSONSchema;

export type TraceMlflow = FromSchema<typeof traceMlflowSchema>;
export type TraceMlflowTreeItem = FromSchema<typeof traceMlflowTreeItemSchema>;
