// Original file: src/protos/common.proto

import type {
  KeyValue as _opentelemetry_proto_common_v1_KeyValue,
  KeyValue__Output as _opentelemetry_proto_common_v1_KeyValue__Output
} from '../../../../opentelemetry/proto/common/v1/KeyValue.js';

export interface InstrumentationScope {
  name?: string;
  version?: string;
  attributes?: _opentelemetry_proto_common_v1_KeyValue[];
  droppedAttributesCount?: number;
}

export interface InstrumentationScope__Output {
  name: string;
  version: string;
  attributes: _opentelemetry_proto_common_v1_KeyValue__Output[];
  droppedAttributesCount: number;
}
