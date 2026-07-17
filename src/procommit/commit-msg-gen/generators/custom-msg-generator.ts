
import fetch from "node-fetch";
import { MsgGenerator, createDiffAwareUserPrompt, postProcessCommitMessage } from "./msg-generator";
import { getConfiguration } from "@utils/configuration";
import {
  englishInstructions,
  russianInstructions,
  japanInstructions,
  koreanInstructions,
  germanInstructions
} from "@utils/langInstruction";

interface CustomConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class CustomMsgGenerator implements MsgGenerator {
  apiKey: string;
  endpoint: string;
  model: string;
  temperature?: number;
  maxTokens?: number;

  constructor(config: CustomConfig) {
    this.apiKey = config.apiKey?.trim() || "";
    this.endpoint = config.endpoint?.trim() || "";
    this.model = config.model?.trim() || "";
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
  }

  async generate(diff: string): Promise<string> {
    if (!this.endpoint) {
      throw new Error("Custom endpoint is required.");
    }
    const url = this.endpoint;
    const config = getConfiguration();
    const apiKey = this.apiKey || config.apiKey?.trim() || "";
    const model = this.model || config.model?.trim() || "";
    const temperature = this.temperature ?? config.temperature;
    const maxTokens = this.maxTokens ?? config.maxTokens;
    const language = config.general?.language || "English";
    const includeFileExtension = config.general?.includeFileExtension ?? true;
    const showEmoji = config.general?.showEmoji ?? false;
    let instruction: string;
    switch (language) {
      case "Russian":
        instruction = russianInstructions;
        break;
      case "Japanese":
        instruction = japanInstructions;
        break;
      case "Korean":
        instruction = koreanInstructions;
        break;
      case "German":
        instruction = germanInstructions;
        break;
      case "English":
      default:
        instruction = englishInstructions;
        break;
    }
    const { userPrompt, analysis } = createDiffAwareUserPrompt(diff);
    const headers: Record<string, string> = {
      ["Content-Type"]: "application/json",
    };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const body: Record<string, unknown> = {
      messages: [
        { role: "system", content: instruction },
        { role: "user", content: userPrompt },
      ],
      stream: false,
    };
    if (model) {
      body.model = model;
    }
    if (temperature !== undefined) {
      body.temperature = temperature;
    }
    if (maxTokens !== undefined) {
      body.max_tokens = maxTokens;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await safeReadText(response);
      throw new Error(
        `Custom generator API error: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`
      );
    }

    const data: unknown = await response.json();
    const message = extractMessage(data);
    if (message) {
      return postProcessCommitMessage(message, {
        includeFileExtension,
        showEmoji,
        analysis,
      });
    }
    throw new Error("No commit message returned by custom endpoint.");
  }
}

function extractMessage(data: unknown): string | undefined {
  if (typeof data === "string") {
    return nonEmptyString(data);
  }
  if (!isRecord(data)) {
    return undefined;
  }

  if (Array.isArray(data.choices)) {
    for (const choice of data.choices) {
      if (!isRecord(choice)) {
        continue;
      }
      if (isRecord(choice.message)) {
        const content = nonEmptyString(choice.message.content);
        if (content) {
          return content;
        }
      }
      const text = nonEmptyString(choice.text);
      if (text) {
        return text;
      }
    }
  }

  for (const field of ["commitMessage", "message", "output", "response"] as const) {
    const value = nonEmptyString(data[field]);
    if (value) {
      return value;
    }
  }

  return undefined;
}

function nonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed || undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function safeReadText(response: { text(): Promise<string> }): Promise<string> {
  try {
    return (await response.text()).trim();
  } catch {
    return "";
  }
}
