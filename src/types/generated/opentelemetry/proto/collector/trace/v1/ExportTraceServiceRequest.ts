// Original file: src/protos/trace_service.proto

import type {
  ResourceSpans as _opentelemetry_proto_trace_v1_ResourceSpans,
  ResourceSpans__Output as _opentelemetry_proto_trace_v1_ResourceSpans__Output
} from '../../../../../opentelemetry/proto/trace/v1/ResourceSpans.js';

export interface ExportTraceServiceRequest {
  resourceSpans?: _opentelemetry_proto_trace_v1_ResourceSpans[];
}

export interface ExportTraceServiceRequest__Output {
  resourceSpans: _opentelemetry_proto_trace_v1_ResourceSpans__Output[];
}
