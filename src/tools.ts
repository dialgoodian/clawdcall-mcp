import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ClawdCallClient, JsonObject } from "./client.js";
import { jsonResponse } from "./format.js";

const optionalString = z.string().min(1).optional();

export function registerTools(server: McpServer, client: ClawdCallClient): void {
  server.tool(
    "send_signup_otp",
    "Send a ClawdCall signup phone verification OTP. Does not require an API key.",
    {
      email: z.string().email(),
      phone_number: z.string().min(1).describe("Human phone number to verify."),
    },
    async ({ email, phone_number }) => {
      return jsonResponse(
        await client.post(
          "/cc/signup/send-otp",
          {
            email,
            phoneNumber: phone_number,
          },
          { authenticated: false },
        ),
      );
    },
  );

  server.tool(
    "verify_signup_otp",
    "Verify a ClawdCall signup OTP and receive account/API-key details. Does not require an existing API key.",
    {
      email: z.string().email(),
      phone_number: z.string().min(1).describe("Human phone number used for signup."),
      otp: z.string().min(1).describe("OTP code received by the human."),
    },
    async ({ email, phone_number, otp }) => {
      return jsonResponse(
        await client.post(
          "/cc/signup/verify-otp",
          {
            email,
            phoneNumber: phone_number,
            otp,
          },
          { authenticated: false },
        ),
      );
    },
  );

  server.tool(
    "place_outbound_call",
    "Place an outbound ClawdCall agent call. Requires CLAWDCALL_API_KEY.",
    {
      target: z.string().min(1).describe("E.164 phone number to call."),
      tasks: z.string().min(1).describe("Full voice-agent instruction set for the call."),
      intro_message: optionalString.describe("Optional opening line for the voice agent."),
      openclaw_webhook_url: optionalString.describe("Optional OpenClaw /agent/run webhook URL for completion events."),
      openclaw_webhook_authorization: optionalString.describe("Optional Authorization header value for the OpenClaw webhook."),
      conversation_id: optionalString.describe("Optional OpenClaw conversation ID for event correlation."),
      user_id: optionalString.describe("Optional user ID for webhook correlation."),
      context: optionalString.describe("Optional extra context to include in the webhook payload."),
    },
    async (args) => {
      return jsonResponse(
        await client.post(
          "/external/v1/agent/outbound?conversionFlag=1",
          compact({
            target: args.target,
            tasks: args.tasks,
            raw: args.intro_message ? { introMessage: args.intro_message } : undefined,
            openclaw: buildOpenClawPayload(args),
          }),
        ),
      );
    },
  );

  server.tool(
    "get_call_transcript",
    "Fetch a ClawdCall transcript by call ID or campaign ID. Requires CLAWDCALL_API_KEY.",
    {
      id: z.string().min(1).describe("Call ID or campaign ID returned by ClawdCall."),
    },
    async ({ id }) => {
      return jsonResponse(await client.get(`/cc/v1/calls/${encodeURIComponent(id)}/transcript`));
    },
  );
}

function buildOpenClawPayload(args: {
  openclaw_webhook_url?: string;
  openclaw_webhook_authorization?: string;
  conversation_id?: string;
  user_id?: string;
  context?: string;
}): JsonObject | undefined {
  if (
    !args.openclaw_webhook_url &&
    !args.openclaw_webhook_authorization &&
    !args.conversation_id &&
    !args.user_id &&
    !args.context
  ) {
    return undefined;
  }

  return compact({
    webhook: args.openclaw_webhook_url
      ? compact({
          url: args.openclaw_webhook_url,
          method: "POST",
          headers: args.openclaw_webhook_authorization
            ? {
                Authorization: args.openclaw_webhook_authorization,
              }
            : undefined,
        })
      : undefined,
    webhookPayload: compact({
      conversation_id: args.conversation_id,
      user_id: args.user_id,
      context: args.context,
    }),
  });
}

function compact(values: Record<string, unknown>): JsonObject {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined)) as JsonObject;
}
