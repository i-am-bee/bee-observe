// Original file: src/protos/trace_service.proto

import type { Long } from '@grpc/proto-loader';

export interface ExportTracePartialSuccess {
  rejectedSpans?: number | string | Long;
  errorMessage?: string;
}

export interface ExportTracePartialSuccess__Output {
  rejectedSpans: number;
  errorMessage: string;
}
