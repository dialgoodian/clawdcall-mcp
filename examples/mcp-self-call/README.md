# MCP Self-Call

Use ClawdCall from an OAuth-capable remote MCP client without writing integration code.

## Connect

Choose either route:

1. Open [ClawdCall on Smithery](https://smithery.ai/servers/dialgoodian/clawdcall) and connect it to your MCP client.
2. Add `https://gateway.clawdcall.com/mcp/` as a remote MCP server and complete the OAuth prompt.

[Open the ClawdCall agent setup](https://clawdcall.com/agents/?utm_source=github&utm_medium=repository&utm_campaign=agent_example_swarm&utm_content=mcp_self_call)

## Copy-Paste Prompt

```text
Help me make one bounded ClawdCall test call to myself.

First, show my approved outbound contacts. If I do not already have a self-call alias, ask me for my number and repeat it back for confirmation before saving it. Never choose or infer a recipient.

Before placing the call, show me the exact contact alias and this task: "Say this is a ClawdCall test, ask me to confirm I heard it, then end the call." Wait for my explicit approval.

Place exactly one call. When it finishes, fetch the transcript and summarize whether I confirmed hearing the message. Do not call any other recipient and do not retry without asking me.
```

## Expected Tool Path

1. `cc_outbound_contacts_get`
2. `cc_outbound_contact_save` only when the confirmed alias is missing
3. `cc_outbound_create`
4. `cc_call_transcript_get`

The client may display different confirmation UI, but the recipient and task should remain visible before the call.
