const { test, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

let server;
let base;

before(
  () =>
    new Promise((resolve) => {
      server = app.listen(0, () => {
        base = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    })
);

after(() => {
  server.closeAllConnections();
  server.close();
});

test('health endpoint returns ok', async () => {
  const res = await fetch(`${base}/health`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await res.json()).status, 'ok');
});

test('titles endpoint returns a list', async () => {
  const res = await fetch(`${base}/api/titles`);
  const body = await res.json();
  assert.ok(Array.isArray(body) && body.length > 0);
});

test('recommendations fall back when the service is down', async () => {
  await fetch(`${base}/chaos/recommendations/fail`, { method: 'POST' });
  const res = await fetch(`${base}/api/recommendations`);
  const body = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(body.source, 'fallback');
  await fetch(`${base}/chaos/recommendations/heal`, { method: 'POST' });
});