import { isMain, requireEnv } from "../shared/clawdcall.mjs";
import { signBody } from "./server.mjs";

export async function main(env = process.env) {
  const secret = requireEnv("WEBHOOK_SECRET", env);
  const url = env.WEBHOOK_URL || "http://127.0.0.1:3000/webhook";
  const body = JSON.stringify({
    event: env.TEST_EVENT || "build.completed",
    message: env.TEST_MESSAGE || "The example build completed successfully.",
  });
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-ClawdCall-Signature": signBody(body, secret),
    },
    body,
  });
  console.log(response.status, await response.text());
}

if (isMain(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
