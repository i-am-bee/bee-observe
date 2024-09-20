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

import { StatusCodes } from 'http-status-codes';

import { constants } from '../../../../utils/constants.js';
import { ErrorWithProps, ErrorWithPropsCodes, MlflowError } from '../../../../utils/error.js';
import { SupportedAuthorizationType } from '../types.js';
import { getLogger } from '../../../../utils/logger.js';

const logger = getLogger().child({ module: 'mlflow' });

export async function runRequest<Res>({
  url,
  method,
  body
}: {
  url: string;
  method: string;
  body?: any;
}): Promise<Res> {
  try {
    const { type, username, password } = constants.MLFLOW.AUTHORIZATION;
    logger.debug({ url, body, method, authType: type }, 'call mlflow API');

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(type === SupportedAuthorizationType.BASE_AUTH && {
          Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
        })
      },
      ...(body && { body: JSON.stringify(body) })
    });

    // Check if the response status is not OK (200-299)
    if (!response.ok) {
      throw new MlflowError(
        'Request to mlflow service failed',
        {
          code: ErrorWithPropsCodes.SERVICE_UNAVAILABLE,
          reason: response.statusText,
          response: await response.json()
        },
        response.status
      );
    }

    return await response.json();
  } catch (err) {
    if (err instanceof ErrorWithProps) throw err;
    throw new ErrorWithProps(
      'Request to mlflow service failed',
      {
        code: ErrorWithPropsCodes.SERVICE_UNAVAILABLE,
        ...(err instanceof Error && { reason: err.message })
      },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
