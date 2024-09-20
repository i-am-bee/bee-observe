# API Endpoints

The API documentation is available through OpenAPI. Once the server is running, you can access the OpenAPI docs at:

```
http://localhost:3000/docs
```

There is an application scope authentication/authorization in the bee-observe via the `x-bee-authorization` header.
The API key is defined via the `AUTH_KEY` environment variable.

> Use a long/strong API key to secure your API

See OpenAPI docs for more info, on how to define the auth key for requests.
