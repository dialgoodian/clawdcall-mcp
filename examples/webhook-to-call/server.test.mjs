import assert from "node:assert/strict";
import test from "node:test";
import { createWebhookServer, signBody } from "./server.mjs";

const SECRET = "test-secret-that-is-long-enough";
const TARGET = "+15551234567";

test("signed webhook stays in dry-run mode by default", async (t) => {
  let calls = 0;
  const server = createWebhookServer({
    secret: SECRET,
    target: TARGET,
    placeCall: async () => {
      calls += 1;
    },
  });
  const url = await listen(t, server);
  const body = JSON.stringify({ event: "build.completed", message: "Build 42 passed." });
  const response = await fetch(url, {
    method: "POST",
    headers: { "X-ClawdCall-Signature": signBody(body, SECRET) },
    body,
  });

  assert.equal(response.status, 202);
  assert.equal(calls, 0);
  assert.deepEqual(await response.json(), {
    ok: true,
    dryRun: true,
    expectedTarget: "+15******567",
    task: "Internal test alert. Event: build.completed. Message: Build 42 passed. Ask the recipient to acknowledge it, then end the call.",
  });
});

test("webhook rejects an invalid signature", async (t) => {
  const server = createWebhookServer({ secret: SECRET, target: TARGET });
  const url = await listen(t, server);
  const response = await fetch(url, {
    method: "POST",
    headers: { "X-ClawdCall-Signature": "sha256=bad" },
    body: JSON.stringify({ event: "build.completed", message: "Build passed." }),
  });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "invalid_signature" });
});

test("live mode sends one fixed-target call through the injected client", async (t) => {
  const calls = [];
  const server = createWebhookServer({
    secret: SECRET,
    target: TARGET,
    apiKey: "test-key",
    allowLiveCall: true,
    placeCall: async (input) => {
      calls.push(input);
      return { campaignId: "campaign_test" };
    },
  });
  const url = await listen(t, server);
  const body = JSON.stringify({ event: "deploy.ready", message: "The release is ready for review." });
  const response = await fetch(url, {
    method: "POST",
    headers: { "X-ClawdCall-Signature": signBody(body, SECRET) },
    body,
  });

  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].target, TARGET);
  assert.match(calls[0].tasks, /deploy\.ready/);
  assert.deepEqual(await response.json(), {
    ok: true,
    dryRun: false,
    result: { campaignId: "campaign_test" },
  });

  const replay = await fetch(url, {
    method: "POST",
    headers: { "X-ClawdCall-Signature": signBody(body, SECRET) },
    body,
  });
  assert.equal(replay.status, 409);
  assert.equal(calls.length, 1);
  assert.deepEqual(await replay.json(), { error: "live_call_already_used" });
});

async function listen(t, server) {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))));
  const address = server.address();
  return `http://127.0.0.1:${address.port}/webhook`;
}
