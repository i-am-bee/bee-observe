// Original file: src/protos/trace.proto

import type {
  InstrumentationScope as _opentelemetry_proto_common_v1_InstrumentationScope,
  InstrumentationScope__Output as _opentelemetry_proto_common_v1_InstrumentationScope__Output
} from '../../../../opentelemetry/proto/common/v1/InstrumentationScope.js';
import type {
  Span as _opentelemetry_proto_trace_v1_Span,
  Span__Output as _opentelemetry_proto_trace_v1_Span__Output
} from '../../../../opentelemetry/proto/trace/v1/Span.js';

export interface ScopeSpans {
  scope?: _opentelemetry_proto_common_v1_InstrumentationScope | null;
  spans?: _opentelemetry_proto_trace_v1_Span[];
  schemaUrl?: string;
}

export interface ScopeSpans__Output {
  scope: _opentelemetry_proto_common_v1_InstrumentationScope__Output | null;
  spans: _opentelemetry_proto_trace_v1_Span__Output[];
  schemaUrl: string;
}
