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

import { Trace } from '../../../trace/trace.document.js';
import { TraceMlflowTreeItem } from '../../mlflow-trace.dto.js';

import {
  TraceInfo,
  ParsedTraceInfo,
  TraceStatus,
  Experiment,
  ParsedExperiment,
  Run,
  ParsedRun
} from './types.js';
import { parseTraceInfoResponse } from './utils/parse-trace-info-response.js';
import { runRequest } from './utils/run-request.js';
import { buildUrl } from './utils/build-url.js';

const BASE_API_PREFIX = 'api/2.0';
const AJAX_API_PREFIX = 'ajax-api/2.0';

/**
 * Create the trace in the MLFLOW. The trace will be in the "Running" state until the close function is called.
 * The route returns the `requestId` with which all other MLFLOW routes work. So we will have two IDs:
 * - traceId = The observe traceId saved in the MongoDB. You can join the Trace entity or all events via this ID.
 * - requestId = the internal traceId in the MLFLOW system.
 * @param traceId = The trace id from the mongo db
 * @returns ParsedTraceInfo
 */
export async function createTrace({
  trace,
  experimentId,
  runId
}: {
  trace: Trace;
  experimentId: string;
  runId?: string;
}): Promise<ParsedTraceInfo> {
  const requestMetadata = [
    {
      key: 'mlflow.trace_schema.version',
      value: '2'
    },
    {
      key: 'mlflow.traceInputs',
      value: trace.request.message
    },
    {
      key: 'mlflow.traceOutputs',
      value: trace.response?.text
    }
  ];
  if (runId) {
    requestMetadata.push({
      key: 'mlflow.sourceRun',
      value: runId
    });
  }

  const traceInfo = await runRequest<{ trace_info: TraceInfo }>({
    url: buildUrl(`${BASE_API_PREFIX}/mlflow/traces`),
    method: 'POST',
    body: {
      timestamp_ms: trace.startTime.getTime(),
      experiment_id: experimentId,
      request_metadata: requestMetadata,
      tags: [
        {
          key: 'mlflow.traceName',
          value: trace.id
        },
        {
          key: 'mlflow.source.name',
          value: 'bee-observe'
        },
        {
          key: 'mlflow.source.type',
          value: 'REMOTE'
        }
      ]
    }
  });

  return parseTraceInfoResponse(traceInfo.trace_info);
}

export async function closeTrace({
  requestId,
  status,
  timestampMs
}: {
  requestId: string;
  status: TraceStatus;
  timestampMs: number;
}): Promise<ParsedTraceInfo> {
  const traceInfo = await runRequest<{ trace_info: TraceInfo }>({
    url: buildUrl(`${BASE_API_PREFIX}/mlflow/traces/${requestId}`),
    method: 'PATCH',
    body: {
      request_id: requestId,
      timestamp_ms: timestampMs,
      status: status
    }
  });

  return parseTraceInfoResponse(traceInfo.trace_info);
}

export async function getTraces({
  experimentIds,
  // The default value from https://mlflow.org/docs/latest/python_api/mlflow.client.html#mlflow.client.MlflowClient.search_traces
  maxResults = 100,
  orderBy
}: {
  experimentIds?: string[];
  maxResults?: number;
  orderBy?: string;
}): Promise<ParsedTraceInfo[]> {
  const queryParams = {
    max_results: maxResults.toString(),
    ...(experimentIds && { experiment_ids: experimentIds }),
    ...(orderBy && { order_by: orderBy })
  };

  const { traces } = await runRequest<{ traces?: TraceInfo[] }>({
    url: buildUrl(`${AJAX_API_PREFIX}/mlflow/traces`, queryParams),
    method: 'GET'
  });

  return traces ? traces.map((trace) => parseTraceInfoResponse(trace)) : [];
}

export async function deleteTraces({
  experimentId,
  requestIds
}: {
  experimentId: string;
  requestIds: string[];
}): Promise<{ deleted: number }> {
  const { traces_deleted } = await runRequest<{ traces_deleted: number }>({
    url: buildUrl(`${BASE_API_PREFIX}/mlflow/traces/delete-traces`),
    method: 'POST',
    body: {
      experiment_id: experimentId,
      request_ids: requestIds
    }
  });

  return { deleted: traces_deleted };
}

export async function addSpanTree({
  requestId,
  spanTree,
  experimentId
}: {
  requestId: string;
  experimentId: string;
  spanTree: TraceMlflowTreeItem[];
}): Promise<void> {
  return runRequest({
    url: buildUrl(
      `${BASE_API_PREFIX}/mlflow-artifacts/artifacts/${experimentId}/traces/${requestId}/artifacts/traces.json`
    ),
    method: 'PUT',
    body: {
      spans: spanTree
    }
  });
}

export async function getTraceArtifact({
  requestId
}: {
  requestId: string;
}): Promise<TraceMlflowTreeItem[]> {
  const { spans } = await runRequest<{ spans: TraceMlflowTreeItem[] }>({
    url: buildUrl(`${AJAX_API_PREFIX}/mlflow/get-trace-artifact?request_id=${requestId}`),
    method: 'GET'
  });

  return spans;
}

export async function getExperiment({
  experimentId
}: {
  experimentId: string;
}): Promise<ParsedExperiment> {
  const { experiment } = await runRequest<{ experiment: Experiment }>({
    url: buildUrl(`${BASE_API_PREFIX}/mlflow/experiments/get?experiment_id=${experimentId}`),
    method: 'GET'
  });

  return {
    id: experiment.experiment_id,
    name: experiment.name,
    createdAt: experiment.creation_time,
    updatedAt: experiment.last_update_time,
    artifactLocation: experiment.artifact_location,
    lifecycleState: experiment.lifecycle_stage
  };
}

export async function getRun({ runId }: { runId: string }): Promise<ParsedRun> {
  const {
    run: { info }
  } = await runRequest<{ run: Run }>({
    url: buildUrl(`${BASE_API_PREFIX}/mlflow/runs/get?run_id=${runId}`),
    method: 'GET'
  });

  return {
    info: {
      uuid: info.run_uuid,
      id: info.run_id,
      experimentId: info.experiment_id,
      name: info.run_name,
      userId: info.user_id,
      status: info.status,
      startedAt: info.start_time,
      finishedAt: info.end_time,
      artifactUri: info.artifact_uri,
      lifecycleStage: info.lifecycle_stage
    }
  };
}
