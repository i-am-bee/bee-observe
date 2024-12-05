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

import { Entity, ManyToOne, Property, Ref } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

import { BaseDocument } from '../utils/base.document.js';
import { Trace } from '../trace/trace.document.js';
import type { Span__Output } from '../types/generated/opentelemetry/proto/trace/v1/Span.js';
import { _opentelemetry_proto_trace_v1_Status_StatusCode } from '../types/generated/opentelemetry/proto/trace/v1/Status.js';

import { SpanDto } from './span.dto.js';
import { getAttributeValue, uint8ArrayToHexString, unixNanoToDate } from './utilt.js';

// this entity represents https://opentelemetry.io/docs/concepts/signals/traces/#spans
@Entity()
export class Span extends BaseDocument {
  @Property()
  name!: string;

  @Property()
  parentId?: string;

  @Property()
  startTime!: Date;

  @Property()
  endTime!: Date;

  @Property()
  statusCode!: SpanDto['status_code'];

  @Property()
  statusMessage?: string;

  @Property()
  context!: {
    spanId: SpanDto['context']['span_id'];
  };

  @Property()
  attributes!: SpanDto['attributes'];

  @ManyToOne()
  trace!: Ref<Trace>;

  constructor(input: Span__Output) {
    super(new ObjectId());
    Object.assign(this, this.fromProtoTelemetry(input));
  }

  toTelemetry({ include_attributes_ctx }: { include_attributes_ctx: boolean }): SpanDto {
    const { ctx, ...otherAttributes } = this.attributes;

    return {
      name: this.name,
      parent_id: this.parentId,
      start_time: this.startTime.toISOString(),
      end_time: this.endTime.toISOString(),
      status_code: this.statusCode,
      status_message: this.statusMessage,
      context: {
        span_id: this.context.spanId
      },
      attributes: {
        ...otherAttributes,
        ctx: include_attributes_ctx ? this.attributes.ctx : undefined
      }
    };
  }

  fromProtoTelemetry(span: Span__Output): SpanInput {
    const { attributes } = span;

    const data = getAttributeValue({ attributes, key: 'data' });
    const ctx = getAttributeValue({ attributes, key: 'ctx' });
    const history = getAttributeValue({ attributes, key: 'history' });
    const response = getAttributeValue({ attributes, key: 'response' });
    const statusCode: number = (span.status?.code as any) || 1;

    return {
      name: span.name,
      parentId: span.parentSpanId && uint8ArrayToHexString(span.parentSpanId),
      startTime: unixNanoToDate(span.startTimeUnixNano as any),
      endTime: unixNanoToDate(span.endTimeUnixNano as any),
      statusCode: statusCode === 1 ? 'OK' : 'ERROR',
      statusMessage: span.status?.message,
      context: {
        spanId: uint8ArrayToHexString(span.spanId)
      },
      attributes: {
        data: data && JSON.parse(data),
        ctx: ctx && JSON.parse(ctx),
        target: getAttributeValue({ attributes, key: 'target' }),
        name: getAttributeValue({ attributes, key: 'name' }),
        traceId: getAttributeValue({ attributes, key: 'traceId' }),
        prompt: getAttributeValue({ attributes, key: 'prompt' }),
        version: getAttributeValue({ attributes, key: 'version' }),
        response: response && JSON.parse(response),
        history: history && JSON.parse(history)
      }
    };
  }
}

export type SpanInput = Omit<
  Span,
  '_id' | 'id' | 'createdAt' | 'trace' | 'toTelemetry' | 'fromProtoTelemetry'
>;
