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

import { StatusCodes } from 'http-status-codes';
import { ObjectId, QueryOrderNumeric } from '@mikro-orm/mongodb';
import { ContentTypeParserDoneFunction } from 'fastify/types/content-type-parser.js';
import { FastifyRequest } from 'fastify';

import { ORM } from '../utils/db.js';
import { ErrorWithProps, ErrorWithPropsCodes } from '../utils/error.js';
import { addMlflowTraceToQueue } from '../mlflow/queue/mlflow-trace-create.queue.js';
import { Span } from '../span/span.document.js';
import { ExportTraceServiceRequest__Output } from '../types/generated/opentelemetry/proto/collector/trace/v1/ExportTraceServiceRequest.js';
import { findMainSpan } from '../span/utilt.js';
import { getServiceLogger } from '../utils/logger-factories.js';

import { TraceDto, TraceGetOneQuery, TraceGetQuery } from './trace.dto.js';
import { assemblyTrace } from './utils/assembly-trace.js';
import { toDto } from './utils/to-dto.js';
import { ExportTraceServiceRequest } from './trace.proto.js';

const logger = getServiceLogger('trace');

export async function getTraces(query: TraceGetQuery): Promise<{
  totalCount: number;
  traces: TraceDto[];
}> {
  const { limit, offset, ...flags } = query;

  const [traces, totalCount] = await ORM.trace.findAndCount(
    {},
    {
      orderBy: {
        createdAt: QueryOrderNumeric.DESC
      },
      limit: limit,
      offset: offset
    }
  );
  return {
    totalCount,
    traces: traces.map((trace) => toDto({ trace, flags }))
  };
}

export async function getTrace({
  id,
  query
}: {
  id: string;
  query: TraceGetOneQuery;
}): Promise<TraceDto | null> {
  const trace = await ORM.trace.findOne({ frameworkTraceId: id });

  if (!trace) {
    throw new ErrorWithProps(
      `The trace entity with id ${id} does not exist`,
      { code: ErrorWithPropsCodes.NOT_FOUND },
      StatusCodes.NOT_FOUND
    );
  }

  const mlflowTrace =
    (await ORM.mlflowtrace.findOne({ parent: new ObjectId(trace?.id) })) || undefined;

  return toDto({ trace, mlflowTrace, flags: query });
}

export async function createTrace(traceBody: ExportTraceServiceRequest__Output): Promise<TraceDto> {
  const spans = [...traceBody.resourceSpans].flatMap((resourceSpan) => {
    return resourceSpan.scopeSpans.flatMap((scopeSpan) => {
      return scopeSpan.spans.map((span) => new Span(span));
    });
  });

  const mainSpan = findMainSpan(spans);
  if (!mainSpan) {
    throw new ErrorWithProps(
      `The root span does not exist`,
      { code: ErrorWithPropsCodes.NOT_FOUND },
      StatusCodes.NOT_FOUND
    );
  }
  const { traceId } = mainSpan.attributes;

  const trace = assemblyTrace({
    spans,
    traceId,
    request: {
      message: mainSpan.attributes.prompt,
      history: mainSpan.attributes.history,
      framework: { version: mainSpan.attributes.version }
    },
    response: mainSpan.attributes.response,
    startTime: mainSpan.startTime,
    endTime: mainSpan.endTime
  });

  // save trace
  await ORM.em.persistAndFlush(trace);

  // mlflow processing
  addMlflowTraceToQueue({
    traceId: trace.id
  });

  return toDto({
    trace,
    flags: {
      include_mlflow: false,
      include_mlflow_tree: false,
      include_tree: true
    }
  });
}

export function traceProtobufBufferParser(
  req: FastifyRequest,
  payload: string | Buffer,
  done: ContentTypeParserDoneFunction
) {
  if (req.url !== '/v1/traces') {
    return done(
      new ErrorWithProps(
        'Invalid url for protobuf format',
        { code: ErrorWithPropsCodes.NOT_FOUND },
        StatusCodes.NOT_FOUND
      )
    );
  }
  if (!Buffer.isBuffer(payload)) {
    return done(
      new ErrorWithProps(
        'Invalid buffer format',
        { code: ErrorWithPropsCodes.INVALID_ARGUMENT },
        StatusCodes.BAD_REQUEST
      )
    );
  }

  try {
    const uint8ArrayPayload = new Uint8Array(payload);

    // First, verify the buffer against the schema
    const errMsg = ExportTraceServiceRequest.verify(uint8ArrayPayload);
    if (errMsg) {
      throw new Error(`Protobuf validation failed: ${errMsg}`);
    }

    // decode buffer
    const message = ExportTraceServiceRequest.decode(uint8ArrayPayload);
    done(null, message);
  } catch (error) {
    logger.error({ error }, 'Invalid buffer format');
    done(
      new ErrorWithProps(
        'Invalid buffer format',
        {
          code: ErrorWithPropsCodes.INVALID_ARGUMENT,
          reason: error instanceof Error ? error.message : undefined
        },
        StatusCodes.BAD_REQUEST
      )
    );
  }
}
