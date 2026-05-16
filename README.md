# ClawdCall MCP Server

Give AI agents access to ClawdCall's agent-facing phone execution API through the Model Context Protocol.

`clawdcall-mcp` exposes the confirmed ClawdCall workflow:

- send signup OTP
- verify signup OTP
- place outbound calls
- fetch call transcripts

The API base URL defaults to `https://api.clawdcall.com`.

## Quick Start

### 1. Add ClawdCall to your MCP client

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

`CLAWDCALL_API_KEY` is required for outbound calls and transcript retrieval. Signup OTP tools do not require an existing key.

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

- "Sign me up for ClawdCall and send a verification code."
- "Verify this ClawdCall OTP and tell me what credential I need to store securely."
- "Call this restaurant and ask if they have a table for two tonight."
- "Fetch the transcript for this ClawdCall call ID."

## Tools

| Tool | Confirmed endpoint | Description |
| --- | --- | --- |
| `send_signup_otp` | `POST /cc/signup/send-otp` | Send a phone verification OTP for signup. |
| `verify_signup_otp` | `POST /cc/signup/verify-otp` | Verify the OTP and receive account/API-key details. |
| `place_outbound_call` | `POST /external/v1/agent/outbound?conversionFlag=1` | Place an outbound voice-agent call. |
| `get_call_transcript` | `GET /cc/v1/calls/{id}/transcript` | Fetch a transcript by call ID or campaign ID. |

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `CLAWDCALL_API_KEY` | For call/transcript tools | | ClawdCall API key. |
| `CLAWDCALL_BASE_URL` | No | `https://api.clawdcall.com` | API base URL. |

## Development

```bash
git clone https://github.com/dialgoodian/clawdcall-mcp.git
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

## API Contract

This server tracks the ClawdCall agent-facing OpenAPI contract currently published by the ClawdCall UI repo:

- `POST /cc/signup/send-otp`
- `POST /cc/signup/verify-otp`
- `POST /external/v1/agent/outbound?conversionFlag=1`
- `GET /cc/v1/calls/{id}/transcript`

Do not add MCP tools for agents, number purchase, SMS, conversations, voices, or general webhooks until those routes exist in ClawdCall's API contract.

## License

MIT
