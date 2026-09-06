import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import {
  isMain,
  maskTarget,
  placeClawdCall,
  requireEnv,
  validateTarget,
} from "../shared/clawdcall.mjs";

const MAX_BODY_BYTES = 64 * 1024;

export function signBody(body, secret) {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

export function verifySignature(body, signature, secret) {
  if (typeof signature !== "string" || !/^sha256=[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = Buffer.from(signBody(body, secret));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function buildAlertTask(event) {
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    throw new Error("Webhook body must be a JSON object");
  }
  const eventName = String(event.event || "").trim();
  const message = String(event.message || "").trim();
  if (!eventName || eventName.length > 100) throw new Error("event must contain 1 to 100 characters");
  if (!message || message.length > 500) throw new Error("message must contain 1 to 500 characters");
  const messageSentence = /[.!?]$/.test(message) ? message : `${message}.`;
  return `Internal test alert. Event: ${eventName}. Message: ${messageSentence} Ask the recipient to acknowledge it, then end the call.`;
}

export function createWebhookServer({
  secret,
  target,
  apiKey,
  baseUrl,
  allowLiveCall = false,
  placeCall = placeClawdCall,
}) {
  if (!secret?.trim()) throw new Error("WEBHOOK_SECRET is required");
  validateTarget(target);
  if (allowLiveCall && !apiKey?.trim()) throw new Error("CLAWDCALL_API_KEY is required in live mode");
  let liveCallUsed = false;

  return createServer(async (request, response) => {
    try {
      if (request.method !== "POST" || request.url !== "/webhook") {
        return sendJson(response, 404, { error: "not_found" });
      }
      const body = await readBody(request);
      if (!verifySignature(body, request.headers["x-clawdcall-signature"], secret)) {
        return sendJson(response, 401, { error: "invalid_signature" });
      }
      const task = buildAlertTask(JSON.parse(body.toString("utf8")));
      if (!allowLiveCall) {
        return sendJson(response, 202, {
          ok: true,
          dryRun: true,
          expectedTarget: maskTarget(target),
          task,
        });
      }
      if (liveCallUsed) {
        return sendJson(response, 409, { error: "live_call_already_used" });
      }
      liveCallUsed = true;
      const result = await placeCall({ apiKey, target, tasks: task, baseUrl });
      return sendJson(response, 200, { ok: true, dryRun: false, result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      return sendJson(response, message === "request_too_large" ? 413 : 400, { error: message });
    }
  });
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error("request_too_large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

export async function main(env = process.env) {
  const allowLiveCall = env.ALLOW_LIVE_CALL === "1";
  const server = createWebhookServer({
    secret: requireEnv("WEBHOOK_SECRET", env),
    target: requireEnv("EXPECTED_TARGET", env),
    apiKey: allowLiveCall ? requireEnv("CLAWDCALL_API_KEY", env) : env.CLAWDCALL_API_KEY,
    baseUrl: env.CLAWDCALL_BASE_URL,
    allowLiveCall,
  });
  const port = Number(env.PORT || 3000);
  server.listen(port, "127.0.0.1", () => {
    console.log(`Webhook listening on http://127.0.0.1:${port}/webhook`);
    console.log(`Mode: ${allowLiveCall ? "LIVE" : "DRY RUN"}`);
  });
}

if (isMain(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
