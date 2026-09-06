# OpenAI Agents SDK Self-Call

This example exposes one preapproved ClawdCall action to an OpenAI agent. The operator controls the recipient and task through `.env`; the tool accepts no model-generated phone number or instructions.

The Agents SDK pauses before the side effect and asks for terminal approval.

## Run

```bash
cd examples
cp .env.example .env
npm install
npm run openai
```

Set `CLAWDCALL_API_KEY`, `EXPECTED_TARGET`, `CALL_TASK`, `OPENAI_API_KEY`, and `OPENAI_MODEL` in `.env`. Type `CALL` only after reviewing the masked recipient and exact task.

[Start the ClawdCall agent setup](https://clawdcall.com/agents/?utm_source=github&utm_medium=repository&utm_campaign=agent_example_swarm&utm_content=openai_agents_sdk)

The approval flow follows the official [OpenAI Agents SDK human-in-the-loop pattern](https://openai.github.io/openai-agents-js/guides/human-in-the-loop/).
