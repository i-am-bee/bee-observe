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

import * as dotenv from 'dotenv-safe';

import { SupportedAuthorizationType } from '../mlflow/utils/api/types.js';

const AUTH_KEY = process.env.AUTH_KEY;
if (!AUTH_KEY || AUTH_KEY.length === 0) {
  throw new Error('AUTH_KEY is not defined');
}

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL || REDIS_URL.length === 0) {
  throw new Error('REDIS_URL is not defined');
}

const MLFLOW_API_URL = process.env.MLFLOW_API_URL;
if (!MLFLOW_API_URL || MLFLOW_API_URL.length === 0) {
  throw new Error('API_URL is not defined');
}

const MLFLOW_AUTHORIZATION = process.env.MLFLOW_AUTHORIZATION;
if (
  !MLFLOW_AUTHORIZATION ||
  !Object.values(SupportedAuthorizationType).includes(
    MLFLOW_AUTHORIZATION as SupportedAuthorizationType
  )
) {
  throw new Error('Invalid MLFLOW_AUTHORIZATION type is provided');
}

const MLFLOW_USERNAME = process.env.MLFLOW_USERNAME;
const MLFLOW_PASSWORD = process.env.MLFLOW_PASSWORD;
if (
  MLFLOW_AUTHORIZATION === SupportedAuthorizationType.BASE_AUTH &&
  (!MLFLOW_USERNAME || !MLFLOW_PASSWORD)
) {
  throw new Error(
    'MLFLOW_USERNAME and MLFLOW_PASSWORD must be defined for the BASE_AUTH authorization type'
  );
}

export const constants = Object.freeze({
  PORT: parseInt(process.env.PORT || '4318'),
  AUTH_KEY,
  BEE_AUTH_HEADER: 'x-bee-authorization',
  GIT_TAG: process.env.GIT_TAG || '0.0.0',
  DOCS_ROUTE_PREFIX: process.env.DOCS_ROUTE_PREFIX || '/docs',
  // https://fastify.dev/docs/v2.15.x/Documentation/Server/#bodylimit
  FASTIFY_BODY_LIMIT: parseInt(process.env.FASTIFY_BODY_LIMIT || '10485760'), // default is 10 MB
  REDIS_URL,
  DATA_EXPIRATION_IN_DAYS: parseInt(process.env.DATA_EXPIRATION_IN_DAYS || '7'),
  MLFLOW: Object.freeze({
    API_URL: MLFLOW_API_URL,
    AUTHORIZATION: Object.freeze({
      type: MLFLOW_AUTHORIZATION,
      username: MLFLOW_USERNAME || '',
      password: MLFLOW_PASSWORD || ''
    }),
    DEFAULT_EXPERIMENT_ID: process.env.MLFLOW_DEFAULT_EXPERIMENT_ID || '0',
    TRACE_DELETE_IN_BATCHES_CRON_PATTERN:
      process.env.MLFLOW_TRACE_DELETE_IN_BATCHES_CRON_PATTERN || '0 */1 * * * *',
    TRACE_DELETE_IN_BATCHES_BATCH_SIZE: parseInt(
      process.env.MLFLOW_TRACE_DELETE_IN_BATCHES_BATCH_SIZE || '100'
    )
  }),
  OPENTELEMETRY: {
    INSTRUMENTATION_SCOPE: 'bee-agent-framework'
  }
});
