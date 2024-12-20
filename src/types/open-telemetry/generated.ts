/**
 * Copyright 2024 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as grpc from '@grpc/grpc-js';
import {
  Long,
  MethodDefinition,
  MessageTypeDefinition,
  EnumTypeDefinition
} from '@grpc/proto-loader';

export interface ArrayValue {
  values?: AnyValue[];
}
export interface ArrayValue__Output {
  values: AnyValue__Output[];
}

export interface KeyValueList {
  values?: KeyValue[];
}
export interface KeyValueList__Output {
  values: KeyValue__Output[];
}

export interface AnyValue {
  stringValue?: string;
  boolValue?: boolean;
  intValue?: number | string | Long;
  doubleValue?: number | string;
  arrayValue?: ArrayValue | null;
  kvlistValue?: KeyValueList | null;
  bytesValue?: Buffer | Uint8Array | string;
  value?:
    | 'stringValue'
    | 'boolValue'
    | 'intValue'
    | 'doubleValue'
    | 'arrayValue'
    | 'kvlistValue'
    | 'bytesValue';
}
export interface AnyValue__Output {
  stringValue?: string;
  boolValue?: boolean;
  intValue?: number;
  doubleValue?: number;
  arrayValue?: ArrayValue__Output | null;
  kvlistValue?: KeyValueList__Output | null;
  bytesValue?: Buffer;
  value:
    | 'stringValue'
    | 'boolValue'
    | 'intValue'
    | 'doubleValue'
    | 'arrayValue'
    | 'kvlistValue'
    | 'bytesValue';
}

export interface KeyValue {
  key?: string;
  value?: AnyValue | null;
}
export interface KeyValue__Output {
  key: string;
  value: AnyValue__Output | null;
}

export interface Resource {
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
}
export interface Resource__Output {
  attributes: KeyValue__Output[];
  droppedAttributesCount: number;
}

export interface InstrumentationScope {
  name?: string;
  version?: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
}
export interface InstrumentationScope__Output {
  name: string;
  version: string;
  attributes: KeyValue__Output[];
  droppedAttributesCount: number;
}

declare const _opentelemetry_proto_trace_v1_Status_StatusCode: {
  readonly STATUS_CODE_UNSET: 'STATUS_CODE_UNSET';
  readonly STATUS_CODE_OK: 'STATUS_CODE_OK';
  readonly STATUS_CODE_ERROR: 'STATUS_CODE_ERROR';
};
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

export interface _opentelemetry_proto_trace_v1_Span_Event {
  timeUnixNano?: number | string | Long;
  name?: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
}
export interface _opentelemetry_proto_trace_v1_Span_Event__Output {
  timeUnixNano: number;
  name: string;
  attributes: KeyValue__Output[];
  droppedAttributesCount: number;
}
export interface _opentelemetry_proto_trace_v1_Span_Link {
  traceId?: Buffer | Uint8Array | string;
  spanId?: Buffer | Uint8Array | string;
  traceState?: string;
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
  flags?: number;
}
export interface _opentelemetry_proto_trace_v1_Span_Link__Output {
  traceId: Buffer;
  spanId: Buffer;
  traceState: string;
  attributes: KeyValue__Output[];
  droppedAttributesCount: number;
  flags: number;
}
declare const _opentelemetry_proto_trace_v1_Span_SpanKind: {
  readonly SPAN_KIND_UNSPECIFIED: 'SPAN_KIND_UNSPECIFIED';
  readonly SPAN_KIND_INTERNAL: 'SPAN_KIND_INTERNAL';
  readonly SPAN_KIND_SERVER: 'SPAN_KIND_SERVER';
  readonly SPAN_KIND_CLIENT: 'SPAN_KIND_CLIENT';
  readonly SPAN_KIND_PRODUCER: 'SPAN_KIND_PRODUCER';
  readonly SPAN_KIND_CONSUMER: 'SPAN_KIND_CONSUMER';
};
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
  attributes?: KeyValue[];
  droppedAttributesCount?: number;
  events?: _opentelemetry_proto_trace_v1_Span_Event[];
  droppedEventsCount?: number;
  links?: _opentelemetry_proto_trace_v1_Span_Link[];
  droppedLinksCount?: number;
  status?: Status | null;
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
  attributes: KeyValue__Output[];
  droppedAttributesCount: number;
  events: _opentelemetry_proto_trace_v1_Span_Event__Output[];
  droppedEventsCount: number;
  links: _opentelemetry_proto_trace_v1_Span_Link__Output[];
  droppedLinksCount: number;
  status: Status__Output | null;
  flags: number;
}

export interface ScopeSpans {
  scope?: InstrumentationScope | null;
  spans?: Span[];
  schemaUrl?: string;
}
export interface ScopeSpans__Output {
  scope: InstrumentationScope__Output | null;
  spans: Span__Output[];
  schemaUrl: string;
}

export interface ResourceSpans {
  resource?: Resource | null;
  scopeSpans?: ScopeSpans[];
  schemaUrl?: string;
}
export interface ResourceSpans__Output {
  resource: Resource__Output | null;
  scopeSpans: ScopeSpans__Output[];
  schemaUrl: string;
}

export interface ExportTraceServiceRequest {
  resourceSpans?: ResourceSpans[];
}
export interface ExportTraceServiceRequest__Output {
  resourceSpans: ResourceSpans__Output[];
}

export interface ExportTracePartialSuccess {
  rejectedSpans?: number | string | Long;
  errorMessage?: string;
}
export interface ExportTracePartialSuccess__Output {
  rejectedSpans: number;
  errorMessage: string;
}

export interface ExportTraceServiceResponse {
  partialSuccess?: ExportTracePartialSuccess | null;
}
export interface ExportTraceServiceResponse__Output {
  partialSuccess: ExportTracePartialSuccess__Output | null;
}

export interface TraceServiceClient extends grpc.Client {
  Export(
    argument: ExportTraceServiceRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<ExportTraceServiceResponse__Output>
  ): grpc.ClientUnaryCall;
  Export(
    argument: ExportTraceServiceRequest,
    metadata: grpc.Metadata,
    callback: grpc.requestCallback<ExportTraceServiceResponse__Output>
  ): grpc.ClientUnaryCall;
  Export(
    argument: ExportTraceServiceRequest,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<ExportTraceServiceResponse__Output>
  ): grpc.ClientUnaryCall;
  Export(
    argument: ExportTraceServiceRequest,
    callback: grpc.requestCallback<ExportTraceServiceResponse__Output>
  ): grpc.ClientUnaryCall;
  export(
    argument: ExportTraceServiceRequest,
    metadata: grpc.Metadata,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<ExportTraceServiceResponse__Output>
  ): grpc.ClientUnaryCall;
  export(
    argument: ExportTraceServiceRequest,
    metadata: grpc.Metadata,
    callback: grpc.requestCallback<ExportTraceServiceResponse__Output>
  ): grpc.ClientUnaryCall;
  export(
    argument: ExportTraceServiceRequest,
    options: grpc.CallOptions,
    callback: grpc.requestCallback<ExportTraceServiceResponse__Output>
  ): grpc.ClientUnaryCall;
  export(
    argument: ExportTraceServiceRequest,
    callback: grpc.requestCallback<ExportTraceServiceResponse__Output>
  ): grpc.ClientUnaryCall;
}
export interface TraceServiceDefinition extends grpc.ServiceDefinition {
  Export: MethodDefinition<
    ExportTraceServiceRequest,
    ExportTraceServiceResponse,
    ExportTraceServiceRequest__Output,
    ExportTraceServiceResponse__Output
  >;
}

export type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
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
            TraceService: SubtypeConstructor<typeof grpc.Client, TraceServiceClient> & {
              service: TraceServiceDefinition;
            };
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
