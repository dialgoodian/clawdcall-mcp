# Signed Webhook To Call

Turn one trusted internal webhook into a bounded phone alert. The recipient is fixed in `EXPECTED_TARGET`; webhook input cannot choose a number.

The server starts in dry-run mode. It validates the HMAC signature and returns the exact task without placing a call.

## Run A Dry Test

Terminal 1:

```bash
cd examples
cp .env.example .env
npm install
npm run webhook
```

Terminal 2:

```bash
cd examples
npm run send:webhook
```

Review the dry-run response. Set `ALLOW_LIVE_CALL=1` only when `EXPECTED_TARGET` is your number or an expected internal recipient and paid call usage is acceptable. The sample permits at most one live call per process.

Production deployments should terminate TLS, store `WEBHOOK_SECRET` in a secret manager, add replay protection, and apply rate limiting.

[Start the ClawdCall agent setup](https://clawdcall.com/agents/?utm_source=github&utm_medium=repository&utm_campaign=agent_example_swarm&utm_content=webhook_to_call)
