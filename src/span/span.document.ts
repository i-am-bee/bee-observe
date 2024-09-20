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

import { SpanDto } from './span.dto.js';

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

  constructor(input: SpanDto) {
    super(new ObjectId());
    Object.assign(this, this.fromTelemetry(input));
  }

  toTelemetry({ include_attributes_ctx }: { include_attributes_ctx: boolean }): SpanDto {
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
        target: this.attributes.target,
        data: this.attributes.data,
        ctx: include_attributes_ctx ? this.attributes.ctx : null
      }
    };
  }

  fromTelemetry(span: SpanDto): SpanInput {
    return {
      name: span.name,
      parentId: span.parent_id,
      startTime: new Date(span.start_time),
      endTime: new Date(span.end_time),
      statusCode: span.status_code,
      statusMessage: span.status_message,
      context: {
        spanId: span.context.span_id
      },
      attributes: span.attributes
    };
  }
}

export type SpanInput = Omit<
  Span,
  '_id' | 'id' | 'createdAt' | 'trace' | 'toTelemetry' | 'fromTelemetry'
>;
