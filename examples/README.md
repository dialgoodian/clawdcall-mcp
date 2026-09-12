# ClawdCall Agent Examples

These examples turn a specific agent event into one bounded ClawdCall action. Start with your own number or an expected internal recipient.

| Example | Best for | Live-call guard |
| --- | --- | --- |
| [MCP self-call](mcp-self-call) | Remote MCP clients and registry users | Client confirmation before contact save and call |
| [OpenAI Agents SDK](openai-agents-sdk) | OpenAI agent applications | SDK human-in-the-loop approval |
| [LangGraph escalation](langgraph-escalation) | LangChain and LangGraph workflows | Terminal approval plus fixed recipient |
| [Webhook to call](webhook-to-call) | Internal automation and alerting | Signed requests and dry-run default |
| [Flight-change decision](flight-change-decision) | Travel-agent decision handoffs | Synthetic event, fixed recipient, terminal approval, no booking |

## Install

```bash
cd examples
cp .env.example .env
npm install
npm test
npm run check
```

Fill only the environment values required by the example you run. The repository ignores `.env` files.

## Shared Safety Rules

- `EXPECTED_TARGET` is controlled by the operator and is never accepted from model output or webhook input.
- Use your own phone number first.
- Agent examples place at most one call per process.
- Webhook delivery remains a dry run unless `ALLOW_LIVE_CALL=1`.
- Do not use these examples for cold calling, bulk outreach, emergencies, political outreach, or sensitive advice.

[Start the ClawdCall agent setup](https://clawdcall.com/agents/?utm_source=github&utm_medium=repository&utm_campaign=agent_example_swarm&utm_content=examples_index)
