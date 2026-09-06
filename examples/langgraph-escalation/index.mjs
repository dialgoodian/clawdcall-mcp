import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { z } from "zod";
import { confirmCall } from "../shared/approval.mjs";
import { isMain, placeClawdCall, requireEnv, validateTarget } from "../shared/clawdcall.mjs";

export function createSingleCallTool({ apiKey, target, task, baseUrl }) {
  let used = false;
  return tool(
    async () => {
      if (used) throw new Error("This example permits only one call per process");
      used = true;
      return placeClawdCall({ apiKey, target, tasks: task, baseUrl });
    },
    {
      name: "place_preapproved_clawdcall",
      description: "Place the one internal phone escalation already approved by the operator.",
      schema: z.object({}),
    },
  );
}

export async function main(env = process.env) {
  const apiKey = requireEnv("CLAWDCALL_API_KEY", env);
  const target = validateTarget(requireEnv("EXPECTED_TARGET", env));
  const task = requireEnv("CALL_TASK", env);
  const model = requireEnv("LANGCHAIN_MODEL", env);
  const approved = await confirmCall({ target, task });
  if (!approved) {
    console.log("Call cancelled.");
    return;
  }

  const agent = createAgent({
    model,
    tools: [createSingleCallTool({ apiKey, target, task, baseUrl: env.CLAWDCALL_BASE_URL })],
    systemPrompt:
      "Use place_preapproved_clawdcall exactly once for the approved internal escalation. Never request or infer another recipient.",
  });
  const result = await agent.invoke({
    messages: [{ role: "user", content: "Place the approved ClawdCall escalation and report its identifier." }],
  });
  console.log(result.messages.at(-1)?.content);
}

if (isMain(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
