# Using Bee Observe OTLP Backend with OpenTelemetry

This documentation explains how to configure the OpenTelemetry Node.js SDK and the OpenTelemetry Collector to send telemetry data to your custom OTLP backend.

## Limitations

> we support only OpenTelemetry Exporter with HTTP/protobuf

For javascript you can use the `@opentelemetry/exporter-trace-otlp-proto` package.

> We support only the `v1/traces` endpoint

## 1. Using the Custom Backend with the OpenTelemetry Node.js SDK

The OpenTelemetry Node.js SDK can send traces and metrics directly to your custom OTLP backend.

Install the necessary OpenTelemetry dependencies:

```
npm install @opentelemetry/sdk-node @opentelemetry/exporter-trace-otlp-proto @opentelemetry/semantic-conventions
```

Configure the SDK to export telemetry data:

```
import '@opentelemetry/instrumentation/hook.mjs';
import { NodeSDK, resources } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

export const sdk = new NodeSDK({
  resource: new resources.Resource({
    [ATTR_SERVICE_NAME]: 'your-sevice-name',
    [ATTR_SERVICE_VERSION]: '0.0.1' // Load the version of you service
  }),
  traceExporter: new OTLPTraceExporter({
    url: 'http://<custom-backend-host>:4318/v1/traces', // Custom backend endpoint for traces
    headers: {
        'x-bee-authorization': '<auth-key>' // Custom auth key
    },
    timeoutMillis: 120_000
  })
});

// Start the SDK
sdk.start().then(() => {
  console.log('OpenTelemetry SDK started');
}).catch((error) => {
  console.error('Error starting OpenTelemetry SDK', error);
});
```

> see the full example [here](https://opentelemetry.io/docs/languages/js/exporters/#otlp)

### Key Points

- Replace <custom-backend-host> with your custom OTLP backend's hostname or IP address.
- Replace <auth-key> with the value defined by `AUTH_KEY` environment variable.
- The exporters use the OTLP protocol over HTTP/Proto.
- Ensure your application can connect to the backend on port 4318.

## 2. Using the Custom Backend with the OpenTelemetry Collector

The OpenTelemetry Collector acts as an intermediary, allowing more flexibility in processing and routing telemetry data to your custom backend. See [docs](https://opentelemetry.io/docs/collector/)

### Collector Configuration

Create a configuration file (otel-collector-config.yaml) with the following content:

```
receivers:
  otlp:
    protocols:
      http: # Listening for OTLP data over HTTP
        endpoint: "0.0.0.0:4318"

exporters:
  otlphttp:
    endpoint: "http://<custom-backend-host>:4318" # Custom backend endpoint
    compression: none
    headers:
      content-type: "application/x-protobuf"
      x-bee-authorization: '<auth-key>' # Custom auth key

processors:
  batch:
    timeout: 5s
    send_batch_size: 512

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlphttp]
```

### Steps to Configure

- Replace <custom-backend-host> with the hostname or IP of your custom backend.
- Replace <auth-key> with the value defined by `AUTH_KEY` environment variable.
- Ensure the otlphttp exporter points to http://<custom-backend-host>:4318.

### Start the Collector

Run the collector with this configuration file to route telemetry data to the custom backend.
