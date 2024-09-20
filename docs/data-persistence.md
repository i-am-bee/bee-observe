# Data persistence

The Observe service saved data about traces primarily in the MongoDB database but in the Mlflow as well. The data are saved only for a specific time and then are deleted from the system.
The important `DATA_EXPIRATION_IN_DAYS` env variable defines how long data will be persisted.

## Mlflow

Data are saved on the Mlflow part as well. The mlflow saves the data on the disk by default. We recommend setting the Mlflow to save data in the database for better performance.

### Delete task

The server automatically runs the **BullMQ** background task removing the expired data from the Mlflow. You can configure how often the job will run via the `MLFLOW_TRACE_DELETE_IN_BATCHES_CRON_PATTERN` env variable.

## Database

The application is based on the MongoDB database. The MongoDB instance is part of the `compose.yml` and the `yarn start:infra` command.

### TTL indexes

The app stores the data only for a specific time and they are automatically deleted by the `TTL` indexes.
The indexes are created durring the init app process and the expiration is set in days via the `DATA_EXPIRATION_IN_DAYS` environment variable. The users can change the expiration and increase the value in days and the index is updated for this case.

> However, reducing the expiration value can make many documents eligible for immediate deletion, potentially causing performance issues due to the increased delete operations. In this case: 1) delete the records from the database in small batches, 2) delete the ttl index manually, and 3) start the server again.

See the [docs](https://www.mongodb.com/docs/manual/core/index-ttl) for additional information about TTL indexes in MongoDB.

#### Delete task

The background task that removes expired documents runs every 60 seconds. As a result, documents may remain in a collection during the period between the expiration of the document and the running of the background task. MongoDB starts deleting documents 0 to 60 seconds after the index completes.

#### Replica sets

On replica set members, the TTL background thread only deletes documents when a member is in state primary. The TTL background thread is idle when a member is in state secondary. Secondary members replicate deletion operations from the primary.

#### Restrictions

- TTL indexes are single-field indexes. Compound indexes do not support TTL and ignore the expireAfterSeconds option.
- The \_id field does not support TTL indexes.
- If a non-TTL single-field index already exists for a field, you cannot create a TTL index on the same field since you cannot create indexes that have the same key specification and differ only by the options. To change a non-TTL single-field index to a TTL index, use the collMod database command.

see the [full restriction list](https://www.mongodb.com/docs/manual/core/index-ttl/#restrictions)
