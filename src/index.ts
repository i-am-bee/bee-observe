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

import './utils/load-config.js';

import { constants } from './utils/constants.js';
import { bootstrap } from './app.js';
import { getLogger } from './utils/logger.js';
import { Queues } from './utils/queue.js';
import { runMlflowTraceDeleteInBatchesQueue } from './mlflow/queue/mlflow-trace-delete-in-batches.queue.js';

// Run the server!
try {
  await bootstrap({ port: constants.PORT });

  // Run workers
  [...Queues.entries()].map(([_, { worker }]) => worker).forEach((worker) => worker.run());

  // Run repetable queues
  runMlflowTraceDeleteInBatchesQueue(constants.MLFLOW.TRACE_DELETE_IN_BATCHES_CRON_PATTERN);
} catch (err) {
  getLogger().fatal({ err }, 'Failed to start server!');
  process.exit(1);
}
