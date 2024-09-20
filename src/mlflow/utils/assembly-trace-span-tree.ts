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

import { Trace } from '../../trace/trace.document.js';
import { TreeItem } from '../../trace/utils/assembly-trace.js';
import { TraceMlflowTreeItem } from '../mlflow-trace.dto.js';

/**
 * Using existing Trace entity where nesting and events are already prepared and transform it to the flat structure of mlflow
 * @param param0
 * @returns
 */
export function assemblyTraceSpanTree({
  trace,
  requestId
}: {
  requestId: string;
  trace: Trace;
}): TraceMlflowTreeItem[] {
  const createSpanTree = (
    treeItem: TreeItem,
    parentId: string | null = null
  ): TraceMlflowTreeItem[] => {
    const span = {
      name: treeItem.id,
      context: {
        trace_id: requestId,
        span_id: treeItem.id
      },
      parent_id: parentId,
      attributes: {
        'mlflow.traceRequestId': requestId,
        'mlflow.spanType': 'UNKNOWN', // https://mlflow.org/docs/latest/python_api/mlflow.entities.html#mlflow.entities.SpanType
        ...treeItem.events.reduce((indexedEvents, event, index) => {
          return {
            ...indexedEvents,
            [`${event.name} (${index + 1})`]: {
              startTime: event.startTime,
              endTime: event.endTime,
              statusCode: event.statusCode,
              statusMessage: event.statusMessage,
              data: event.data
            }
          };
        }, {})
      },
      start_time: treeItem.startTime.getTime(),
      end_time: treeItem.endTime.getTime(),
      status_code: treeItem.statusCode, // https://mlflow.org/docs/latest/python_api/mlflow.entities.html#mlflow.entities.SpanStatus
      // default values
      //// TODO: events does not work in the current mlflow version and there are no data in UI. I use the attributes instead
      events: [],
      status_message: ''
    };

    return [span, ...treeItem.children.flatMap((item) => createSpanTree(item, treeItem.id))];
  };

  return [
    // the main trace span - only one top span must be defined
    {
      name: 'trace',
      context: {
        trace_id: requestId,
        span_id: trace.id
      },
      parent_id: null,
      attributes: {
        'mlflow.traceRequestId': requestId,
        'mlflow.spanType': 'UNKNOWN',
        'mlflow.spanInputs': JSON.stringify(trace.request),
        'mlflow.spanOutputs': JSON.stringify(trace.response)
      },
      start_time: trace.startTime.getTime(),
      end_time: trace.endTime.getTime(),
      status_code: trace.error ? 'ERROR' : 'OK',
      events: [],
      status_message: ''
    },
    ...trace.tree.flatMap((treeItem) => createSpanTree(treeItem, trace.id))
  ];
}
