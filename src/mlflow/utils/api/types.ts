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

export enum SupportedAuthorizationType {
  NO_AUTH = 'NO_AUTH',
  BASE_AUTH = 'BASE_AUTH'
}

export enum TraceStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  OK = 'OK',
  ERROR = 'ERROR'
}

interface Tag {
  key: string;
  value: string;
}

export interface TraceSpanTag {
  name: string;
  type: string;
  outputs: string[];
}

export interface TraceInfo {
  request_id: string;
  experiment_id: string;
  timestamp_ms: number;
  execution_time_ms: number;
  status: TraceStatus;
  request_metadata: {
    key: string;
    value: string;
  }[];
  tags: {
    key: string;
    value: string;
  }[];
}

export interface ParsedTraceInfo {
  requestId: TraceInfo['request_id'];
  experimentId: TraceInfo['experiment_id'];
  timestamp: TraceInfo['timestamp_ms'];
  executionTime: TraceInfo['execution_time_ms'];
  status: TraceInfo['status'];
  metadata: TraceInfo['request_metadata'];
  tags: TraceInfo['tags'];
}

// https://mlflow.org/docs/latest/rest-api.html#mlflowexperiment
export interface Experiment {
  experiment_id: string;
  name: string;
  artifact_location: string;
  lifecycle_stage: string; // Current life cycle stage of the experiment: “active” or “deleted”. Deleted experiments are not returned by APIs.
  last_update_time: number;
  creation_time: number;
  tags?: Tag[];
}

export interface ParsedExperiment {
  id: Experiment['experiment_id'];
  name: Experiment['name'];
  createdAt: Experiment['creation_time'];
  updatedAt: Experiment['last_update_time'];
  artifactLocation: Experiment['artifact_location'];
  lifecycleState: Experiment['lifecycle_stage'];
}

export enum RunStatus {
  RUNNING = 'RUNNING',
  SCHEDULED = 'SCHEDULED',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
  KILLED = 'KILLED'
}

export interface Run {
  // https://mlflow.org/docs/latest/rest-api.html#mlflowruninfo
  info: {
    run_uuid: string;
    experiment_id: string;
    run_name: string;
    user_id: string;
    status: RunStatus;
    start_time: number;
    end_time: number;
    artifact_uri: string;
    lifecycle_stage: string;
    run_id: string;
  };
  // https://mlflow.org/docs/latest/rest-api.html#rundata
  data: {
    tags: Tag[];
    metrics?: {
      key: string;
      value: number;
      timestamp: number;
      step: number;
    }[];
    params?: {
      key: string;
      value: string;
    }[];
  };
  inputs: {
    // https://mlflow.org/docs/latest/rest-api.html#datasetinput
    dataset_inputs?: {
      tags: Tag[];
      dataset: any;
    }[];
  };
}

// I will provide only info object to the app, other properties are not necessary
export interface ParsedRun {
  info: {
    uuid: Run['info']['run_id'];
    id: Run['info']['run_id'];
    experimentId: Run['info']['experiment_id'];
    name: Run['info']['run_name'];
    userId: Run['info']['user_id'];
    status: Run['info']['status'];
    startedAt: Run['info']['start_time'];
    finishedAt: Run['info']['end_time'];
    artifactUri: Run['info']['artifact_uri'];
    lifecycleStage: Run['info']['lifecycle_stage'];
  };
}
