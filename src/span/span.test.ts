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

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Version } from 'bee-agent-framework';

import { sdk, spanTraceExporterProcessor } from '../testing/telemetry.js';
import { generateTrace, makeRequest, waitForTrace } from '../testing/utils.js';

let traceId: string | undefined = undefined;
const prompt = 'hello';

describe('span module', () => {
  beforeAll(async () => {
    await sdk.start();
    traceId = await generateTrace({ prompt });
    await spanTraceExporterProcessor.forceFlush();
    if (traceId) await waitForTrace({ traceId, includeMlflow: true });
  });

  afterAll(async () => {
    await sdk.shutdown(); // Ensure spans are flushed after each test
  });

  it('should return empty array for not existing trace', async () => {
    const res = await makeRequest({ route: 'v1/traces/notExisting/spans' });
    // assert it was successful response
    expect(res.status).toBe(200);

    // with expected shape
    expect(await res.json()).toMatchObject({
      results: [],
      total_count: 0
    });
  });

  it('should return base span objects for the specific trace', async () => {
    const res = await makeRequest({ route: `v1/traces/${traceId}/spans` });

    expect(res.status).toBe(200);

    const { total_count, results } = await res.json();
    expect(total_count).toBeGreaterThan(0);

    const mainSpan = results.find(
      (result: any) => result.name === `bee-agent-framework-BeeAgent-${traceId}`
    );

    expect(mainSpan.attributes.traceId).toBe(traceId);
    expect(mainSpan.attributes.version).toBe(Version);
    expect(mainSpan.attributes.prompt).toBe(prompt);
    expect(mainSpan.attributes.response.text.length).toBeGreaterThan(0);
    expect(mainSpan.ctx).toBeUndefined();
  });
});
