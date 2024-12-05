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

import {
  EntityManager,
  EntityRepository,
  MikroORM,
  Options,
  RequestContext
} from '@mikro-orm/mongodb';

import { Trace } from '../trace/trace.document.js';
import { MlflowTrace } from '../mlflow/mlflow-trace.document.js';
import { Span } from '../span/span.document.js';

import { BaseDocument } from './base.document.js';
import { getLogger } from './logger.js';

const logger = getLogger().child({ module: 'db' });

export interface Services {
  orm: MikroORM;
  em: EntityManager;
  span: EntityRepository<Span>;
  trace: EntityRepository<Trace>;
  mlflowtrace: EntityRepository<MlflowTrace>;
}

export let ORM: Services;

export async function initORM(options?: Options): Promise<Services> {
  if (ORM) {
    return ORM;
  }

  const orm = await MikroORM.init(options);

  // save to cache before returning
  return (ORM = {
    orm,
    em: orm.em,
    trace: orm.em.getRepository(Trace),
    span: orm.em.getRepository(Span),
    mlflowtrace: orm.em.getRepository(MlflowTrace)
  });
}

export function wrapInRequestContext(fn: () => Promise<void>) {
  return new Promise<void>((resolve, reject) => {
    RequestContext.create(ORM.orm.em, async () => {
      try {
        await fn();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
}

export function isValidFrameworkId(id: string): boolean {
  return /^[0-9a-zA-Z]{8}$/.test(id);
}

interface Index {
  v: number;
  key: Record<string, number>;
  name: string;
  expireAfterSeconds?: number;
}

/**
 * Create TTL indexes for trace and span collections.
 *
 * Changing the expireAfterSeconds parameter does not trigger a complete index rebuild.
 * However, REDUCING the expireAfterSeconds value can make many documents eligible for immediate deletion, potentially causing performance issues due to the increased delete operations.
 *
 * The recommended approach is to manually delete documents in small batches before updating the TTL index. This helps control the impact on your cluster.
 *
 * - If the indexed field in a document is not a date or an array that holds one or more date values, the document will not expire.
 * - If a document does not contain the indexed field, the document will not expire. The `createdAt` field is part of the BasedDocument class, which each class inherits.
 *
 * When the TTL thread is active, you will see delete operations in the output of `db.currentOp()`
 *
 * @param param0
 */
export async function createTTLIndexes({ expireAfterSeconds }: { expireAfterSeconds: number }) {
  const db = ORM.em.getDriver().getConnection().getDb();
  await createTTLIndexSafe({ em: ORM.span, expireAfterSeconds, db });
  await createTTLIndexSafe({ em: ORM.trace, expireAfterSeconds, db });
  await createTTLIndexSafe({ em: ORM.mlflowtrace, expireAfterSeconds, db });
}

async function createTTLIndexSafe<T extends BaseDocument>({
  em,
  expireAfterSeconds,
  db
}: {
  em: EntityRepository<T>;
  expireAfterSeconds: number;
  db: EntityManager['driver']['connection']['db'];
}) {
  const indexName = `createdAt_ttl_1`;
  const { collectionName } = em.getCollection();

  const indexes: Index[] = await em.getCollection().listIndexes().toArray();
  const TTLIndex = indexes.find((index) => index.name === indexName);

  if (TTLIndex && TTLIndex.expireAfterSeconds) {
    // The expireAfterSeconds value cannot be decreased
    if (TTLIndex.expireAfterSeconds > expireAfterSeconds) {
      throw new Error(
        `Cannot change the expireAfterSeconds setting for the existing index ${TTLIndex.name} in the ${em.getCollection().collectionName} collection. The recommended approach is to manually delete documents in small batches and delete the index manually before re-creating the TTL index. This helps control the impact on your cluster.`
      );
    }
    // But it can be increased - there is no effect to performance
    else if (TTLIndex.expireAfterSeconds < expireAfterSeconds) {
      logger.info({ indexName, expireAfterSeconds, collectionName }, 'Updating TTL index');
      await db.command({
        collMod: collectionName,
        index: {
          expireAfterSeconds: expireAfterSeconds,
          name: indexName
        }
      });
    }
  } else {
    logger.info({ indexName, expireAfterSeconds, collectionName }, 'Creating TTL index');
    await em.getCollection().createIndex({ createdAt: 1 }, { expireAfterSeconds, name: indexName });
  }
}
