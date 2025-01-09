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

import { Span, SpanInput } from '../../span/span.document.js';
import { loadAllNestedSpans } from '../../span/span.service.js';
import { MainSpan } from '../../types/internal/span.js';
import { Trace } from '../trace.document.js';
import { TraceRequest } from '../trace.dto.js';

type TraceSpan = Omit<SpanInput, 'parentId' | 'context'> & {
  id: Span['context']['spanId'];
};

type TraceSpanWithChildren = TraceSpan & { children: TreeItem[] };

export interface TreeItem {
  id: string;
  name: string;
  target: TraceSpanWithChildren['attributes']['target'];
  startTime: Date;
  endTime: Date;
  statusCode: TraceSpanWithChildren['statusCode'];
  events: {
    name: TraceSpanWithChildren['name'];
    statusCode: TraceSpanWithChildren['statusCode'];
    statusMessage: TraceSpanWithChildren['statusMessage'];
    data: TraceSpanWithChildren['attributes']['data'];
    startTime: TraceSpanWithChildren['startTime'];
    endTime: TraceSpanWithChildren['endTime'];
  }[];
  children: TreeItem[];
}

function parseTraceSpan(span: Span): TraceSpan {
  return {
    id: span.context.spanId,
    name: span.name,
    startTime: span.startTime,
    endTime: span.endTime,
    statusCode: span.statusCode,
    statusMessage: span.statusMessage,
    attributes: span.attributes
  };
}

function loadNestedSpans(span: Span, spans: Span[]): TreeItem[] {
  const nestedSpans = spans.filter((spanItem) => spanItem.parentId === span.context.spanId);
  if (nestedSpans.length === 0) return [];

  return groupBy(
    nestedSpans.map((span) => ({
      ...parseTraceSpan(span),
      children: loadNestedSpans(span, spans)
    }))
  );
}

const groupBy = (spans: TraceSpanWithChildren[]): TreeItem[] => {
  const indexed = spans.reduce(
    (groupedSpans, span) => {
      const key = span.id;

      const events: TreeItem['events'] = [
        ...(groupedSpans[key]?.events || []),
        {
          name: span.name,
          statusCode: span.statusCode,
          statusMessage: span.statusMessage,
          data: span.attributes.data,
          startTime: span.startTime,
          endTime: span.endTime
        }
      ].sort((event1, event2) => event1.startTime.getTime() - event2.startTime.getTime());

      return {
        ...groupedSpans,
        [key]: {
          target: span.attributes.target,
          id: key,
          name: span.name,
          startTime: new Date(
            Math.min(
              events[0].startTime.getTime(),
              ...span.children.map((treeItem) => treeItem.startTime.getTime())
            )
          ),
          endTime: new Date(
            Math.max(
              events[events.length - 1].endTime.getTime(),
              ...span.children.map((treeItem) => treeItem.endTime.getTime())
            )
          ),
          children: span.children,
          statusCode: events.some((event) => event.statusCode === 'ERROR') ? 'ERROR' : 'OK',
          events
        } as TreeItem
      };
    },
    {} as Record<string, TreeItem>
  );

  return Object.values(indexed);
};

interface AssemblyTraceProps {
  mainSpan: MainSpan;
  traceId: string;
  request: TraceRequest;
  response?: any;
  startTime: Date;
  endTime: Date;
}

export async function assemblyTrace({
  traceId,
  request,
  response,
  startTime,
  endTime,
  mainSpan
}: AssemblyTraceProps): Promise<Trace> {
  const nestedSpans = await loadAllNestedSpans(mainSpan);
  const spans = [mainSpan, ...nestedSpans];

  const eventsTree = groupBy(
    spans
      .filter((span) => !span.parentId)
      .map((span) => ({
        ...parseTraceSpan(span),
        children: loadNestedSpans(span, spans)
      }))
  );

  const errorSpan = spans.find((span) => span.statusCode === 'ERROR');

  return new Trace({
    frameworkTraceId: traceId,
    startTime: startTime,
    endTime: endTime,
    tree: eventsTree,
    spans: spans,
    request,
    response,
    error: errorSpan
      ? { code: errorSpan.statusCode, message: errorSpan.statusMessage || '' }
      : undefined
  });
}
