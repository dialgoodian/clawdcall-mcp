# LangGraph-Backed Escalation

LangChain's current `createAgent` API runs on LangGraph. This example gives that graph one bounded ClawdCall tool for an expected internal recipient.

The recipient and task are fixed before the graph runs. Terminal confirmation is required, and the tool can execute only once per process.

## Run

```bash
cd examples
cp .env.example .env
npm install
npm run langgraph
```

Set `CLAWDCALL_API_KEY`, `EXPECTED_TARGET`, `CALL_TASK`, `OPENAI_API_KEY`, and `LANGCHAIN_MODEL` in `.env`.

[Start the ClawdCall agent setup](https://clawdcall.com/agents/?utm_source=github&utm_medium=repository&utm_campaign=agent_example_swarm&utm_content=langgraph_escalation)

The example follows the current [LangChain agent API](https://docs.langchain.com/oss/javascript/langchain/agents), which uses LangGraph as its execution runtime.
