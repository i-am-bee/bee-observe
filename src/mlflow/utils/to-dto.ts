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

import { TraceGetOneQuery } from '../../trace/trace.dto.js';
import { MlflowTrace } from '../mlflow-trace.document.js';
import { TraceMlflow } from '../mlflow-trace.dto.js';

export function toDto({
  mlflowTrace,
  flags
}: {
  mlflowTrace: MlflowTrace;
  flags: TraceGetOneQuery;
}): TraceMlflow {
  return {
    id: mlflowTrace.id,
    created_at: mlflowTrace.createdAt.toISOString(),
    request_id: mlflowTrace.requestId,
    step: mlflowTrace.step,
    error: mlflowTrace.error,
    tree: flags.include_mlflow_tree ? mlflowTrace.tree : []
  };
}
