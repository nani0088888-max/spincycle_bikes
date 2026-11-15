const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const testDb = path.join(__dirname, 'summary-test.db');
process.env.DB_PATH = testDb;

const { initializeDatabase, run, db } = require('../src/database');
const app = require('../src/app');

let server;
let baseUrl;

test.before(async () => {
  if (fs.existsSync(testDb)) fs.unlinkSync(testDb);
  await initializeDatabase();
  server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise(resolve => server.close(resolve));
  await new Promise(resolve => db.close(resolve));
  if (fs.existsSync(testDb)) fs.unlinkSync(testDb);
});

test('Test 1: summary counts bikes across two types', async () => {
  await run('DELETE FROM rentals');
  await run('DELETE FROM bikes');
  await run("INSERT INTO bikes (name, type) VALUES ('Road One', 'Road'), ('Road Two', 'Road'), ('Trail One', 'Mountain')");
  const response = await fetch(`${baseUrl}/bikes/summary`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), [
    { type: 'Mountain', count: 1 },
    { type: 'Road', count: 2 }
  ]);
});

test('Test 2: summary endpoint returns HTTP 200 and per-type counts', async () => {
  const response = await fetch(`${baseUrl}/bikes/summary`);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(data));
  assert.ok(data.some(row => row.type === 'Road' && row.count === 2));
});

test('Test 3: summary returns HTTP 200 with an empty list when no bikes exist', async () => {
  await run('DELETE FROM rentals');
  await run('DELETE FROM bikes');
  const response = await fetch(`${baseUrl}/bikes/summary`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), []);
});