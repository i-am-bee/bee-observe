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

import { expect, it, describe, beforeAll, afterAll } from 'vitest';

import { sdk, spanTraceExporterProcessor } from '../testing/telemetry.js';
import {
  generateTrace,
  makeRequest,
  sendCustomProtobuf,
  waitForMlflowTrace
} from '../testing/utils.js';

let traceId: string | undefined = undefined;
const prompt = 'hello';

describe('trace module', () => {
  beforeAll(async () => {
    await sdk.start();
    traceId = await generateTrace({ prompt });
    await spanTraceExporterProcessor.forceFlush();
    if (traceId) await waitForMlflowTrace({ traceId });
  });

  afterAll(async () => {
    await sdk.shutdown(); // Ensure spans are flushed after each test
  });
  it('should return all traces', async () => {
    const res = await makeRequest({ route: 'v1/traces' });
    // assert it was successful response
    expect(res.status).toBe(200);
  });

  it('should use "Retry-After" header and wait until the trace is ready', async () => {
    let retryAfterTraceId: string | undefined = undefined;
    retryAfterTraceId = await generateTrace({ prompt });
    if (retryAfterTraceId) await waitForMlflowTrace({ traceId: retryAfterTraceId });

    const traceResponse = await makeRequest({ route: `v1/traces/${retryAfterTraceId}` });

    // assert it was successful response
    expect(traceResponse.status).toBe(200);
  });

  it('should return the `bad request` response when the invalid result is sent', async () => {
    const { status, statusText } = await sendCustomProtobuf({
      invalidSpanKey: 4200,
      secondInvalidSpanKey: 3000
    });
    expect(status).toBe(400);
    expect(statusText).toBe('Bad Request');
  });

  describe('include parameters', () => {
    it('should return the default trace without any additional data', async () => {
      const traceResponse = await makeRequest({ route: `v1/traces/${traceId}` });

      // assert it was successful response
      expect(traceResponse.status).toBe(200);

      const { result } = await traceResponse.json();

      // with expected shape
      expect(result.id).toBe(traceId);
      expect(result.tree).toBeNull();
      expect(result.mlflow).toBeNull();
    });

    it('should return the trace with tree object', async () => {
      const traceResponse = await makeRequest({ route: `v1/traces/${traceId}?include_tree=true` });

      // assert it was successful response
      expect(traceResponse.status).toBe(200);

      const { result } = await traceResponse.json();

      // with expected shape
      expect(result.id).toBe(traceId);
      expect(result.tree.length).toBe(1);
      expect(result.mlflow).toBeNull();
    });

    it('should return the trace with mlflow object', async () => {
      const traceResponse = await makeRequest({
        route: `v1/traces/${traceId}?include_mlflow=true`
      });

      // assert it was successful response
      expect(traceResponse.status).toBe(200);

      const { result } = await traceResponse.json();

      // with expected shape
      expect(result.id).toBe(traceId);
      expect(result.tree).toBeNull();
      expect(result.mlflow.step).toBe('CLOSE_TRACE');
    });

    it('should return the trace with both trace and mlflow object', async () => {
      const traceResponse = await makeRequest({
        route: `v1/traces/${traceId}?include_mlflow=true&include_tree=true`
      });

      // assert it was successful response
      expect(traceResponse.status).toBe(200);

      const { result } = await traceResponse.json();

      // with expected shape
      expect(result.id).toBe(traceId);
      expect(result.tree.length).toBe(1);
      expect(result.mlflow.step).toBe('CLOSE_TRACE');
    });
  });
});
