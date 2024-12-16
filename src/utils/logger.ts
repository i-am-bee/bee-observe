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

import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { IncomingMessage } from 'node:http';

import { FastifyReply, FastifyRequest } from 'fastify';
import { Logger, LoggerOptions, pino } from 'pino';
import { requestContext } from '@fastify/request-context';

export function createLoggerConfig(
  options?: Omit<LoggerOptions, 'name' | 'level' | 'timestamp'>
): LoggerOptions {
  return {
    ...options,
    name: 'bee-observe',
    level: process.env.LOG_LEVEL || 'info',
    base: { hostname: os.hostname(), ...options?.base },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label };
      },
      ...options?.formatters
    }
  };
}

export const fastifyLogger = createLoggerConfig({
  serializers: {
    req(request: FastifyRequest) {
      return {
        host:
          request.headers['x-forwarded-host'] ||
          request.headers.host ||
          request.headers[':authority'],
        correlationId: request.id || null,
        ipAddress: request.ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress,
        method: request.method,
        url: request.url,
        hostname: request.hostname,
        params: request.params
      };
    },
    res(response: FastifyReply) {
      return {
        hostname: response.request?.hostname,
        correlationId: response.request?.id || null,
        statusMessage: response.raw?.statusMessage,
        statusCode: response.statusCode
      };
    }
  }
});

export const LogLabels = {
  ALERT: 'alert',
  CORRELATION_ID: 'correlationId'
} as const;

const log = pino(createLoggerConfig());

export const getLogger = () => {
  const request = requestContext.get('request');
  if (!request?.id) {
    return log;
  }

  return log.child({
    [LogLabels.CORRELATION_ID]: request.id
  });
};

export const CORRELATION_ID_HEADER = 'x-correlation-id';

export const getCorrelationId = (req: IncomingMessage) => {
  const correlationId = Array.isArray(req.headers[CORRELATION_ID_HEADER])
    ? req.headers[CORRELATION_ID_HEADER][0]
    : req.headers[CORRELATION_ID_HEADER];
  return correlationId ?? randomUUID();
};
