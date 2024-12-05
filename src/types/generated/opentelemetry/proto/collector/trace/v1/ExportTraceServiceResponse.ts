// Original file: src/protos/trace_service.proto

import type {
  ExportTracePartialSuccess as _opentelemetry_proto_collector_trace_v1_ExportTracePartialSuccess,
  ExportTracePartialSuccess__Output as _opentelemetry_proto_collector_trace_v1_ExportTracePartialSuccess__Output
} from '../../../../../opentelemetry/proto/collector/trace/v1/ExportTracePartialSuccess.js';

export interface ExportTraceServiceResponse {
  partialSuccess?: _opentelemetry_proto_collector_trace_v1_ExportTracePartialSuccess | null;
}

export interface ExportTraceServiceResponse__Output {
  partialSuccess: _opentelemetry_proto_collector_trace_v1_ExportTracePartialSuccess__Output | null;
}
