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

import { spanSchema } from '../span/span.dto.js';
import { getPaginationSchema, includeProperty } from '../utils/swagger.js';
import { unkownDataObjectSchema } from '../utils/swagger.js';
import { traceMlflowSchema } from '../mlflow/mlflow-trace.dto.js';

const traceErrorSchema = {
  type: 'object',
  required: ['code', 'message'],
  additionalProperties: false,
  properties: {
    code: { type: 'string' },
    message: { type: 'string' }
  }
} as const satisfies JSONSchema;

const metadataSchema = {
  type: 'object',
  maxProperties: 16,
  propertyNames: {
    pattern: '^.{1,64}$'
  },
  patternProperties: {
    '.*': { type: 'string', maxLength: 512 }
  },
  additionalProperties: false
} as const satisfies JSONSchema;

const traceTreeItemEventSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'status_code', 'data', 'start_time', 'end_time'],
  properties: {
    name: spanSchema.properties.name,
    status_code: spanSchema.properties.status_code,
    status_message: { ...spanSchema.properties.status_message, nullable: true },
    start_time: spanSchema.properties.start_time,
    data: { ...spanSchema.properties.attributes.properties.data, nullable: true },
    end_time: spanSchema.properties.end_time
  }
} as const satisfies JSONSchema;

const traceTreeItemBase = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'target', 'start_time', 'end_time', 'status_code'],
  properties: {
    id: { type: 'string' },
    target: spanSchema.properties.attributes.properties.target,
    start_time: { type: 'string', format: 'date-time' },
    end_time: { type: 'string', format: 'date-time' },
    status_code: spanSchema.properties.status_code,
    events: {
      type: 'array',
      items: traceTreeItemEventSchema
    }
  }
} as const satisfies JSONSchema;

const createTreeItemSchema = (level: number): JSONSchema => {
  return {
    ...traceTreeItemBase,
    required: [...traceTreeItemBase.required, 'children'],
    properties: {
      ...traceTreeItemBase.properties,
      children:
        level === 0
          ? {
              type: 'array',
              items: unkownDataObjectSchema,
              maxItems: 0
            }
          : {
              type: 'array',
              items: createTreeItemSchema(--level)
            }
    }
  } as const satisfies JSONSchema;
};

const traceTreeItemSchema = createTreeItemSchema(5);

/**
 * We will split the current message, which text is provided as a prompt and the history of previous messages
 */
const traceRequestSchema = {
  type: 'object',
  additionalProperties: true,
  required: [],
  properties: {
    message: { type: 'string' },
    history: {
      type: 'array',
      items: {
        type: 'object',
        required: ['role', 'content'],
        additionalProperties: false,
        properties: {
          role: { type: 'string' },
          content: { type: 'string' },
          metadata: metadataSchema
        }
      }
    },
    connector: {
      type: 'object',
      additionalProperties: false,
      required: ['version'],
      properties: {
        version: { type: 'string' }
      }
    },
    framework: {
      type: 'object',
      additionalProperties: false,
      required: ['version'],
      properties: {
        version: { type: 'string' }
      }
    },
    rawPrompt: {
      type: 'string'
    }
  }
} as const satisfies JSONSchema;

const traceResponseSchema = {
  type: 'object',
  required: ['text'],
  additionalProperties: true,
  properties: {
    text: { type: 'string' }
  }
} as const satisfies JSONSchema;

export const traceSchema = {
  type: 'object',
  required: ['id', 'start_at', 'finish_at', 'request'],
  properties: {
    id: { type: 'string' },
    start_at: { type: 'string' },
    finish_at: { type: 'string' },
    tree: {
      type: 'array',
      nullable: true,
      items: traceTreeItemSchema
    },
    mlflow: { ...traceMlflowSchema, nullable: true },
    request: traceRequestSchema,
    response: traceResponseSchema
  }
} as const satisfies JSONSchema;

export const traceGetOneParamsSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' }
  }
} as const satisfies JSONSchema;

export const traceGetOneQuerySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    include_tree: includeProperty,
    include_mlflow: includeProperty,
    include_mlflow_tree: includeProperty
  }
} as const satisfies JSONSchema;

export const TracePostBodySchema = {
  type: 'object',
  required: ['request', 'spans'],
  properties: {
    /**
     * It will be distributed as JSON to all clients
     * Basically, the most important request property will be messages but everything else can be recorded like:
     * - tools
     * - input final prompt template
     * - memory information
     */
    request: traceRequestSchema,
    response: traceResponseSchema,
    spans: {
      type: 'array',
      minItems: 1,
      items: spanSchema
    },
    // eveluation optional part
    experiment_tracker: {
      type: 'object',
      nullable: true,
      properties: {
        experiment_id: { type: 'string' },
        run_id: { type: 'string' }
      }
    }
  }
} as const satisfies JSONSchema;

const paginationSchema = getPaginationSchema();
export const traceGetQuerySchema = {
  ...paginationSchema,
  properties: {
    ...paginationSchema.properties,
    ...traceGetOneQuerySchema.properties
  }
} as const satisfies JSONSchema;

export type TraceDto = FromSchema<typeof traceSchema>;
export type TraceError = FromSchema<typeof traceErrorSchema>;
export type TraceGetOneParams = FromSchema<typeof traceGetOneParamsSchema>;
export type TracePostBody = FromSchema<typeof TracePostBodySchema>;
export type TraceRequest = FromSchema<typeof traceRequestSchema>;
export type TraceResponse = FromSchema<typeof traceResponseSchema>;
export type TraceGetOneQuery = FromSchema<typeof traceGetOneQuerySchema>;
export type TraceGetQuery = FromSchema<typeof traceGetQuerySchema>;
export type TraceTreeItem = FromSchema<typeof traceTreeItemSchema>;
