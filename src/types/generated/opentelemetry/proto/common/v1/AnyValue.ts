// Original file: src/protos/common.proto

import type { Long } from '@grpc/proto-loader';

import type {
  ArrayValue as _opentelemetry_proto_common_v1_ArrayValue,
  ArrayValue__Output as _opentelemetry_proto_common_v1_ArrayValue__Output
} from '../../../../opentelemetry/proto/common/v1/ArrayValue.js';
import type {
  KeyValueList as _opentelemetry_proto_common_v1_KeyValueList,
  KeyValueList__Output as _opentelemetry_proto_common_v1_KeyValueList__Output
} from '../../../../opentelemetry/proto/common/v1/KeyValueList.js';

export interface AnyValue {
  stringValue?: string;
  boolValue?: boolean;
  intValue?: number | string | Long;
  doubleValue?: number | string;
  arrayValue?: _opentelemetry_proto_common_v1_ArrayValue | null;
  kvlistValue?: _opentelemetry_proto_common_v1_KeyValueList | null;
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
  arrayValue?: _opentelemetry_proto_common_v1_ArrayValue__Output | null;
  kvlistValue?: _opentelemetry_proto_common_v1_KeyValueList__Output | null;
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
