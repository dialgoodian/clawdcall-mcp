# ClawdCall MCP Server

Give AI agents phone-call and SMS ability through the Model Context Protocol.

`clawdcall-mcp` lets MCP-compatible clients create phone agents, buy numbers, send texts, place calls, read transcripts, and configure webhooks through the ClawdCall API.

## Quick Start

### 1. Get a ClawdCall API key

Create an API key from your ClawdCall dashboard.

### 2. Add ClawdCall to your MCP client

```json
{
  "mcpServers": {
    "clawdcall": {
      "command": "npx",
      "args": ["-y", "clawdcall-mcp"],
      "env": {
        "CLAWDCALL_API_KEY": "sk_live_your_key_here"
      }
    }
  }
}
```

For staging or self-hosted API routing:

```json
{
  "mcpServers": {
    "clawdcall": {
      "command": "npx",
      "args": ["-y", "clawdcall-mcp"],
      "env": {
        "CLAWDCALL_API_KEY": "sk_live_your_key_here",
        "CLAWDCALL_BASE_URL": "https://api.clawdcall.com"
      }
    }
  }
}
```

## Example Prompts

- "Create a ClawdCall agent for scheduling appointments."
- "Buy a US number in the 415 area code and attach it to my scheduling agent."
- "Call this restaurant and ask if they have a table for two tonight."
- "Text this customer that their appointment is confirmed for 3pm."
- "Show me recent calls and transcripts."
- "Set my webhook URL for inbound call and SMS events."

## Tools

### Account

| Tool | Description |
| --- | --- |
| `account_overview` | Get usage, plan limits, and account activity. |

### Agents

| Tool | Description |
| --- | --- |
| `list_agents` | List phone agents. |
| `get_agent` | Get one phone agent. |
| `create_agent` | Create a phone agent with voice instructions. |
| `update_agent` | Update a phone agent. |
| `list_voices` | List available voices. |

### Phone Numbers

| Tool | Description |
| --- | --- |
| `list_numbers` | List owned phone numbers. |
| `buy_number` | Buy a new phone number. |
| `attach_number` | Attach a number to an agent. |

### SMS

| Tool | Description |
| --- | --- |
| `send_message` | Send an SMS message. |
| `list_conversations` | List SMS conversations. |
| `get_conversation` | Get one conversation and its messages. |

### Voice Calls

| Tool | Description |
| --- | --- |
| `make_call` | Place an outbound voice call. |
| `list_calls` | List voice calls. |
| `get_call` | Get call details and transcript. |

### Webhooks

| Tool | Description |
| --- | --- |
| `get_webhook` | Get account or agent webhook configuration. |
| `set_webhook` | Set account or agent webhook configuration. |

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `CLAWDCALL_API_KEY` | Yes | | ClawdCall API key. |
| `CLAWDCALL_BASE_URL` | No | `https://api.clawdcall.com` | API base URL. |

## Development

```bash
git clone https://github.com/ClawdCall/clawdcall-mcp.git
cd clawdcall-mcp
npm install
npm run dev
```

Build:

```bash
npm run build
```

Run the built server:

```bash
CLAWDCALL_API_KEY=sk_live_your_key_here npm start
```

## Notes For API Implementers

This first server version expects conventional REST routes under `/v1`:

- `GET /v1/usage`
- `GET /v1/agents`
- `POST /v1/agents`
- `GET /v1/agents/:agent_id`
- `PATCH /v1/agents/:agent_id`
- `GET /v1/agents/voices`
- `GET /v1/numbers`
- `POST /v1/numbers`
- `POST /v1/agents/:agent_id/numbers`
- `POST /v1/messages`
- `GET /v1/conversations`
- `GET /v1/conversations/:conversation_id`
- `GET /v1/agents/:agent_id/conversations`
- `POST /v1/calls`
- `GET /v1/calls`
- `GET /v1/calls/:call_id`
- `GET /v1/agents/:agent_id/calls`
- `GET /v1/webhooks`
- `POST /v1/webhooks`
- `GET /v1/agents/:agent_id/webhook`
- `POST /v1/agents/:agent_id/webhook`

If the production ClawdCall API uses different field names or routes, keep the MCP tool names stable and adapt only the REST client mapping.

## License

MIT
