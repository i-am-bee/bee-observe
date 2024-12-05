import type * as grpc from '@grpc/grpc-js';
import type { EnumTypeDefinition, MessageTypeDefinition } from '@grpc/proto-loader';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new (...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  opentelemetry: {
    proto: {
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
