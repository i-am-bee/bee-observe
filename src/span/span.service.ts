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
import * as semver from 'semver';

import { isValidFrameworkId, ORM } from '../utils/db.js';
import { constants } from '../utils/constants.js';

import { SpanDto, SpanGetOneParams, SpanGetOneQuery } from './span.dto.js';
import { Span } from './span.document.js';

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

export async function loadAllNestedSpans(span: Span): Promise<Span[]> {
  const { version } = span.attributes;
  // Optimised query = use the traceId for loading all nested spans
  if (
    version &&
    semver.valid(version) &&
    semver.gte(version, constants.FRAMEWORK_BRAKING_CHANGES.TRACE_ID_FOR_EACH_SPAN)
  ) {
    return ORM.span.find({
      'attributes.traceId': span.attributes.traceId,
      'context.spanId': { $ne: span.context.spanId }
    } as any);
  }

  // The old temporary way (will be removed soon)
  const spans = await ORM.span.find({ parentId: span.context.spanId });
  if (spans.length === 0) return spans;

  const nestedSpans = await Promise.all(spans.map((span) => loadAllNestedSpans(span)));

  return [...spans, ...nestedSpans.flat()];
}
