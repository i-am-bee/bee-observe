// Original file: src/protos/trace.proto

// Original file: src/protos/trace.proto

export const _opentelemetry_proto_trace_v1_Status_StatusCode = {
  STATUS_CODE_UNSET: 'STATUS_CODE_UNSET',
  STATUS_CODE_OK: 'STATUS_CODE_OK',
  STATUS_CODE_ERROR: 'STATUS_CODE_ERROR'
} as const;

export type _opentelemetry_proto_trace_v1_Status_StatusCode =
  | 'STATUS_CODE_UNSET'
  | 0
  | 'STATUS_CODE_OK'
  | 1
  | 'STATUS_CODE_ERROR'
  | 2;

export type _opentelemetry_proto_trace_v1_Status_StatusCode__Output =
  (typeof _opentelemetry_proto_trace_v1_Status_StatusCode)[keyof typeof _opentelemetry_proto_trace_v1_Status_StatusCode];

export interface Status {
  message?: string;
  code?: _opentelemetry_proto_trace_v1_Status_StatusCode;
}

export interface Status__Output {
  message: string;
  code: _opentelemetry_proto_trace_v1_Status_StatusCode__Output;
}
