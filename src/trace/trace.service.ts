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
import { ObjectId } from '@mikro-orm/mongodb';

import { ORM } from '../utils/db.js';
import { ErrorWithProps, ErrorWithPropsCodes } from '../utils/error.js';
import { addMlflowTraceToQueue } from '../mlflow/queue/mlflow-trace-create.queue.js';
import { Span } from '../span/span.document.js';

import { TraceDto, TraceGetOneQuery, TraceGetQuery, TracePostBody } from './trace.dto.js';
import { assemblyTrace } from './utils/assembly-trace.js';
import { toDto } from './utils/to-dto.js';

export async function getTraces(query: TraceGetQuery): Promise<{
  totalCount: number;
  traces: TraceDto[];
}> {
  const { limit, offset, ...flags } = query;

  const [traces, totalCount] = await ORM.trace.findAndCount(
    {},
    {
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
  const trace = await ORM.trace.findOne({ id });

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

export async function createTrace(traceBody: TracePostBody): Promise<TraceDto> {
  const traceId = new ObjectId().toString();

  const spans = traceBody.spans.map((span) => new Span(span));

  const trace = assemblyTrace({
    spans,
    traceId,
    request: traceBody.request,
    response: traceBody.response
  });

  // save trace
  await ORM.em.persistAndFlush(trace);

  // mlflow processing
  addMlflowTraceToQueue({
    traceId,
    runId: traceBody.experiment_tracker?.run_id,
    experimentId: traceBody.experiment_tracker?.experiment_id
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
