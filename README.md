<p align="center">
  <img src="./docs/assets/Bee_Dark.svg" height="128">
  <h1 align="center">Bee Observe</h1>
</p>

<p align="center">
  <a aria-label="Join the community on GitHub" href="https://github.com/i-am-bee/bee-observe/discussions">
    <img alt="" src="https://img.shields.io/badge/Join%20the%20community-blueviolet.svg?style=for-the-badge&labelColor=000000&label=Bee">
  </a>
  <h4 align="center">Open-source observability service for Bee Agent Framework</h4>
</p>

`Bee Observe` is a REST API with OpenAPI documentation designed to collect information about `bee-agent-framework` events in the Opentelemetry format and save them as a Trace entity with additional information about `request`, `response` etc. to a **MongoDB** database. This app is built using the **Fastify** framework.

## Table of Contents

1. [👩‍💻 Get started with Observe](#-get-started-with-observe)
2. [🪑 Local set-up](#-local-set-up)
   - [Prerequisites](#prerequisites)
   - [Steps](#steps)
3. [🚀 Run](#-run)
   - [Running the server via Docker](#running-the-server-via-docker)
   - [Running the Server via Node.js](#running-the-server-via-nodejs)
   - [Development Mode](#development-mode)
4. [🧪 Run tests](#-run-tests)
5. [📣 Publishing](#-publishing)
6. [Code of conduct](#code-of-conduct)
7. [Legal notice](#legal-notice)
8. [📖 Docs](#-docs)

## 👩‍💻 Get started with Observe

> The running Observe instance uses the `Redis`, `MongoDB` and `Mlflow` services. See `./compose-before.yml` for more info on how to run them.

1. create .env.docker file
   > Use the `BASE_AUTH` authorization strategy in the production. See `MLFLOW_AUTHORIZATION` env variable.

   > Use TLS certificate for MongoDB and Redis. See `MONGODB_CA_CERT` and `REDIS_CA_CERT` env variables.

Create the `.env.docker` file and specify the environment variables. See a list of [supported environment variables](./.env.example).

2. Start the `observe_api` service

```
docker run --name observe_api -p 3000:3000 --env-file .env.docker iambeeagent/bee-observe:tagname
```

## 🪑 Local set-up

### Prerequisites

- Node.js (version managed using `nvm`)
- Yarn package manager (`corepack`)
- Docker (we recommend using [Rancher Desktop](https://rancherdesktop.io/))
- Git

### Steps

1. Clone the repository:

```bash
   git clone git@github.com:i-am-bee/bee-observe
   cd bee-observe
```

2. Use the appropriate Node.js version:

```
nvm use
```

3. Install dependencies

```
yarn
```

4. Prepare .env file
   Create a .env file in the root directory of the project and configure the necessary environment variables.
   Copy all (from `.env.example`) and fill in values.

5. Run infra
   To start all necessary services like `redis`, `mongo` and `mlflow` run this command:

```
yarn start:infra
```

6. Run migrations

```
yarn migration:up
```

### 🚀 Run

#### Running the server via Docker

1. Build the docker image

```
docker compose build
```

2. Start the `observe_api` service

```
docker compose up -d
```

#### Running the Server via Node.js

1. Build the source code

```
yarn build
```

2. To start the Fastify server, use the following command:

```
yarn start
```

#### Development Mode

For development mode with hot-reloading, use:

```
yarn dev
```

### 🧪 Run tests

> This project uses integration API tests that require a running observe instance to be executed.

```
yarn test
```

The coverage

```
yarn coverage
```

### Code of conduct

This project and everyone participating in it are governed by the [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please read the [full text](./CODE_OF_CONDUCT.md) so that you can read which actions may or may not be tolerated.

## Legal notice

All content in these repositories including code has been provided by IBM under the associated open source software license and IBM is under no obligation to provide enhancements, updates, or support. IBM developers produced this code as an open source project (not as an IBM product), and IBM makes no assertions as to the level of quality nor security, and will not be maintaining this code going forward.

## 📖 Docs

Read all related document pages carefully to understand the Observer API architecture and limitations.

- [Overview](./docs/overview.md)
- [Technical overview](./docs/technical-overview.md)
- [API](./docs/api.md)
- [Data persistence](./docs/data-persistence.md)
