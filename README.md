# ClawdCall MCP Server

<!-- mcp-name: io.github.dialgoodian/clawdcall-mcp -->

Give AI agents access to ClawdCall's agent-facing phone execution API through the Model Context Protocol.

`clawdcall-mcp` exposes the confirmed ClawdCall workflow:

- send signup OTP
- verify signup OTP
- place expected outbound calls
- fetch call transcripts

## Hosted Remote

Connect compatible remote MCP clients to the Streamable HTTP endpoint:

```text
https://gateway.clawdcall.com/mcp/
```

The endpoint advertises OAuth protected-resource metadata. Existing ClawdCall integrations may also use an API key according to the [agent documentation](https://clawdcall.com/skill.md).

## Local Stdio Package

Add the published npm package to a local MCP client:

```json
{
  "mcpServers": {
    "clawdcall": {
      "command": "npx",
      "args": ["-y", "clawdcall-mcp"],
      "env": {
        "CLAWDCALL_API_KEY": "your_clawdcall_api_key"
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
        "CLAWDCALL_API_KEY": "your_clawdcall_api_key",
        "CLAWDCALL_BASE_URL": "https://api.clawdcall.com"
      }
    }
  }
}
```

## Safe First Test

1. Open the [ClawdCall agent setup](https://clawdcall.com/agents/?utm_source=github&utm_medium=repository&utm_campaign=mcp_listing_blitz&utm_content=readme).
2. Connect the hosted endpoint or local package from a compatible agent client.
3. Ask the agent to call you or an expected internal recipient with a bounded task.
4. Confirm the destination and task before allowing the call.
5. Review the returned status, transcript evidence, summary, or structured outcome.

ClawdCall is not intended for cold calling, robocalling, bulk outreach, emergency use, political outreach, or sensitive advice workflows.

## Copy-Paste Examples

The [`examples`](examples) directory contains bounded first-call workflows for:

- [MCP self-call](examples/mcp-self-call)
- [OpenAI Agents SDK](examples/openai-agents-sdk)
- [LangGraph-backed agents](examples/langgraph-escalation)
- [Signed webhook-to-call alerts](examples/webhook-to-call)

The code examples keep the recipient in operator-controlled environment variables. Agent-generated input cannot change the phone number, and live side effects require an explicit approval or opt-in.

## Tools

| Tool | Confirmed endpoint | Description |
| --- | --- | --- |
| `send_signup_otp` | `POST /cc/signup/send-otp` | Send a phone verification OTP for signup. |
| `verify_signup_otp` | `POST /cc/signup/verify-otp` | Verify the OTP and receive account/API-key details. |
| `place_outbound_call` | `POST /external/v1/agent/outbound?conversionFlag=1` | Place an expected outbound voice-agent call. |
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
CLAWDCALL_API_KEY=your_clawdcall_api_key npm start
```

## Discovery Metadata

- [`server.json`](server.json) contains the Official MCP Registry metadata.
- [Server card](https://www.clawdcall.com/.well-known/mcp/server-card.json)
- [Agent-readable documentation](https://clawdcall.com/skill.md)
- [OpenAPI description](https://clawdcall.com/.well-known/openapi.json)

## API Contract

This server tracks these ClawdCall agent-facing endpoints:

- `POST /cc/signup/send-otp`
- `POST /cc/signup/verify-otp`
- `POST /external/v1/agent/outbound?conversionFlag=1`
- `GET /cc/v1/calls/{id}/transcript`

Do not add MCP tools for agents, number purchase, SMS, conversations, voices, or general webhooks until those routes exist in ClawdCall's API contract.

## License

MIT
