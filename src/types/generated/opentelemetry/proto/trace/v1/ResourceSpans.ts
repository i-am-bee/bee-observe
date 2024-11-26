// Original file: src/protos/trace.proto

import type {
  Resource as _opentelemetry_proto_resource_v1_Resource,
  Resource__Output as _opentelemetry_proto_resource_v1_Resource__Output
} from '../../../../opentelemetry/proto/resource/v1/Resource.js';
import type {
  ScopeSpans as _opentelemetry_proto_trace_v1_ScopeSpans,
  ScopeSpans__Output as _opentelemetry_proto_trace_v1_ScopeSpans__Output
} from '../../../../opentelemetry/proto/trace/v1/ScopeSpans.js';

export interface ResourceSpans {
  resource?: _opentelemetry_proto_resource_v1_Resource | null;
  scopeSpans?: _opentelemetry_proto_trace_v1_ScopeSpans[];
  schemaUrl?: string;
}

export interface ResourceSpans__Output {
  resource: _opentelemetry_proto_resource_v1_Resource__Output | null;
  scopeSpans: _opentelemetry_proto_trace_v1_ScopeSpans__Output[];
  schemaUrl: string;
}
