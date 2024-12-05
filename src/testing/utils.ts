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

import { BeeAgent } from 'bee-agent-framework/agents/bee/agent';
import { TokenMemory } from 'bee-agent-framework/memory/tokenMemory';
import { DuckDuckGoSearchTool } from 'bee-agent-framework/tools/search/duckDuckGoSearch';
import { WikipediaTool } from 'bee-agent-framework/tools/search/wikipedia';
import { OpenMeteoTool } from 'bee-agent-framework/tools/weather/openMeteo';
import { OllamaChatLLM } from 'bee-agent-framework/adapters/ollama/chat';
import protobuf from 'protobufjs';

import { TraceDto } from '../trace/trace.dto.js';
import { constants } from '../utils/constants.js';

export const buildUrl = (route: string): string => {
  const port = process.env.PORT || '4318';
  return new URL(route, `http://127.0.0.1:${port}`).toString();
};

const MLFLOW_MAX_RETREIVE_ATTEMPTS = 5;
export async function waitForMlflowTrace({
  attempt = 1,
  traceId
}: {
  attempt?: number;
  traceId: string;
}): Promise<{
  status: number;
  result: TraceDto;
}> {
  const traceResponse = await makeRequest({
    route: `v1/traces/${traceId}?include_mlflow=true&include_tree=true&include_mlflow_tree=true`
  });

  const { result } = await traceResponse.json();
  if (result?.mlflow?.step !== 'CLOSE_TRACE' && attempt <= MLFLOW_MAX_RETREIVE_ATTEMPTS) {
    await setTimeoutPromise(500 * attempt);
    return waitForMlflowTrace({ traceId, attempt: ++attempt });
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

const llm = new OllamaChatLLM({
  modelId: 'llama3.1' // llama3.1:70b for better performance
});

export const agent = new BeeAgent({
  llm,
  memory: new TokenMemory({ llm }),
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
