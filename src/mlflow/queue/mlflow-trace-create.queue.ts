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

import { Job } from 'bullmq';
import { ref } from '@mikro-orm/core';

import { QueueName, createQueue } from '../../utils/queue.js';
import { ORM, wrapInRequestContext } from '../../utils/db.js';
import * as mlflowApi from '../utils/api/client.js';
import { assemblyTraceSpanTree } from '../utils/assembly-trace-span-tree.js';
import { MlflowTrace, MlflowTraceStep } from '../mlflow-trace.document.js';
import { toBaseErrorResponseDto } from '../../utils/error.js';
import { RunStatus, TraceStatus } from '../utils/api/types.js';
import { getQueueLogger } from '../../utils/logger-factories.js';
import { constants } from '../../utils/constants.js';

const logger = getQueueLogger({ service: 'trace', queue: QueueName['mlflow-trace-create'] });

interface JobInput {
  traceId: string;
  runId?: string;
  experimentId?: string;
}

const validRunStates = [RunStatus.SCHEDULED, RunStatus.RUNNING];

const { queue } = createQueue({
  name: QueueName['mlflow-trace-create'],
  jobHandler: async (job: Job<JobInput>) => {
    await wrapInRequestContext(async () => {
      const { traceId, runId, experimentId: experimentIdInput } = job.data;
      const experimentId = experimentIdInput || constants.MLFLOW.DEFAULT_EXPERIMENT_ID;

      // load data
      const trace = await ORM.trace.findOne(traceId);

      if (!trace) throw new Error(`Not existing trace with id ${traceId}`);

      // init mlflow trace
      const mlflowTrace = new MlflowTrace({
        step: MlflowTraceStep.START_TRACE,
        parent: ref(trace)
      });

      try {
        // check the experiment
        const experiment = await mlflowApi.getExperiment({ experimentId });
        logger.debug(experiment, 'loaded experiment');

        // check the run, if it's provided
        if (runId) {
          const run = await mlflowApi.getRun({ runId });
          logger.debug(run, 'loaded experiment');
          if (run.info.experimentId !== experimentId) {
            throw new Error(
              `The run experiment id ${run.info.experimentId} does not equal the selected ${experimentId} id`
            );
          }
          if (!validRunStates.includes(run.info.status)) {
            throw new Error(`Invalid selected run status ${run.info.status}`);
          }
        }

        // create trace request
        const { requestId } = await mlflowApi.createTrace({ trace, experimentId });
        mlflowTrace.requestId = requestId;

        // tree spans request
        mlflowTrace.step = MlflowTraceStep.ADD_TREE;
        const spanTree = assemblyTraceSpanTree({ trace, requestId });
        mlflowTrace.tree = spanTree;

        await mlflowApi.addSpanTree({
          experimentId,
          requestId,
          spanTree
        });

        mlflowTrace.step = MlflowTraceStep.CHECK_TREE;
        const savedSpans = await mlflowApi.getTraceArtifact({ requestId });
        if (savedSpans.length === 0) {
          throw new Error(`The spans have not been correctly saved as a mlflow artifact`);
        }

        mlflowTrace.step = MlflowTraceStep.CLOSE_TRACE;

        // close trace request
        await mlflowApi.closeTrace({
          requestId,
          status: trace.error ? TraceStatus.ERROR : TraceStatus.OK,
          timestampMs: trace.endTime.getTime()
        });
      } catch (err) {
        logger.error({ err }, 'Trace mlflow API error');
        mlflowTrace.error = toBaseErrorResponseDto(err);
      } finally {
        await ORM.em.persistAndFlush(mlflowTrace);
      }
    });
  }
});

export function addMlflowTracesToQueue(jobInputs: JobInput[]) {
  queue.addBulk(
    jobInputs.map((jobInput) => ({
      name: QueueName['mlflow-trace-create'],
      data: jobInput
    }))
  );
}
