import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { confirmCall } from "../shared/approval.mjs";
import { isMain, maskTarget, placeClawdCall, requireEnv, validateTarget } from "../shared/clawdcall.mjs";

const MATERIAL_CHANGES = new Set(["cancelled", "material_schedule_change"]);
const REQUIRED_ANSWERS = ["tonight_connection", "tomorrow_direct", "hold"];
const DEFAULT_EVENT_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "synthetic-event.json");

export function shouldCallTraveller(event, wasProcessed = () => false) {
  const deadline = Number(event?.expires_in_minutes);
  const allowedAnswers = Array.isArray(event?.allowed_answers) ? event.allowed_answers : [];

  return Boolean(
    event?.synthetic === true &&
      typeof event.decision_id === "string" &&
      event.decision_id.length > 0 &&
      event.status_verified === true &&
      event.options_current === true &&
      MATERIAL_CHANGES.has(event.disruption_type) &&
      event.call_opt_in === true &&
      event.traveller_matches === true &&
      event.decision_required === true &&
      event.decision_resolved === false &&
      event.transaction_authorized === false &&
      deadline > 0 &&
      deadline <= 30 &&
      REQUIRED_ANSWERS.every((answer) => allowedAnswers.includes(answer)) &&
      !wasProcessed(event.decision_id)
  );
}

export function buildFlightDecisionTask(event) {
  if (!shouldCallTraveller(event)) {
    throw new Error("The synthetic event did not pass the flight-decision call gates");
  }

  return [
    "Tell the traveller this is a synthetic ClawdCall flight-change test.",
    "Say their synthetic flight was cancelled and present exactly two options: arrive tonight with one connection, or arrive tomorrow on a direct flight.",
    "Ask them to answer tonight, tomorrow, or hold.",
    "Explain that their answer records a preference only and does not book, cancel, pay for, or hold a flight.",
    "If the answer is unclear, say the decision will remain unresolved.",
    "Do not request payment details, passwords, passport data, or one-time codes. Then end the call.",
  ].join(" ");
}

export function resolvePreference(answer, event) {
  const normalized = String(answer || "")
    .trim()
    .toLowerCase()
    .replace(/[._-]+/g, " ");
  const aliases = new Map([
    ["tonight", "tonight_connection"],
    ["tonight connection", "tonight_connection"],
    ["tomorrow", "tomorrow_direct"],
    ["tomorrow direct", "tomorrow_direct"],
    ["hold", "hold"],
  ]);
  const preference = aliases.get(normalized) || null;
  const allowed = Array.isArray(event?.allowed_answers) ? event.allowed_answers : [];
  const accepted = preference !== null && allowed.includes(preference);

  return {
    decisionId: event?.decision_id || null,
    status: accepted ? "preference_captured" : "unresolved",
    preference: accepted ? preference : null,
    transactionAuthorized: false,
    requiresTravelRefresh: true,
  };
}

export async function loadEvent(file = DEFAULT_EVENT_FILE) {
  return JSON.parse(await readFile(file, "utf8"));
}

export async function main(env = process.env, argv = process.argv) {
  const event = await loadEvent(env.FLIGHT_EVENT_FILE || DEFAULT_EVENT_FILE);
  const processedIds = new Set(
    String(env.PROCESSED_DECISION_IDS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );

  if (!shouldCallTraveller(event, (id) => processedIds.has(id))) {
    console.log("No call: the decision is ineligible, resolved, expired, or already processed.");
    return;
  }

  const target = validateTarget(requireEnv("EXPECTED_TARGET", env));
  const task = buildFlightDecisionTask(event);
  console.log(`Decision: ${event.decision_id}`);
  console.log(`Expected recipient: ${maskTarget(target)}`);
  console.log(`Transaction authorized: ${event.transaction_authorized}`);
  console.log(`Task: ${task}`);

  if (argv.includes("--dry-run")) {
    console.log("Dry run complete. No call was placed.");
    return;
  }

  const approved = await confirmCall({
    target,
    task,
    prompt: "Type CALL to approve this one synthetic self-call: ",
  });
  if (!approved) {
    console.log("Call cancelled.");
    return;
  }

  const result = await placeClawdCall({
    apiKey: requireEnv("CLAWDCALL_API_KEY", env),
    target,
    tasks: task,
    baseUrl: env.CLAWDCALL_BASE_URL,
  });
  console.log(JSON.stringify(result, null, 2));
  console.log("Next: fetch the transcript, classify only a listed preference, and refresh travel data before any action.");
}

if (isMain(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
