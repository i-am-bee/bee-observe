// Original file: src/protos/trace.proto

import type { Long } from '@grpc/proto-loader';

import type {
  KeyValue as _opentelemetry_proto_common_v1_KeyValue,
  KeyValue__Output as _opentelemetry_proto_common_v1_KeyValue__Output
} from '../../../../opentelemetry/proto/common/v1/KeyValue.js';
import type {
  Status as _opentelemetry_proto_trace_v1_Status,
  Status__Output as _opentelemetry_proto_trace_v1_Status__Output
} from '../../../../opentelemetry/proto/trace/v1/Status.js';

export interface _opentelemetry_proto_trace_v1_Span_Event {
  timeUnixNano?: number | string | Long;
  name?: string;
  attributes?: _opentelemetry_proto_common_v1_KeyValue[];
  droppedAttributesCount?: number;
}

export interface _opentelemetry_proto_trace_v1_Span_Event__Output {
  timeUnixNano: number;
  name: string;
  attributes: _opentelemetry_proto_common_v1_KeyValue__Output[];
  droppedAttributesCount: number;
}

export interface _opentelemetry_proto_trace_v1_Span_Link {
  traceId?: Buffer | Uint8Array | string;
  spanId?: Buffer | Uint8Array | string;
  traceState?: string;
  attributes?: _opentelemetry_proto_common_v1_KeyValue[];
  droppedAttributesCount?: number;
  flags?: number;
}

export interface _opentelemetry_proto_trace_v1_Span_Link__Output {
  traceId: Buffer;
  spanId: Buffer;
  traceState: string;
  attributes: _opentelemetry_proto_common_v1_KeyValue__Output[];
  droppedAttributesCount: number;
  flags: number;
}

// Original file: src/protos/trace.proto

export const _opentelemetry_proto_trace_v1_Span_SpanKind = {
  SPAN_KIND_UNSPECIFIED: 'SPAN_KIND_UNSPECIFIED',
  SPAN_KIND_INTERNAL: 'SPAN_KIND_INTERNAL',
  SPAN_KIND_SERVER: 'SPAN_KIND_SERVER',
  SPAN_KIND_CLIENT: 'SPAN_KIND_CLIENT',
  SPAN_KIND_PRODUCER: 'SPAN_KIND_PRODUCER',
  SPAN_KIND_CONSUMER: 'SPAN_KIND_CONSUMER'
} as const;

export type _opentelemetry_proto_trace_v1_Span_SpanKind =
  | 'SPAN_KIND_UNSPECIFIED'
  | 0
  | 'SPAN_KIND_INTERNAL'
  | 1
  | 'SPAN_KIND_SERVER'
  | 2
  | 'SPAN_KIND_CLIENT'
  | 3
  | 'SPAN_KIND_PRODUCER'
  | 4
  | 'SPAN_KIND_CONSUMER'
  | 5;

export type _opentelemetry_proto_trace_v1_Span_SpanKind__Output =
  (typeof _opentelemetry_proto_trace_v1_Span_SpanKind)[keyof typeof _opentelemetry_proto_trace_v1_Span_SpanKind];

export interface Span {
  traceId?: Buffer | Uint8Array | string;
  spanId?: Buffer | Uint8Array | string;
  traceState?: string;
  parentSpanId?: Buffer | Uint8Array | string;
  name?: string;
  kind?: _opentelemetry_proto_trace_v1_Span_SpanKind;
  startTimeUnixNano?: number | string | Long;
  endTimeUnixNano?: number | string | Long;
  attributes?: _opentelemetry_proto_common_v1_KeyValue[];
  droppedAttributesCount?: number;
  events?: _opentelemetry_proto_trace_v1_Span_Event[];
  droppedEventsCount?: number;
  links?: _opentelemetry_proto_trace_v1_Span_Link[];
  droppedLinksCount?: number;
  status?: _opentelemetry_proto_trace_v1_Status | null;
  flags?: number;
}

export interface Span__Output {
  traceId: Buffer;
  spanId: Buffer;
  traceState: string;
  parentSpanId: Buffer;
  name: string;
  kind: _opentelemetry_proto_trace_v1_Span_SpanKind__Output;
  startTimeUnixNano: number;
  endTimeUnixNano: number;
  attributes: _opentelemetry_proto_common_v1_KeyValue__Output[];
  droppedAttributesCount: number;
  events: _opentelemetry_proto_trace_v1_Span_Event__Output[];
  droppedEventsCount: number;
  links: _opentelemetry_proto_trace_v1_Span_Link__Output[];
  droppedLinksCount: number;
  status: _opentelemetry_proto_trace_v1_Status__Output | null;
  flags: number;
}
