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

import { FastifyPluginAsync } from 'fastify';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import fp from 'fastify-plugin';
import { StatusCodes } from 'http-status-codes';

import { constants } from './constants.js';

export enum ErrorWithPropsCodes {
  AUTH_ERROR = 'AUTH_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  NOT_FOUND = 'NOT_FOUND',
  SERVICE_ERROR = 'SERVICE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS'
}

interface ErrorWithPropsConfig {
  addRetryAfterHeader?: boolean;
}

export class ErrorWithProps<CODE extends ErrorWithPropsCodes, REASON extends string> extends Error {
  public readonly code: CODE;
  public readonly reason?: REASON;
  public readonly statusCode: StatusCodes;
  public readonly config?: ErrorWithPropsConfig;

  constructor(
    message: string,
    { code, reason }: { code: CODE; reason?: REASON },
    statusCode: StatusCodes,
    config?: ErrorWithPropsConfig
  ) {
    super(message);
    this.code = code;
    this.reason = reason;
    this.statusCode = statusCode;
    this.config = config;
  }

  toDto(): BaseErrorResponse {
    return {
      code: this.code,
      reason: this.reason,
      message: this.message
    };
  }
}

export class MlflowError<
  CODE extends ErrorWithPropsCodes,
  REASON extends string,
  RESPONSE extends Response
> extends ErrorWithProps<CODE, REASON> {
  public readonly response: RESPONSE;

  constructor(
    message: string,
    { code, reason, response }: { code: CODE; reason?: REASON; response: RESPONSE },
    statusCode: StatusCodes,
    config?: ErrorWithPropsConfig
  ) {
    super(message, { code, reason }, statusCode, config);
    this.response = response;
  }

  toDto(): BaseErrorResponse {
    return {
      code: this.code,
      reason: this.reason,
      message: this.message,
      respones: this.response
    };
  }
}

export const errorPlugin: FastifyPluginAsync = fp.default(async (app) => {
  app.setNotFoundHandler((request, reply) => {
    reply.status(StatusCodes.NOT_FOUND).send({
      code: ErrorWithPropsCodes.NOT_FOUND,
      message: 'Route does not exist'
    });
  });

  app.setErrorHandler(function (error, request, reply) {
    if (error instanceof ErrorWithProps) {
      if (
        [
          StatusCodes.SERVICE_UNAVAILABLE,
          StatusCodes.TOO_MANY_REQUESTS,
          StatusCodes.MOVED_PERMANENTLY
        ].includes(error.statusCode)
      ) {
        reply.header('Retry-After', constants.RETRY_AFTER_SECONDS);
      }
      if (error.config?.addRetryAfterHeader) {
        reply.header('Retry-After', constants.RETRY_AFTER_SECONDS);
      }
      reply.status(error.statusCode).send(error.toDto());
    } else if (error instanceof SyntaxError) {
      // When request body cannot by parsed by ContentTypeParser
      reply.status(StatusCodes.BAD_REQUEST).send({
        code: ErrorWithPropsCodes.INVALID_ARGUMENT,
        message: 'An unspecified syntax error occurred'
      });
    } else if ('validation' in error && error.statusCode === StatusCodes.BAD_REQUEST) {
      // This is ajv validation error
      reply.status(StatusCodes.BAD_REQUEST).send({
        code: ErrorWithPropsCodes.INVALID_ARGUMENT,
        message: error.message
      });
    } else if (error.statusCode) {
      reply.status(error.statusCode).send({
        code: error.code,
        message: error.message
      });
    } else {
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        code: ErrorWithPropsCodes.INTERNAL_SERVER_ERROR,
        message: 'An unspecified error occurred'
      });
    }
    this.log.error(error);
  });
});

function createErrorSchema({
  description,
  code
}: {
  description: string;
  code: ErrorWithPropsCodes;
}) {
  return {
    allOf: [
      {
        $ref: '#/components/schemas/BaseErrorResponse'
      },
      {
        type: 'object',
        description,
        required: ['code'],
        properties: {
          code: {
            const: code
          }
        }
      }
    ]
  } as const satisfies JSONSchema;
}

export const baseErrorResponseSchema = {
  type: 'object',
  required: ['code', 'message'],
  properties: {
    code: {
      type: 'string'
    },
    reason: {
      type: 'string'
    },
    message: {
      type: 'string'
    },
    data: {
      type: 'object',
      additionalProperties: true
    }
  }
} as const satisfies JSONSchema;
export type BaseErrorResponse = FromSchema<typeof baseErrorResponseSchema>;

export const unauthorizedResponseSchema = createErrorSchema({
  description: 'Unauthorized route access.',
  code: ErrorWithPropsCodes.AUTH_ERROR
});

export const notFoundResponseSchema = createErrorSchema({
  description: 'The server can not find requested resource.',
  code: ErrorWithPropsCodes.NOT_FOUND
});

export const badRequestResponseSchema = createErrorSchema({
  description:
    'Server could not understand the request due to invalid syntax. In most cases relates with the schema validation.',
  code: ErrorWithPropsCodes.INVALID_ARGUMENT
});

export const internalServerErrorResponseSchema = createErrorSchema({
  description:
    'The server encountered an unexpected condition that prevented it from fulfilling the request.',
  code: ErrorWithPropsCodes.INTERNAL_SERVER_ERROR
});

export function toBaseErrorResponseDto(error: unknown): BaseErrorResponse | undefined {
  if (error instanceof ErrorWithProps) return error.toDto();
  if (error instanceof Error)
    return {
      code: ErrorWithPropsCodes.INTERNAL_SERVER_ERROR,
      message: error.message
    };
  return undefined;
}
