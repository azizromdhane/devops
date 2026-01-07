const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({
    register,
    prefix: 'mern_backend_',
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// Custom metrics can be added here
// Example: HTTP request counter
const httpRequestCounter = new client.Counter({
    name: 'mern_backend_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});

// Example: HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
    name: 'mern_backend_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [register],
});

module.exports = {
    register,
    httpRequestCounter,
    httpRequestDuration,
};
