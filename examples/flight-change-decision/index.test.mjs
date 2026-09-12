import assert from "node:assert/strict";
import test from "node:test";
import { buildFlightDecisionTask, loadEvent, resolvePreference, shouldCallTraveller } from "./index.mjs";

const fixture = await loadEvent();

test("the published synthetic event passes every call gate", () => {
  assert.equal(shouldCallTraveller(fixture), true);
});

test("consent, freshness, deadline, transaction, and replay failures suppress the call", () => {
  const rejectedChanges = [
    { call_opt_in: false },
    { status_verified: false },
    { options_current: false },
    { decision_resolved: true },
    { expires_in_minutes: 31 },
    { transaction_authorized: true },
    { synthetic: false },
  ];

  for (const change of rejectedChanges) {
    assert.equal(shouldCallTraveller({ ...fixture, ...change }), false);
  }
  assert.equal(shouldCallTraveller(fixture, (id) => id === fixture.decision_id), false);
});

test("the call task presents a preference and excludes a booking authorization", () => {
  const task = buildFlightDecisionTask(fixture);
  assert.match(task, /tonight, tomorrow, or hold/i);
  assert.match(task, /does not book, cancel, pay for, or hold a flight/i);
  assert.match(task, /one-time codes/i);
});

test("only listed answers become preferences", () => {
  assert.deepEqual(resolvePreference("Tonight", fixture), {
    decisionId: "synthetic-decision-042",
    status: "preference_captured",
    preference: "tonight_connection",
    transactionAuthorized: false,
    requiresTravelRefresh: true,
  });
  assert.equal(resolvePreference("Book whichever is cheapest", fixture).status, "unresolved");
  assert.equal(resolvePreference("", fixture).status, "unresolved");
});
