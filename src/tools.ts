import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ClawdCallClient, JsonObject } from "./client.js";
import { jsonResponse } from "./format.js";

const optionalString = z.string().min(1).optional();

export function registerTools(server: McpServer, client: ClawdCallClient): void {
  server.tool(
    "account_overview",
    "Get account usage, plan limits, phone number counts, and recent ClawdCall activity.",
    {},
    async () => jsonResponse(await client.get("/v1/usage")),
  );

  server.tool(
    "list_agents",
    "List ClawdCall phone agents configured for this account.",
    {},
    async () => jsonResponse(await client.get("/v1/agents")),
  );

  server.tool(
    "get_agent",
    "Get one ClawdCall phone agent by ID.",
    {
      agent_id: z.string().min(1).describe("ClawdCall agent ID."),
    },
    async ({ agent_id }) => jsonResponse(await client.get(`/v1/agents/${encodeURIComponent(agent_id)}`)),
  );

  server.tool(
    "create_agent",
    "Create a ClawdCall phone agent with voice behavior and instructions.",
    {
      name: z.string().min(1),
      system_prompt: z.string().min(1).describe("Instructions the voice agent follows during calls."),
      voice: optionalString.describe("Voice ID to use for calls."),
      begin_message: optionalString.describe("Optional first line the agent says when a call starts."),
      model_tier: optionalString.describe("Optional backend model tier, such as turbo, balanced, or max."),
      transfer_number: optionalString.describe("Optional E.164 phone number for call transfer."),
      voicemail_message: optionalString.describe("Optional message to leave when voicemail is detected."),
      webhook_url: optionalString.describe("Optional webhook URL for dynamic call handling."),
    },
    async (args) => {
      const body = compact({
        name: args.name,
        systemPrompt: args.system_prompt,
        voice: args.voice,
        beginMessage: args.begin_message,
        modelTier: args.model_tier,
        transferNumber: args.transfer_number,
        voicemailMessage: args.voicemail_message,
        webhookUrl: args.webhook_url,
      });

      return jsonResponse(await client.post("/v1/agents", body));
    },
  );

  server.tool(
    "update_agent",
    "Update a ClawdCall phone agent. Only provided fields are changed.",
    {
      agent_id: z.string().min(1),
      name: optionalString,
      system_prompt: optionalString,
      voice: optionalString,
      begin_message: optionalString,
      model_tier: optionalString,
      transfer_number: optionalString,
      voicemail_message: optionalString,
      webhook_url: optionalString,
    },
    async (args) => {
      const body = compact({
        name: args.name,
        systemPrompt: args.system_prompt,
        voice: args.voice,
        beginMessage: args.begin_message,
        modelTier: args.model_tier,
        transferNumber: args.transfer_number,
        voicemailMessage: args.voicemail_message,
        webhookUrl: args.webhook_url,
      });

      return jsonResponse(await client.patch(`/v1/agents/${encodeURIComponent(args.agent_id)}`, body));
    },
  );

  server.tool(
    "list_voices",
    "List voices available for ClawdCall phone agents.",
    {},
    async () => jsonResponse(await client.get("/v1/agents/voices")),
  );

  server.tool(
    "list_numbers",
    "List phone numbers owned by this ClawdCall account.",
    {},
    async () => jsonResponse(await client.get("/v1/numbers")),
  );

  server.tool(
    "buy_number",
    "Buy a new phone number and optionally attach it to a ClawdCall agent.",
    {
      country: z.string().min(2).default("US").describe("Country code, such as US or CA."),
      area_code: optionalString.describe("Optional area code, such as 415."),
      agent_id: optionalString.describe("Optional agent ID to attach the number immediately."),
    },
    async (args) => {
      const body = compact({
        country: args.country,
        areaCode: args.area_code,
        agentId: args.agent_id,
      });

      return jsonResponse(await client.post("/v1/numbers", body));
    },
  );

  server.tool(
    "attach_number",
    "Attach an existing ClawdCall number to an agent.",
    {
      agent_id: z.string().min(1),
      number_id: z.string().min(1),
    },
    async ({ agent_id, number_id }) => {
      return jsonResponse(
        await client.post(`/v1/agents/${encodeURIComponent(agent_id)}/numbers`, {
          numberId: number_id,
        }),
      );
    },
  );

  server.tool(
    "send_message",
    "Send an SMS message from a ClawdCall agent.",
    {
      agent_id: z.string().min(1),
      to_number: z.string().min(1).describe("Recipient phone number in E.164 format."),
      body: z.string().min(1),
      number_id: optionalString.describe("Optional sender number ID if the agent has multiple numbers."),
      media_url: optionalString.describe("Optional media URL for MMS-capable backends."),
    },
    async (args) => {
      return jsonResponse(
        await client.post(
          "/v1/messages",
          compact({
            agent_id: args.agent_id,
            to_number: args.to_number,
            body: args.body,
            number_id: args.number_id,
            media_url: args.media_url,
          }),
        ),
      );
    },
  );

  server.tool(
    "list_conversations",
    "List SMS conversations, optionally scoped to an agent.",
    {
      agent_id: optionalString,
      limit: z.number().int().positive().max(100).optional(),
    },
    async ({ agent_id, limit }) => {
      const path = agent_id ? `/v1/agents/${encodeURIComponent(agent_id)}/conversations` : "/v1/conversations";
      return jsonResponse(await client.get(path, { limit }));
    },
  );

  server.tool(
    "get_conversation",
    "Get one SMS conversation and its messages.",
    {
      conversation_id: z.string().min(1),
    },
    async ({ conversation_id }) => {
      return jsonResponse(await client.get(`/v1/conversations/${encodeURIComponent(conversation_id)}`));
    },
  );

  server.tool(
    "make_call",
    "Place an outbound ClawdCall voice call. Provide a system prompt for autonomous calls.",
    {
      agent_id: z.string().min(1),
      to_number: z.string().min(1).describe("Recipient phone number in E.164 format."),
      system_prompt: optionalString.describe("Instructions for an autonomous AI call."),
      initial_greeting: optionalString.describe("First line the agent says when the call connects."),
      from_number_id: optionalString.describe("Optional sender number ID."),
      voice: optionalString.describe("Optional voice override for this call."),
    },
    async (args) => {
      return jsonResponse(
        await client.post(
          "/v1/calls",
          compact({
            agentId: args.agent_id,
            toNumber: args.to_number,
            systemPrompt: args.system_prompt,
            initialGreeting: args.initial_greeting,
            fromNumberId: args.from_number_id,
            voice: args.voice,
          }),
        ),
      );
    },
  );

  server.tool(
    "list_calls",
    "List ClawdCall voice calls, optionally filtered by agent, number, status, or direction.",
    {
      agent_id: optionalString,
      number_id: optionalString,
      status: optionalString,
      direction: optionalString,
      limit: z.number().int().positive().max(100).optional(),
    },
    async ({ agent_id, number_id, status, direction, limit }) => {
      const path = agent_id ? `/v1/agents/${encodeURIComponent(agent_id)}/calls` : "/v1/calls";
      return jsonResponse(await client.get(path, { number_id, status, direction, limit }));
    },
  );

  server.tool(
    "get_call",
    "Get call details and transcript by call ID.",
    {
      call_id: z.string().min(1),
    },
    async ({ call_id }) => jsonResponse(await client.get(`/v1/calls/${encodeURIComponent(call_id)}`)),
  );

  server.tool(
    "get_webhook",
    "Get the account-level webhook or an agent-specific webhook.",
    {
      agent_id: optionalString,
    },
    async ({ agent_id }) => {
      const path = agent_id ? `/v1/agents/${encodeURIComponent(agent_id)}/webhook` : "/v1/webhooks";
      return jsonResponse(await client.get(path));
    },
  );

  server.tool(
    "set_webhook",
    "Set the account-level webhook or an agent-specific webhook.",
    {
      url: z.string().url(),
      agent_id: optionalString,
    },
    async ({ url, agent_id }) => {
      const path = agent_id ? `/v1/agents/${encodeURIComponent(agent_id)}/webhook` : "/v1/webhooks";
      return jsonResponse(await client.post(path, { url }));
    },
  );
}

function compact(values: Record<string, unknown>): JsonObject {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined)) as JsonObject;
}
