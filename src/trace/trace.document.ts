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

import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

import { BaseDocument } from '../utils/base.document.js';
import { Span } from '../span/span.document.js';

import { TraceError, TraceRequest } from './trace.dto.js';
import { TreeItem } from './utils/assembly-trace.js';

@Entity()
export class Trace extends BaseDocument {
  @Property()
  startTime!: Date;

  @Property({ unique: true, index: true })
  frameworkTraceId!: string;

  @Property()
  endTime!: Date;

  @Property()
  error?: TraceError;

  @OneToMany({ entity: () => Span, mappedBy: 'trace' })
  spans = new Collection<Span>(this);

  @Property()
  tree!: TreeItem[];

  @Property()
  request!: TraceRequest;

  @Property()
  response?: any;

  constructor(input: TraceInput) {
    const { traceId, spans, ...rest } = input;

    super(new ObjectId());

    Object.assign(this, rest);
    this.spans.set(spans);
  }
}

export type TraceInput = Omit<Trace, '_id' | 'id' | 'createdAt' | 'spans'> & {
  traceId?: string;
  spans: Span[];
};
