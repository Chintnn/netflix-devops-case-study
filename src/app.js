const express = require('express');
const client = require('prom-client');
const os = require('os');

const app = express();
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});
const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2],
  registers: [register],
});

app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    const labels = {
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode,
    };
    httpRequests.inc(labels);
    end(labels);
  });
  next();
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let recommendationDown = false;

const titles = [
  { id: 1, name: 'Space Drift', genre: 'Sci-Fi' },
  { id: 2, name: 'The Long Crown', genre: 'Drama' },
  { id: 3, name: 'Night Market', genre: 'Crime' },
  { id: 4, name: 'Heist House', genre: 'Thriller' },
];
const personalized = ['Heist House', 'Space Drift', 'Night Market'];
const fallbackTitles = ['Top 10 Today', 'Trending Now'];

app.get('/', (req, res) => {
  res.json({
    service: 'netflix-service',
    version: process.env.APP_VERSION || '1.0.0',
    pod: os.hostname(),
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/titles', async (req, res) => {
  await sleep(Math.random() * 80);
  res.json(titles);
});

// Graceful degradation: if the recommendation "service" is down, serve a fallback list
app.get('/api/recommendations', (req, res) => {
  try {
    if (recommendationDown) throw new Error('recommendation service unavailable');
    res.json({ source: 'personalized', degraded: false, titles: personalized });
  } catch (err) {
    res.json({ source: 'fallback', degraded: true, titles: fallbackTitles });
  }
});

// Chaos engineering controls
app.post('/chaos/recommendations/fail', (req, res) => {
  recommendationDown = true;
  res.json({ recommendationDown });
});
app.post('/chaos/recommendations/heal', (req, res) => {
  recommendationDown = false;
  res.json({ recommendationDown });
});
app.get('/chaos/error', (req, res) => {
  res.status(500).json({ error: 'simulated failure' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

module.exports = app;