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

import packageJsonData from '../../package.json' assert { type: 'json' };
import { constants } from '../utils/constants.js';

import { SystemGetResponse } from './system.dto.js';

export function getSystemData(): SystemGetResponse {
  return {
    version: packageJsonData.version,
    git: {
      tag: constants.GIT_TAG
    },
    mlflow: {
      url: constants.MLFLOW.API_URL,
      default_experiment_id: constants.MLFLOW.DEFAULT_EXPERIMENT_ID
    }
  };
}
