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

import { Migration } from '@mikro-orm/migrations-mongodb';
import { MongoDriver } from '@mikro-orm/mongodb';

export class Migration20240806072013 extends Migration {
  async up(): Promise<void> {
    const collections = await this.driver.getConnection().getDb().listCollections().toArray();
    async function createCollectionSafe({ name, driver }: { name: string; driver: MongoDriver }) {
      const collection = collections.find(
        (collection) => collection.name === name && collection.type === 'collection'
      );
      if (!collection) {
        await driver.getConnection().getDb().createCollection(name);
      }
    }

    await createCollectionSafe({ name: 'span', driver: this.driver });
    await createCollectionSafe({ name: 'trace', driver: this.driver });
    await createCollectionSafe({ name: 'mlflow-trace', driver: this.driver });
  }

  async down(): Promise<void> {
    await this.driver.getConnection().getDb().dropCollection('span');
    await this.driver.getConnection().getDb().dropCollection('trace');
    await this.driver.getConnection().getDb().dropCollection('mlflow-trace');
  }
}
