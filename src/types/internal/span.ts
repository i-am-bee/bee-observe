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

import { Span } from '../../span/span.document.js';

export type MainSpan = Omit<Span, 'attributes'> & {
  attributes: Omit<
    Span['attributes'],
    'history' | 'response' | 'prompt' | 'traceId' | 'version'
  > & {
    version: NonNullable<Span['attributes']['version']>;
    history: NonNullable<Span['attributes']['history']>;
    prompt: NonNullable<Span['attributes']['prompt']>;
    traceId: NonNullable<Span['attributes']['traceId']>;
    response: NonNullable<Span['attributes']['response']>;
  };
};
