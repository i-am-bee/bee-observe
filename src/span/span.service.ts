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

import { QueryOrderNumeric } from '@mikro-orm/mongodb';

import { isValidFrameworkId, ORM } from '../utils/db.js';

import { SpanDto, SpanGetOneParams, SpanGetOneQuery } from './span.dto.js';

export async function getSpans(props: SpanGetOneParams & SpanGetOneQuery): Promise<{
  totalCount: number;
  spans: SpanDto[];
}> {
  if (!isValidFrameworkId(props.trace_id)) {
    return {
      totalCount: 0,
      spans: []
    };
  }

  const [spans, totalCount] = await ORM.span.findAndCount(
    {
      trace: await ORM.trace.findOne({ frameworkTraceId: props.trace_id })
    },
    {
      orderBy: {
        startTime: QueryOrderNumeric.ASC
      }
    }
  );

  return {
    totalCount,
    spans: spans.map((span) => span.toTelemetry(props))
  };
}
