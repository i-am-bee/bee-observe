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

import { Job, Queue, Worker, DefaultJobOptions, WorkerOptions } from 'bullmq';

import { createClient } from './redis.js';
import { getLogger } from './logger.js';

const connection = createClient({
  // https://docs.bullmq.io/guide/going-to-production#maxretriesperrequest
  maxRetriesPerRequest: null
});

function getQueueLogger(queueName: string, job?: Job) {
  return getLogger().child({
    queueName: queueName,
    job: job && {
      id: job.id,
      name: job.name,
      repeatJobKey: job.repeatJobKey,
      failedReason: job.failedReason,
      data: job.data
    }
  });
}

export const Queues = new Map<QueueName, { queue: Queue; worker: Worker }>();

export enum QueueName {
  'mlflow-trace-create' = 'mlflow-trace-create',
  'mlflow-trace-delete-in-batches' = 'mlflow-trace-delete-in-batches'
}

export function createQueue<T>({
  name,
  jobHandler,
  workerOptions,
  jobsOptions = {}
}: {
  name: QueueName;
  jobHandler: (job: Job<T>) => Promise<void>;
  jobsOptions?: DefaultJobOptions;
  workerOptions?: Partial<WorkerOptions>;
}) {
  const queue = new Queue<T>(name, {
    connection: connection.options,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      ...jobsOptions
    }
  });

  // https://docs.bullmq.io/guide/going-to-production#log-errors
  queue.on('error', (err) => getQueueLogger(name).error({ err }, `Queue has failed`));

  const worker = new Worker(name, jobHandler, {
    ...workerOptions,
    concurrency: 3,
    connection: connection.options,
    // We need to set autorun to false otherwise the worker might pick up stuff while ORM is not ready
    autorun: false
  });

  // https://docs.bullmq.io/guide/going-to-production#log-errors
  worker.on('error', (err) => getQueueLogger(queue.name).warn({ err }, `Worker failed`));

  // other hooks
  worker.on('active', (job) => getQueueLogger(queue.name, job).info('Job started'));
  worker.on('failed', (job, err) => getQueueLogger(queue.name, job).error({ err }, `Job failed`));
  worker.on('completed', async (job) => getQueueLogger(queue.name, job).info(`Job done`));

  Queues.set(name, { queue, worker });

  return { queue, worker };
}
