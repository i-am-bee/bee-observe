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

import * as path from 'node:path';
import * as fs from 'node:fs';
import os from 'os';

import { Options, MongoDriver } from '@mikro-orm/mongodb';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations-mongodb';

if (process.env.NODE_ENV === 'production') {
  process.env.MIKRO_ORM_NO_COLOR = 'true';
}

/**
 * We cannot import the constants file here.
 * This file must be isolated.
 */
const MONGODB_URL = process.env.MONGODB_URL;
const MONGO_DB = process.env.MONGODB_DATABASE_NAME || 'bee-observe';
const MONGO_TLS_CA_CERT = process.env.MONGODB_CA_CERT;

function createMongoTLSConfig() {
  if (!MONGO_TLS_CA_CERT) return;

  const rootMongoCertPath = path.join(os.tmpdir(), 'mongodb-ca.pem');
  fs.writeFileSync(rootMongoCertPath, MONGO_TLS_CA_CERT, 'utf-8');
  return { tls: true, tlsCAFile: rootMongoCertPath };
}

// https://mikro-orm.io/docs/usage-with-mongo
const config: Options = {
  driver: MongoDriver,
  // folder-based discovery setup, using common filename suffix
  entities: ['./dist/**/*.document.js'],
  entitiesTs: process.env.NODE_ENV !== 'production' ? ['./src/**/*.document.ts'] : [],

  /**
   * We are having some ECONNRESET errors on the DIPC cluster. Seems like problem with f5 load balancer.
   * These seems could help to fix the issue. Motivated by:
   * https://github.com/strapi/strapi/issues/8117#issuecomment-702559536
   */
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 8000,
    idleTimeoutMillis: 8000,
    reapIntervalMillis: 1000
  },

  extensions: [Migrator],
  migrations: {
     // Point to the right folder based on the environment
    path: process.env.NODE_ENV === 'production' ? './dist/migrations' : './src/migrations',
    // The `true` value Does not work for replicasets as well. It throw an error: `Cannot create namespace bee-observe.mikro_orm_migrations in multi-document transaction.`
    transactional: false
  },

  contextName: 'mongo',
  clientUrl: MONGODB_URL,
  dbName: MONGO_DB,
  // we will use the ts-morph reflection, an alternative to the default reflect-metadata provider
  // check the documentation for their differences: https://mikro-orm.io/docs/metadata-providers
  metadataProvider: TsMorphMetadataProvider,
  // enable debug mode to log SQL queries and discovery information
  debug: process.env.NODE_ENV !== 'production' ? true : ['query', 'info'],
  driverOptions: {
    ...createMongoTLSConfig()
  },
  dynamicImportProvider: (id) => {
    if (process.env.NODE_ENV === 'production') {
      return import(id.replace(/\.ts$/, '.js')); // Ensure it loads `.js` files in production
    }
    return import(id); // Otherwise, load `.ts` files during development
  }
};

export default config;
