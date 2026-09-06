import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_BASE_URL = "https://api.clawdcall.com";
const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export function requireEnv(name, env = process.env) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export function validateTarget(target) {
  if (!E164_PATTERN.test(target)) {
    throw new Error("EXPECTED_TARGET must be an E.164 phone number such as +15551234567");
  }
  return target;
}

export function maskTarget(target) {
  const normalized = validateTarget(target);
  return `${normalized.slice(0, 3)}${"*".repeat(Math.max(0, normalized.length - 6))}${normalized.slice(-3)}`;
}

export function buildOutboundPayload({ target, tasks, introMessage }) {
  const normalizedTasks = String(tasks || "").trim();
  if (!normalizedTasks) throw new Error("A bounded call task is required");

  return {
    target: validateTarget(target),
    tasks: normalizedTasks,
    ...(introMessage?.trim() ? { raw: { introMessage: introMessage.trim() } } : {}),
  };
}

export async function placeClawdCall({
  apiKey,
  target,
  tasks,
  introMessage,
  baseUrl = DEFAULT_BASE_URL,
  fetchImpl = fetch,
}) {
  if (!apiKey?.trim()) throw new Error("CLAWDCALL_API_KEY is required");
  const url = new URL("/external/v1/agent/outbound?conversionFlag=1", normalizeBaseUrl(baseUrl));
  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
      "User-Agent": "clawdcall-agent-examples/1.0",
    },
    body: JSON.stringify(buildOutboundPayload({ target, tasks, introMessage })),
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`ClawdCall request failed with status ${response.status}: ${text || "empty response"}`);
  }
  return text ? JSON.parse(text) : null;
}

export function isMain(moduleUrl, argv = process.argv) {
  if (!argv[1]) return false;
  return moduleUrl === pathToFileURL(path.resolve(argv[1])).href;
}

function normalizeBaseUrl(baseUrl) {
  const normalized = String(baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
  return `${normalized}/`;
}
