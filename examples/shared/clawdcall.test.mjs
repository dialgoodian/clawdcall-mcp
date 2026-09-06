import assert from "node:assert/strict";
import test from "node:test";
import { buildOutboundPayload, maskTarget, placeClawdCall } from "./clawdcall.mjs";

test("buildOutboundPayload keeps the target operator-controlled", () => {
  assert.deepEqual(
    buildOutboundPayload({
      target: "+15551234567",
      tasks: " Deliver one test message. ",
      introMessage: " Hello. ",
    }),
    {
      target: "+15551234567",
      tasks: "Deliver one test message.",
      raw: { introMessage: "Hello." },
    },
  );
  assert.equal(maskTarget("+15551234567"), "+15******567");
});

test("buildOutboundPayload rejects non-E.164 targets", () => {
  assert.throws(
    () => buildOutboundPayload({ target: "555-1234", tasks: "Test" }),
    /E\.164/,
  );
});

test("placeClawdCall sends the documented authenticated request", async () => {
  let captured;
  const fetchImpl = async (url, init) => {
    captured = { url: String(url), init };
    return new Response(JSON.stringify({ campaignId: "campaign_test" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const result = await placeClawdCall({
    apiKey: "test-key",
    target: "+15551234567",
    tasks: "Deliver one test message.",
    fetchImpl,
  });

  assert.deepEqual(result, { campaignId: "campaign_test" });
  assert.equal(captured.url, "https://api.clawdcall.com/external/v1/agent/outbound?conversionFlag=1");
  assert.equal(captured.init.method, "POST");
  assert.equal(captured.init.headers.Authorization, "Bearer test-key");
  assert.deepEqual(JSON.parse(captured.init.body), {
    target: "+15551234567",
    tasks: "Deliver one test message.",
  });
});
