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

import { Long } from '@grpc/proto-loader';

import { MainSpan } from '../types/internal/span.js';
import type { Span__Output } from '../types/open-telemetry/generated.js';

import { Span } from './span.document.js';

export function unixNanoToDate(nano: Long): Date {
  const nanos = Long.fromBits(nano.low, nano.high, nano.unsigned).toUnsigned().toNumber();

  return new Date(Math.floor(nanos / 1_000_000));
}

export function uint8ArrayToHexString(uint8Array: Uint8Array) {
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function getAttributeValue({
  attributes,
  key
}: {
  attributes: Span__Output['attributes'];
  key: string;
}) {
  return attributes.find((attr) => attr.key === key)?.value?.stringValue;
}

export function findMainSpan(spans: Span[]): MainSpan | undefined {
  return spans.find((span) => !span.parentId && span.attributes.traceId) as MainSpan | undefined;
}
