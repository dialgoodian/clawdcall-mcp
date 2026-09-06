import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { maskTarget } from "./clawdcall.mjs";

export async function confirmCall({ target, task, prompt = "Type CALL to approve this one call: " }) {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    console.log(`Expected recipient: ${maskTarget(target)}`);
    console.log(`Task: ${task}`);
    const answer = await rl.question(prompt);
    return answer.trim() === "CALL";
  } finally {
    rl.close();
  }
}
