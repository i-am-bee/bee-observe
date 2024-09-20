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

import { makeRequest, tracePostBody } from '../utils/testing.js';
import { TracePostBody } from '../trace/trace.dto.js';

describe('span module', () => {
  let traceId: string | undefined = undefined;
  beforeAll(async () => {
    const createTraceResponse = await makeRequest<TracePostBody>({
      route: 'trace',
      method: 'POST',
      body: tracePostBody
    });
    traceId = (await createTraceResponse.json()).result.id;
  });
  test('should return empty array for not existing trace', async () => {
    const res = await makeRequest({ route: 'span?trace_id=notExisting' });

    // assert it was successful response
    expect(res.status).toBe(200);

    // with expected shape
    expect(await res.json()).toMatchObject({
      results: [],
      total_count: 0
    });
  });
  test('should return base span objects for the specific trace', async () => {
    const res = await makeRequest({ route: `span?trace_id=${traceId}` });

    expect(res.status).toBe(200);

    const { total_count, results } = await res.json();
    expect(total_count).toBe(10);

    expect(results[0]).toEqual({
      attributes: {
        ctx: null,
        target: 'react agent'
      },
      context: {
        span_id: 'agent-on-start'
      },
      end_time: '2024-07-17T12:15:48.416Z',
      name: 'onStart',
      start_time: '2024-07-17T12:15:48.416Z',
      status_code: 'OK',
      status_message: ''
    });
  });

  test('should return span objects with attribute ctx data for the specific trace', async () => {
    const res = await makeRequest({
      route: `span?trace_id=${traceId}&include_attributes_ctx=true`
    });

    expect(res.status).toBe(200);

    const { total_count, results } = await res.json();
    expect(total_count).toBe(10);

    expect(results[0]).toEqual({
      attributes: {
        ctx: {
          userId: 'xx'
        },
        target: 'react agent'
      },
      context: {
        span_id: 'agent-on-start'
      },
      end_time: '2024-07-17T12:15:48.416Z',
      name: 'onStart',
      start_time: '2024-07-17T12:15:48.416Z',
      status_code: 'OK',
      status_message: ''
    });
  });
});
