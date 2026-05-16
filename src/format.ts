import type { JsonValue } from "./client.js";

export function jsonResponse(value: JsonValue) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}
