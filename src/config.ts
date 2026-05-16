export interface Config {
  apiKey: string;
  baseUrl: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const apiKey = env.CLAWDCALL_API_KEY;

  if (!apiKey) {
    throw new Error("CLAWDCALL_API_KEY is required");
  }

  return {
    apiKey,
    baseUrl: env.CLAWDCALL_BASE_URL ?? "https://api.clawdcall.com",
  };
}
