# Overview

## 📦 Modules

The source directory (`src`) provides numerous modules that one can use.

| Name           | Description                                                                          |
| -------------- | ------------------------------------------------------------------------------------ |
| **span**       | Base observability unit. Data are accepted in the open-telemetry format.             |
| **trace**      | A collection of runs that are related to a single operation.                         |
| **mlflow**     | Base UI for tracing. Communication is via the REST API                               |
| **migrations** | All database migrations that prepare the necessary data for a valid application run. |
| **utils**      | Modules used by other modules within the app.                                        |

### Trace

A trace typically refers to the process of tracking and logging the internal operations, decisions, and interactions that happen during the inference of the model.
When an LLM processes a prompt, a trace can be used to record the flow of data through the models and such (tools caling, tokens generation, thoughts and plan generation etc..). This is useful for debugging, optimizing, or understanding how the model arrives at a specific output.
Traces consist of spans that have hierarchical relationships. See the next section for more info.

### Span

Each trace consists of multiple spans.
A span represents a unit of work done in a particular component or service.
Spans include metadata like start and end time, status, and other contextual data.
A span can have child spans, representing subprocesses or service calls made by the initial service.

### Mlflow

All traces are uploaded/deleted asynchronously to/from the mlflow. We use the BullMQ jobs for this case.
You can see all async jobs in the `/mlflow/queue` folder.

### Migrations

All database migrations prepare the necessary data for a valid application run.

## 📖 Module base structure

- `module` **file** = The fastify routes definition.
- `document` **file** = The MicroORM MongoDB document entity.
- `service` **file** = All encapsulated logic using in routes.
- `dto` **file** = Defines the shape of the data that is exposed in the API documentation.
- `queue`**folder** = All BullMQ jobs related to the specific module.
- `utils`**folder** = Internal functions using in the module.
