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

import { constants } from '../../../../utils/constants.js';

export function buildUrl(route: string, queryParams?: Record<string, string | string[]>): string {
  const url = new URL(route, constants.MLFLOW.API_URL);

  // Add query parameters to the URL
  if (queryParams) {
    Object.keys(queryParams).forEach((key) => {
      const value = queryParams[key];
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, v));
      } else {
        url.searchParams.append(key, value);
      }
    });
  }

  // mlflow cannot work with parsed `%2B` character
  return url.toString().replace(/%2B/g, '+');
}
