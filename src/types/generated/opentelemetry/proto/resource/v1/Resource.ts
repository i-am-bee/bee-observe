// Original file: src/protos/resource.proto

import type {
  KeyValue as _opentelemetry_proto_common_v1_KeyValue,
  KeyValue__Output as _opentelemetry_proto_common_v1_KeyValue__Output
} from '../../../../opentelemetry/proto/common/v1/KeyValue.js';

export interface Resource {
  attributes?: _opentelemetry_proto_common_v1_KeyValue[];
  droppedAttributesCount?: number;
}

export interface Resource__Output {
  attributes: _opentelemetry_proto_common_v1_KeyValue__Output[];
  droppedAttributesCount: number;
}
