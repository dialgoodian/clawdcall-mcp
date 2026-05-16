#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ClawdCallClient } from "./client.js";
import { loadConfig } from "./config.js";
import { registerTools } from "./tools.js";

async function main(): Promise<void> {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printHelp();
    return;
  }

  const config = loadConfig();
  const client = new ClawdCallClient(config);

  const server = new McpServer({
    name: "clawdcall",
    version: "0.1.0",
  });

  registerTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function printHelp(): void {
  process.stdout.write(`clawdcall-mcp

Run a ClawdCall MCP server over stdio.

Environment:
  CLAWDCALL_API_KEY    API key required for call and transcript tools.
  CLAWDCALL_BASE_URL   Optional API base URL. Defaults to https://api.clawdcall.com.

Usage:
  CLAWDCALL_API_KEY=sk_live_xxx npx clawdcall-mcp
`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
