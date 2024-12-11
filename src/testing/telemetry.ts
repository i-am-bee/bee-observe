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

import '@opentelemetry/instrumentation/hook.mjs';
import { NodeSDK, resources, node } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

import { constants } from '../utils/constants.js';

import { buildUrl } from './utils.js';

const traceExporter = new OTLPTraceExporter({
  url: buildUrl('v1/traces'),
  headers: {
    [constants.BEE_AUTH_HEADER]: constants.AUTH_KEY
  },
  timeoutMillis: 120_000
});
export const spanTraceExporterProcessor = new node.BatchSpanProcessor(traceExporter);

export const sdk = new NodeSDK({
  resource: new resources.Resource({
    [ATTR_SERVICE_NAME]: 'bee-agent-framework',
    [ATTR_SERVICE_VERSION]: '0.0.1'
  }),
  spanProcessors: [spanTraceExporterProcessor]
});
