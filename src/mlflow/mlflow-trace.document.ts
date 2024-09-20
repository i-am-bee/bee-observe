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

import { Entity, OneToOne, Property, Ref } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

import { BaseDocument } from '../utils/base.document.js';
import { BaseErrorResponse } from '../utils/error.js';
import { Trace } from '../trace/trace.document.js';

import { TraceMlflowTreeItem } from './mlflow-trace.dto.js';

export enum MlflowTraceStep {
  START_TRACE = 'START_TRACE', // The trace has been started and has the "RUNNING" status
  ADD_TREE = 'ADD_TREE',
  CHECK_TREE = 'CHECK_TREE',
  CLOSE_TRACE = 'CLOSE_TRACE' // The trace is closed with the "OK" / "ERROR" status
}

@Entity()
export class MlflowTrace extends BaseDocument {
  @Property()
  step!: MlflowTraceStep;

  @Property()
  error?: BaseErrorResponse;

  // The internal traceId in the MLFLOW system. It's called requestId in the rest API
  @Property()
  requestId?: string;

  @Property()
  tree?: TraceMlflowTreeItem[];

  @OneToOne()
  parent!: Ref<Trace>;

  constructor(input: MlflowTraceInput) {
    super(new ObjectId());
    Object.assign(this, input);
  }
}

type MlflowTraceInput = Omit<MlflowTrace, '_id' | 'id' | 'createdAt'>;
