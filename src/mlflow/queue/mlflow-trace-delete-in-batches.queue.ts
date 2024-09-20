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

import { createQueue, QueueName } from '../../utils/queue.js';
import { wrapInRequestContext } from '../../utils/db.js';
import * as mlflowApi from '../utils/api/client.js';
import { constants } from '../../utils/constants.js';
import { getQueueLogger } from '../../utils/logger-factories.js';

const queueName: QueueName = QueueName['mlflow-trace-delete-in-batches'];
const logger = getQueueLogger({ service: 'trace', queue: QueueName[queueName] });

const { queue } = createQueue({
  name: QueueName[queueName],
  jobsOptions: { attempts: 1 },
  workerOptions: { concurrency: 1 },
  jobHandler: async (job: Job) => {
    await wrapInRequestContext(async () => {
      const experimentId = constants.MLFLOW.DEFAULT_EXPERIMENT_ID;

      const traces = await mlflowApi.getTraces({
        experimentIds: [experimentId],
        orderBy: 'timestamp_ms+ASC',
        maxResults: constants.MLFLOW.TRACE_DELETE_IN_BATCHES_BATCH_SIZE
      });
      const tracesToDel = traces.filter(
        (trace) => Date.now() - trace.timestamp > getMongoDataExprirationInMs()
      );

      if (tracesToDel.length > 0) {
        const { deleted } = await mlflowApi.deleteTraces({
          experimentId,
          requestIds: tracesToDel.map((trace) => trace.requestId)
        });
        logger.info({ deleted }, 'Trace mlflow delete operation succeeded');
      } else {
        logger.info('No Traces to delete in mlflow');
      }
    });
  }
});

function getMongoDataExprirationInMs() {
  return constants.DATA_EXPIRATION_IN_DAYS * 24 * 60 * 60 * 1000;
}

export function runMlflowTraceDeleteInBatchesQueue(pattern: string) {
  queue.add(QueueName[queueName], null, {
    repeat: {
      pattern,
      immediately: false
    },
    jobId: QueueName[queueName]
  });
}
