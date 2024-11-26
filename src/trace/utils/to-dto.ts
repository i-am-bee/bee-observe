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

import { MlflowTrace } from '../../mlflow/mlflow-trace.document.js';
import { toDto as mlflowToDto } from '../../mlflow/utils/to-dto.js';
import { Trace } from '../trace.document.js';
import { TraceDto, TraceGetOneQuery, TraceTreeItem as TraceTreeItemDto } from '../trace.dto.js';

import { TreeItem } from './assembly-trace.js';

export function toDto({
  trace,
  mlflowTrace,
  flags
}: {
  trace: Trace;
  mlflowTrace?: MlflowTrace;
  flags: TraceGetOneQuery;
}): TraceDto {
  return {
    id: trace.frameworkTraceId,
    start_at: trace.startTime.toISOString(),
    finish_at: trace.endTime.toISOString(),
    request: trace.request,
    response: trace.response,
    tree: flags.include_tree ? trace.tree.map((treeItem) => treeItemToDto(treeItem)) : null,
    mlflow: flags.include_mlflow && mlflowTrace ? mlflowToDto({ mlflowTrace, flags }) : null
  };
}

function treeItemToDto(treeItem: TreeItem): TraceTreeItemDto {
  return {
    id: treeItem.id,
    target: treeItem.target,
    start_time: treeItem.startTime.toISOString(),
    end_time: treeItem.endTime.toISOString(),
    status_code: treeItem.statusCode,
    events: treeItem.events.map((event) => ({
      name: event.name,
      status_code: event.statusCode,
      status_message: event.statusMessage,
      start_time: event.startTime.toISOString(),
      end_time: event.endTime.toISOString(),
      data: event.data || null
    })),
    children: treeItem.children.map((child) => treeItemToDto(child))
  };
}
