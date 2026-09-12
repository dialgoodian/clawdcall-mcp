# Flight-Change Decision Handoff

This example implements the phone step from [Your AI found another flight. Now it needs your decision](https://clawdcall.com/blog/ai-travel-agent-flight-change-phone-call/?utm_source=github&utm_medium=repository&utm_campaign=flight_change_example&utm_content=example_readme).

It uses synthetic travel data and your own opted-in number. The call can capture one preference: arrive tonight with a connection, arrive tomorrow direct, or hold. It cannot book, cancel, pay for, or hold a flight.

ClawdCall is the phone action in this example, not an airline integration or a prebuilt travel agent.

## Option 1: Remote MCP Prompt

Connect `https://gateway.clawdcall.com/mcp/` to an OAuth-capable MCP client, then paste:

```text
Help me run one supervised synthetic flight-change decision call to myself.

Use only the number I explicitly approve for this test. Before calling, show me the masked destination and the full call task, then wait for my confirmation.

The synthetic scenario is: my flight was cancelled. Option one arrives tonight with one connection. Option two arrives tomorrow on a direct flight. Ask me to answer tonight, tomorrow, or hold. State that my answer is a preference only and does not book, cancel, pay for, or hold a flight.

If my answer is unclear or I do not answer, leave the decision unresolved. Do not retry. Do not request payment details, passwords, passport data, or one-time codes. Place exactly one call, fetch its transcript when available, and report the captured preference without taking any travel action.
```

## Option 2: Runnable Node Example

```bash
cd examples
cp .env.example .env
npm install
npm run flight -- --dry-run
npm run flight
```

Set `EXPECTED_TARGET` to your own opted-in E.164 number. The dry run does not require `CLAWDCALL_API_KEY`; the live supervised run does. Type `CALL` only after reviewing the masked destination and exact task. Calls may consume minutes.

The checked-in [`synthetic-event.json`](synthetic-event.json) mirrors the downloadable fixture on the [flight-change workflow page](https://clawdcall.com/workflows/travel/flight-change-decision-handoff/?utm_source=github&utm_medium=repository&utm_campaign=flight_change_example&utm_content=workflow_link).

## Decision Rules

The runner places no call unless all of these are true:

- the event is explicitly synthetic;
- disruption status and alternatives are current;
- the traveller opted into calls and matches the trip;
- an unresolved decision expires within 30 minutes;
- the durable decision ID has not been processed;
- the event grants no transaction authority.

Set `PROCESSED_DECISION_IDS` to a comma-separated list when testing replay suppression. A real integration must store decision IDs durably, resolve the target from trusted trip data, authenticate returned results, and refresh availability, price, and terms before any travel action.

Run `npm test` to verify the consent, freshness, replay, ambiguity, and transaction boundaries without placing a call.
