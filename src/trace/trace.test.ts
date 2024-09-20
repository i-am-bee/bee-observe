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

import { expect, test, describe, beforeAll } from 'vitest';

import { makeRequest, tree, tracePostBody, waitForMlflowTrace } from '../utils/testing.js';

import { TracePostBody } from './trace.dto.js';

describe('trace module', () => {
  test('should return all traces', async () => {
    const res = await makeRequest({ route: 'trace' });

    // assert it was successful response
    expect(res.status).toBe(200);
  });

  test('should create trace with events and mlflow', async () => {
    const createTraceResponse = await makeRequest<TracePostBody>({
      route: 'trace',
      method: 'POST',
      body: tracePostBody
    });

    // assert it was successful response
    expect(createTraceResponse.status).toBe(200);
    const traceId = (await createTraceResponse.json()).result.id;
    expect(traceId).toBeDefined();

    // check the compouted trace
    const { status, result } = await waitForMlflowTrace({ traceId });

    // assert it was successful response
    expect(status).toBe(200);

    // with expected shape
    expect(result).toMatchObject({
      id: traceId,
      tree
    });

    // with expected mlflow shape
    expect(result.mlflow).toBeDefined();
    expect(result.mlflow?.step).toBe('CLOSE_TRACE');
    expect((result.mlflow?.tree || []).length).toBeGreaterThanOrEqual(tree.length);
  });

  test('should create trace with empty prompt', async () => {
    const createTraceResponse = await makeRequest<TracePostBody>({
      route: 'trace',
      method: 'POST',
      body: {
        experiment_tracker: tracePostBody.experiment_tracker,
        response: tracePostBody.response,
        request: {},
        spans: tracePostBody.spans
      }
    });

    // assert it was successful response
    expect(createTraceResponse.status).toBe(200);
    const traceId = (await createTraceResponse.json()).result.id;
    expect(traceId).toBeDefined();

    // check the compouted trace
    const { status, result } = await waitForMlflowTrace({ traceId });

    // assert it was successful response
    expect(status).toBe(200);

    // check expected mlflow shape
    expect(result.mlflow).toBeDefined();
    expect(result.mlflow?.step).toBe('CLOSE_TRACE');
    expect((result.mlflow?.tree || []).length).toBeGreaterThanOrEqual(tree.length);
  });

  describe('include parameters', () => {
    let traceId: string | undefined = undefined;
    beforeAll(async () => {
      const createTraceResponse = await makeRequest<TracePostBody>({
        route: 'trace',
        method: 'POST',
        body: tracePostBody
      });
      traceId = (await createTraceResponse.json()).result.id;

      // wait until the `trace mlflow create` event is done.
      if (traceId) await waitForMlflowTrace({ traceId });
    });

    test('should return the default trace without any additional data', async () => {
      const traceResponse = await makeRequest({ route: `trace/${traceId}` });

      // assert it was successful response
      expect(traceResponse.status).toBe(200);

      const { result } = await traceResponse.json();

      // with expected shape
      expect(result.id).toBe(traceId);
      expect(result.tree).toBeNull();
      expect(result.mlflow).toBeNull();
    });

    test('should return the trace with tree object', async () => {
      const traceResponse = await makeRequest({ route: `trace/${traceId}?include_tree=true` });

      // assert it was successful response
      expect(traceResponse.status).toBe(200);

      const { result } = await traceResponse.json();

      // with expected shape
      expect(result.id).toBe(traceId);
      expect(result.tree).toEqual(tree);
      expect(result.mlflow).toBeNull();
    });

    test('should return the trace with mlflow object', async () => {
      const traceResponse = await makeRequest({ route: `trace/${traceId}?include_mlflow=true` });

      // assert it was successful response
      expect(traceResponse.status).toBe(200);

      const { result } = await traceResponse.json();

      // with expected shape
      expect(result.id).toBe(traceId);
      expect(result.tree).toBeNull();
      expect(result.mlflow.step).toBe('CLOSE_TRACE');
    });

    test('should return the trace with both trace and mlflow object', async () => {
      const traceResponse = await makeRequest({
        route: `trace/${traceId}?include_mlflow=true&include_tree=true`
      });

      // assert it was successful response
      expect(traceResponse.status).toBe(200);

      const { result } = await traceResponse.json();

      // with expected shape
      expect(result.id).toBe(traceId);
      expect(result.tree).toEqual(tree);
      expect(result.mlflow.step).toBe('CLOSE_TRACE');
    });
  });
});
