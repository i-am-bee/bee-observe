// Original file: src/protos/trace_service.proto

import type * as grpc from '@grpc/grpc-js';
import type { MethodDefinition } from '@grpc/proto-loader';

import type {
  ExportTraceServiceRequest as _opentelemetry_proto_collector_trace_v1_ExportTraceServiceRequest,
  ExportTraceServiceRequest__Output as _opentelemetry_proto_collector_trace_v1_ExportTraceServiceRequest__Output
} from '../../../../../opentelemetry/proto/collector/trace/v1/ExportTraceServiceRequest.js';
import type {
  ExportTraceServiceResponse as _opentelemetry_proto_collector_trace_v1_ExportTraceServiceResponse,
  ExportTraceServiceResponse__Output as _opentelemetry_proto_collector_trace_v1_ExportTraceServiceResponse__Output
} from '../../../../../opentelemetry/proto/collector/trace/v1/ExportTraceServiceResponse.js';

export interface TraceServiceClient extends grpc.Client {
  Export(
    argument: _opentelemetry_proto_collector_trace_v1_ExportTraceServiceRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_opentelemetry_proto_collector_trace_v1_ExportTraceServiceResponse__Output>
  ): grpc.ClientUnaryCall;
  Export(
    argument: _opentelemetry_proto_collector_trace_v1_ExportTraceServiceRequest,
    metadata: grpc.Metadata,
    callback: grpc.requestCallback<_opentelemetry_proto_collector_trace_v1_ExportTraceServiceResponse__Output>
  ): grpc.ClientUnaryCall;
  Export(
    argument: _opentelemetry_proto_collector_trace_v1_ExportTraceServiceRequest,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_opentelemetry_proto_collector_trace_v1_ExportTraceServiceResponse__Output>
  ): grpc.ClientUnaryCall;
  Export(
    argument: _opentelemetry_proto_collector_trace_v1_ExportTraceServiceRequest,
    callback: grpc.requestCallback<_opentelemetry_proto_collector_trace_v1_ExportTraceServiceResponse__Output>
  ): grpc.ClientUnaryCall;
  export(
    argument: _opentelemetry_proto_collector_trace_v1_ExportTraceServiceRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_opentelemetry_proto_collector_trace_v1_ExportTraceServiceResponse__Output>
  ): grpc.ClientUnaryCall;
  export(
    argument: _opentelemetry_proto_collector_trace_v1_ExportTraceServiceRequest,
    metadata: grpc.Metadata,
    callback: grpc.requestCallback<_opentelemetry_proto_collector_trace_v1_ExportTraceServiceResponse__Output>
  ): grpc.ClientUnaryCall;
  export(
    argument: _opentelemetry_proto_collector_trace_v1_ExportTraceServiceRequest,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<_opentelemetry_proto_collector_trace_v1_ExportTraceServiceResponse__Output>
  ): grpc.ClientUnaryCall;
  export(
    argument: _opentelemetry_proto_collector_trace_v1_ExportTraceServiceRequest,
    callback: grpc.requestCallback<_opentelemetry_proto_collector_trace_v1_ExportTraceServiceResponse__Output>
  ): grpc.ClientUnaryCall;
}

export interface TraceServiceHandlers extends grpc.UntypedServiceImplementation {
  Export: grpc.handleUnaryCall<
    _opentelemetry_proto_collector_trace_v1_ExportTraceServiceRequest__Output,
    _opentelemetry_proto_collector_trace_v1_ExportTraceServiceResponse
  >;
}

export interface TraceServiceDefinition extends grpc.ServiceDefinition {
  Export: MethodDefinition<
    _opentelemetry_proto_collector_trace_v1_ExportTraceServiceRequest,
    _opentelemetry_proto_collector_trace_v1_ExportTraceServiceResponse,
    _opentelemetry_proto_collector_trace_v1_ExportTraceServiceRequest__Output,
    _opentelemetry_proto_collector_trace_v1_ExportTraceServiceResponse__Output
  >;
}
