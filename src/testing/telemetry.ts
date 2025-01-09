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
import { buildUrl } from '../mlflow/utils/api/utils/build-url.js';

const traceExporter = new OTLPTraceExporter({
  headers: {
    [constants.BEE_AUTH_HEADER]: constants.AUTH_KEY
  },
  timeoutMillis: 120_000
});

const resource = new resources.Resource({
  [ATTR_SERVICE_NAME]: constants.OPENTELEMETRY.INSTRUMENTATION_SCOPE,
  [ATTR_SERVICE_VERSION]: '0.0.1'
});

// main sdk with the default BatchSpanProcessor and the Collector backend
export const spanTraceExporterProcessor = new node.BatchSpanProcessor(traceExporter);
export const sdk = new NodeSDK({
  resource,
  spanProcessors: [spanTraceExporterProcessor]
});

// sdk with the SimpleSpanProcessor and the Collector backend
export const sdkWithSimpleProcessor = new NodeSDK({
  resource,
  spanProcessors: [new node.SimpleSpanProcessor(traceExporter)]
});

// sdk with the SimpleSpanProcessor and direct Observe backend
export const sdkWithSimpleProcessorAndObserveBackend = new NodeSDK({
  resource,
  spanProcessors: [
    new node.SimpleSpanProcessor(
      new OTLPTraceExporter({
        url: buildUrl('v1/traces'),
        headers: {
          [constants.BEE_AUTH_HEADER]: constants.AUTH_KEY
        },
        timeoutMillis: 120_000
      })
    )
  ]
});
