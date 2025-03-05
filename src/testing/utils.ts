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

import { setTimeout as setTimeoutPromise } from 'node:timers/promises';

import { api } from '@opentelemetry/sdk-node';
import { BeeAgent } from 'beeai-framework/agents/bee/agent';
import { TokenMemory } from 'beeai-framework/memory/tokenMemory';
import { DuckDuckGoSearchTool } from 'beeai-framework/tools/search/duckDuckGoSearch';
import { WikipediaTool } from 'beeai-framework/tools/search/wikipedia';
import { OpenMeteoTool } from 'beeai-framework/tools/weather/openMeteo';
import { OllamaChatModel } from 'beeai-framework/adapters/ollama/backend/chat';
import protobuf from 'protobufjs';
import { Version } from 'beeai-framework';

import { TraceDto } from '../trace/trace.dto.js';
import { constants } from '../utils/constants.js';

export const buildUrl = (route: string): string => {
  return new URL(route, `http://127.0.0.1:${process.env.PORT || '4318'}`).toString();
};

function parseRetryAfterHeader(retryAfter: string | null) {
  if (!retryAfter) {
    throw new Error('The "Retry-After" header is missing in the response');
  }
  if (!/^-?\d+$/.test(retryAfter)) {
    throw new Error('The "Retry-After" has an invalid format. It must be an integer');
  }
  return parseInt(retryAfter);
}

const MLFLOW_MAX_RETREIVE_ATTEMPTS = 5;
interface WaitForTraceProps {
  attempt?: number;
  traceId: string;
  includeMlflow?: boolean;
}
interface WaitForTraceResponse {
  status: number;
  result: TraceDto;
}

export async function waitForTrace({
  attempt = 1,
  traceId,
  includeMlflow = false
}: WaitForTraceProps): Promise<WaitForTraceResponse> {
  const route = includeMlflow
    ? `v1/traces/${traceId}?include_mlflow=true&include_tree=true&include_mlflow_tree=true`
    : `v1/traces/${traceId}`;
  const traceResponse = await makeRequest({ route });

  const { result } = await traceResponse.json();

  if (traceResponse.status === 404 && attempt <= MLFLOW_MAX_RETREIVE_ATTEMPTS) {
    const retryAfter = parseRetryAfterHeader(traceResponse.headers.get('Retry-After'));
    await setTimeoutPromise(retryAfter * 1000);
    return waitForTrace({ traceId, attempt: ++attempt });
  }

  if (result?.mlflow?.step !== 'CLOSE_TRACE' && attempt <= MLFLOW_MAX_RETREIVE_ATTEMPTS) {
    await setTimeoutPromise(2000);
    return waitForTrace({ traceId, attempt: ++attempt });
  }

  return {
    status: traceResponse.status,
    result
  };
}

export async function makeRequest<T>({
  route,
  method = 'get',
  body
}: {
  route: string;
  method?: string;
  body?: T;
}) {
  return fetch(buildUrl(route), {
    headers: {
      [constants.BEE_AUTH_HEADER]: constants.AUTH_KEY,
      'Content-Type': 'application/json'
    },
    method,
    ...(body && { body: JSON.stringify(body) })
  });
}

const llm = new OllamaChatModel('llama3.1');

export const agent = new BeeAgent({
  llm,
  memory: new TokenMemory(),
  tools: [
    new DuckDuckGoSearchTool(),
    new WikipediaTool(),
    new OpenMeteoTool() // weather tool
  ]
});

const CustomRequest = new protobuf.Type('CustomRequest')
  .add(new protobuf.Field('invalidSpanKey', 1, 'int32'))
  .add(new protobuf.Field('secondInvalidSpanKey', 2, 'int32')); // Define the field type and tag

interface SendCustomProtobufProps {
  invalidSpanKey: number;
  secondInvalidSpanKey: number;
}

export async function sendCustomProtobuf(payload: SendCustomProtobufProps) {
  const buffer = CustomRequest.encode(payload).finish();

  // Send the buffer to the server
  return fetch(buildUrl('v1/traces'), {
    method: 'POST',
    headers: {
      [constants.BEE_AUTH_HEADER]: constants.AUTH_KEY,
      'Content-Type': 'application/x-protobuf'
    },
    body: buffer
  });
}

const fakeSpans = [
  {
    id: 'fake-1',
    target: 'groupId',
    name: 'iteration-1'
  }
];

export async function generateTrace({ prompt }: { prompt: string }) {
  let traceId: string | undefined = undefined;
  // bee-agent-framework
  if (!process.env.USE_FAKE_BACKEND_FOR_TESTING) {
    await agent.run({ prompt }).middleware((ctx) => (traceId = ctx.emitter.trace?.id));
    return traceId;
  }

  // mock
  const tracer = api.trace.getTracer(constants.OPENTELEMETRY.INSTRUMENTATION_SCOPE, Version);
  traceId = Math.random().toString(16).slice(2, 10);

  // 1) main span
  tracer.startActiveSpan(
    `beeai-framework-BeeAgent-${traceId}`,
    {
      attributes: {
        traceId,
        version: Version,
        prompt,
        response: JSON.stringify({
          role: 'assistant',
          text: "Hello! It's nice to chat with you."
        })
      }
    },
    (activeSpan) => {
      activeSpan.setStatus({ code: 1 });

      // 2) nested spans
      fakeSpans.map((span) => {
        tracer.startActiveSpan(
          span.id,
          {
            attributes: {
              target: span.target,
              traceId,
              name: span.name
            }
          },
          (nestedSpan) => {
            nestedSpan.setStatus({ code: 1 });
            nestedSpan.end();
          }
        );
      });

      activeSpan.end();
    }
  );

  return traceId;
}
