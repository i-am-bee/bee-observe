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

import { StatusCodes } from 'http-status-codes';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginAsync, FastifySchema } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { constants } from './constants.js';
import {
  badRequestResponseSchema,
  baseErrorResponseSchema,
  internalServerErrorResponseSchema,
  notFoundResponseSchema,
  unauthorizedResponseSchema
} from './error.js';

export function withResultsResponse(schema: JSONSchema) {
  return {
    [StatusCodes.OK]: {
      type: 'object',
      additionalProperties: false,
      required: ['results', 'total_count'],
      properties: {
        results: {
          type: 'array',
          items: schema
        },
        total_count: { type: 'integer' }
      }
    } as const satisfies JSONSchema
  };
}

export function withResultResponse(schema: JSONSchema) {
  return {
    [StatusCodes.OK]: {
      type: 'object',
      additionalProperties: false,
      required: ['result'],
      properties: {
        result: schema
      }
    } as const satisfies JSONSchema
  };
}

export function getPaginationSchema({ limit, default: def } = { limit: 100, default: 100 }) {
  const paginationSchema = {
    type: 'object',
    required: ['limit', 'offset'],
    additionalProperties: false,
    properties: {
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: limit,
        default: def
      },
      offset: {
        type: 'integer',
        minimum: 0,
        default: 0
      }
    }
  } as const satisfies JSONSchema;

  return paginationSchema;
}

export type Pagination = FromSchema<ReturnType<typeof getPaginationSchema>>;

export enum Tags {
  Trace = 'trace',
  Span = 'span'
}

function computeErrorResponseReferenceSchema({
  referenceName,
  description
}: {
  referenceName: string;
  description: string;
}) {
  return {
    description,
    content: {
      'application/json': {
        schema: {
          $ref: `#/components/schemas/${referenceName}`
        }
      }
    }
  };
}

export const swaggerPlugin: FastifyPluginAsync = fp.default(async (app: FastifyInstance) => {
  app.register(swagger, {
    openapi: {
      info: {
        title: 'bee-observe',
        version: constants.GIT_TAG
      },
      openapi: '3.1.0',
      // sort tags by name asc (default sorting)
      tags: Object.values(Tags)
        .sort()
        .map((tag) => ({ name: tag })),
      components: {
        securitySchemes: {
          beeKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: constants.BEE_AUTH_HEADER
          }
        },
        schemas: {
          BaseErrorResponse: baseErrorResponseSchema,
          UnauthorizedResponse: unauthorizedResponseSchema,
          NotFoundResponse: notFoundResponseSchema,
          BadRequestResponse: badRequestResponseSchema,
          InternalServerErrorResponse: internalServerErrorResponseSchema
        } as any // Bypass type error
      },
      security: [
        {
          beeKeyAuth: []
        }
      ]
    },
    transform: ({ schema, url, route }) => {
      const allowNotFoundResponse =
        (!Array.isArray(route.method) && route.method !== 'GET') || schema?.params != undefined;

      const parsedSchema: FastifySchema = {
        ...schema,
        response: {
          ...(schema?.response ?? {}),
          [StatusCodes.UNAUTHORIZED]: computeErrorResponseReferenceSchema({
            description: unauthorizedResponseSchema.allOf[1].description,
            referenceName: 'UnauthorizedResponse'
          }),
          ...(allowNotFoundResponse && {
            [StatusCodes.NOT_FOUND]: computeErrorResponseReferenceSchema({
              description: notFoundResponseSchema.allOf[1].description,
              referenceName: 'NotFoundResponse'
            })
          }),
          ...(schema && {
            [StatusCodes.BAD_REQUEST]: computeErrorResponseReferenceSchema({
              description: badRequestResponseSchema.allOf[1].description,
              referenceName: 'BadRequestResponse'
            })
          }),
          ...(schema && {
            [StatusCodes.INTERNAL_SERVER_ERROR]: computeErrorResponseReferenceSchema({
              description: internalServerErrorResponseSchema.allOf[1].description,
              referenceName: 'InternalServerErrorResponse'
            })
          })
        }
      };

      return { schema: parsedSchema, url: url };
    }
  });

  app.register(swaggerUi, {
    routePrefix: constants.DOCS_ROUTE_PREFIX,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  });
});

export const unkownDataObjectSchema = {
  type: 'object',
  additionalProperties: true
} as const satisfies JSONSchema;

export const includeProperty = { type: 'boolean', default: false } as const satisfies JSONSchema;
