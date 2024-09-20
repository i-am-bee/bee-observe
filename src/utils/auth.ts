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

import { FastifyRequest, FastifyInstance, FastifyPluginAsync, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import auth from '@fastify/auth';
import { StatusCodes } from 'http-status-codes';

import { constants } from './constants.js';
import { ErrorWithProps, ErrorWithPropsCodes } from './error.js';

export type BeeAuthFn = (
  req: FastifyRequest,
  rep: FastifyReply,
  done: (error?: Error) => void
) => void;
export const beeAuth: BeeAuthFn = (req, _, done) => {
  const authKey = getAuthKey(req);
  if (authKey !== constants.AUTH_KEY) {
    return done(
      new ErrorWithProps(
        'invalid api key',
        { code: ErrorWithPropsCodes.AUTH_ERROR },
        StatusCodes.UNAUTHORIZED
      )
    );
  }
  done();
};

export const authPlugin: FastifyPluginAsync = fp.fastifyPlugin(async (app: FastifyInstance) => {
  app.decorate('beeAuth', beeAuth);
  app.register(auth);
});

export function getAuthKey(req: FastifyRequest): string | undefined {
  const uiAuthHeader = req.headers[constants.BEE_AUTH_HEADER];

  return Array.isArray(uiAuthHeader) ? uiAuthHeader[0] : uiAuthHeader;
}
