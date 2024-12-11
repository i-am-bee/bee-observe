import type * as grpc from '@grpc/grpc-js';
import type { EnumTypeDefinition, MessageTypeDefinition } from '@grpc/proto-loader';

import type {
  TraceServiceClient as _opentelemetry_proto_collector_trace_v1_TraceServiceClient,
  TraceServiceDefinition as _opentelemetry_proto_collector_trace_v1_TraceServiceDefinition
} from './opentelemetry/proto/collector/trace/v1/TraceService.js';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new (...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  opentelemetry: {
    proto: {
      collector: {
        trace: {
          v1: {
            ExportTracePartialSuccess: MessageTypeDefinition;
            ExportTraceServiceRequest: MessageTypeDefinition;
            ExportTraceServiceResponse: MessageTypeDefinition;
            TraceService: SubtypeConstructor<
              typeof grpc.Client,
              _opentelemetry_proto_collector_trace_v1_TraceServiceClient
            > & { service: _opentelemetry_proto_collector_trace_v1_TraceServiceDefinition };
          };
        };
      };
      common: {
        v1: {
          AnyValue: MessageTypeDefinition;
          ArrayValue: MessageTypeDefinition;
          InstrumentationScope: MessageTypeDefinition;
          KeyValue: MessageTypeDefinition;
          KeyValueList: MessageTypeDefinition;
        };
      };
      resource: {
        v1: {
          Resource: MessageTypeDefinition;
        };
      };
      trace: {
        v1: {
          ResourceSpans: MessageTypeDefinition;
          ScopeSpans: MessageTypeDefinition;
          Span: MessageTypeDefinition;
          SpanFlags: EnumTypeDefinition;
          Status: MessageTypeDefinition;
          TracesData: MessageTypeDefinition;
        };
      };
    };
  };
}
