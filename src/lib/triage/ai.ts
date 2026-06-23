import OpenAI from "openai";
import { TRIAGE_SYSTEM_PROMPT, buildTriageUserMessage } from "./prompt";
import type { StudentRequest } from "@/types/triage";

// Client singleton

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      throw new AiCallError(
        "AI_API_KEY environment variable is not set",
        "config_error"
      );
    }
    _client = new OpenAI({
      baseURL:
        process.env.AI_BASE_URL,
      apiKey,
    });
  }
  return _client;
}

const MODEL = () => process.env.AI_MODEL ?? "gpt-4o-mini";

// Error class 

export class AiCallError extends Error {
  constructor(
    message: string,
    public readonly kind:
      | "network"
      | "timeout"
      | "api_error"
      | "empty_response"
      | "config_error"
  ) {
    super(message);
    this.name = "AiCallError";
  }
}

// Main call

export async function callAI(request: StudentRequest): Promise<string> {
  const client = getClient();

  let response: OpenAI.Chat.ChatCompletion;

  try {
    response = await client.chat.completions.create({
      model: MODEL(),
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: TRIAGE_SYSTEM_PROMPT },
        { role: "user", content: buildTriageUserMessage(request) },
      ],
    });
  } catch (err) {
    if (err instanceof OpenAI.APIConnectionTimeoutError) {
      throw new AiCallError("AI call timed out", "timeout");
    }
    if (err instanceof OpenAI.APIConnectionError) {
      throw new AiCallError(`AI connection error: ${err.message}`, "network");
    }
    if (err instanceof OpenAI.APIError) {
      throw new AiCallError(
        `AI API error ${err.status}: ${err.message}`,
        "api_error"
      );
    }
    throw new AiCallError(
      `Unexpected AI call error: ${String(err)}`,
      "network"
    );
  }

  const content = response.choices[0]?.message?.content;

  if (!content || content.trim() === "") {
    throw new AiCallError(
      "AI returned an empty response",
      "empty_response"
    );
  }

  return content;
}
