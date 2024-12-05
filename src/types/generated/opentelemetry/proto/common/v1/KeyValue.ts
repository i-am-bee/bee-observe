// Original file: src/protos/common.proto

import type {
  AnyValue as _opentelemetry_proto_common_v1_AnyValue,
  AnyValue__Output as _opentelemetry_proto_common_v1_AnyValue__Output
} from '../../../../opentelemetry/proto/common/v1/AnyValue.js';

export interface KeyValue {
  key?: string;
  value?: _opentelemetry_proto_common_v1_AnyValue | null;
}

export interface KeyValue__Output {
  key: string;
  value: _opentelemetry_proto_common_v1_AnyValue__Output | null;
}
