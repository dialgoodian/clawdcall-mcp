export interface Config {
  apiKey?: string;
  baseUrl: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    apiKey: env.CLAWDCALL_API_KEY,
    baseUrl: env.CLAWDCALL_BASE_URL ?? "https://api.clawdcall.com",
  };
}
