import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { confirmCall } from "../shared/approval.mjs";
import { isMain, placeClawdCall, requireEnv, validateTarget } from "../shared/clawdcall.mjs";

export function createSingleCallTool({ apiKey, target, task, baseUrl }) {
  let used = false;
  return tool({
    name: "place_preapproved_clawdcall",
    description: "Place the single ClawdCall phone call whose recipient and task were approved by the operator.",
    parameters: z.object({}),
    needsApproval: true,
    async execute() {
      if (used) throw new Error("This example permits only one call per process");
      used = true;
      return placeClawdCall({ apiKey, target, tasks: task, baseUrl });
    },
  });
}

export async function main(env = process.env) {
  const apiKey = requireEnv("CLAWDCALL_API_KEY", env);
  const target = validateTarget(requireEnv("EXPECTED_TARGET", env));
  const task = requireEnv("CALL_TASK", env);
  const model = requireEnv("OPENAI_MODEL", env);
  const callTool = createSingleCallTool({
    apiKey,
    target,
    task,
    baseUrl: env.CLAWDCALL_BASE_URL,
  });
  const agent = new Agent({
    name: "ClawdCall self-call agent",
    model,
    instructions:
      "Use place_preapproved_clawdcall exactly once, then report the returned call or campaign identifier. Never invent or request another recipient.",
    tools: [callTool],
  });

  let result = await run(agent, "Place the one preapproved ClawdCall test call now.");
  while (result.interruptions?.length) {
    let rejected = false;
    for (const interruption of result.interruptions) {
      const approved = await confirmCall({ target, task });
      if (approved) result.state.approve(interruption);
      else {
        result.state.reject(interruption);
        rejected = true;
      }
    }
    if (rejected) {
      console.log("Call cancelled.");
      return;
    }
    result = await run(agent, result.state);
  }

  console.log(result.finalOutput);
}

if (isMain(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
