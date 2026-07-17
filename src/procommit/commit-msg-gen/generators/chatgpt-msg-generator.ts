import { MsgGenerator, createDiffAwareUserPrompt, postProcessCommitMessage } from "./msg-generator";
import fetch from "node-fetch";
import { getConfiguration } from "@utils/configuration";
import {
  englishInstructions,
  russianInstructions,
  japanInstructions,
  koreanInstructions,
  germanInstructions,
  russianAssistantInstruction,
  japanAssistantInstruction,
  koreanAssistantInstruction,
  germanAssistantInstruction,
  englishAssistantInstruction
} from "@utils/langInstruction";

export class ChatgptMsgGenerator implements MsgGenerator {
  async generate(diff: string): Promise<string | string[]> {
    const config = getConfiguration();
    const apiKey = config.apiKey || "";
    const endpoint = (config.endpoint?.trim() || "https://api.openai.com/v1").replace(/\/+$/, "");
    const model = config.model || "gpt-4o-mini";
    const temperature = config.temperature || 0.2;
    const maxTokens = config.maxTokens || 196;
    const n = config.general.useMultipleResults ? 4 : 1;
    const language = config.general.language || "English";

    let instruction: string;
    let assistantMessage: string;
    switch (language) {
      case "Russian":
        instruction = russianInstructions;
        assistantMessage = russianAssistantInstruction;
        break;
      case "Japanese":
        instruction = japanInstructions;
        assistantMessage = japanAssistantInstruction;
        break;
      case "Korean":
        instruction = koreanInstructions;
        assistantMessage = koreanAssistantInstruction;
        break;
      case "German":
        instruction = germanInstructions;
        assistantMessage = germanAssistantInstruction;
        break;
      case "English":
      default:
        instruction = englishInstructions;
        assistantMessage = englishAssistantInstruction; // Assuming English assistant message is same as instruction
        break;
    }

    const includeFileExtension = config.general?.includeFileExtension ?? true;
    const showEmoji = config.general?.showEmoji ?? false;
    const { userPrompt, analysis } = createDiffAwareUserPrompt(diff);
    const messages = [
      { role: "system", content: instruction },
      { role: "user", content: userPrompt },
      { role: "assistant", content: assistantMessage },
    ] as const;

    if (!apiKey || apiKey.trim() === "") {
      throw new Error("API Key is required for ChatGPT generator.");
    }

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        n,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await safeReadText(response);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`);
    }

    const data: any = await response.json();

    if (!data || !data.choices || data.choices.length === 0) {
      throw new Error("No commit messages were generated. Try again.");
    }

    const commitMessages = (data.choices as any[]).map((choice) =>
      postProcessCommitMessage(choice?.message?.content ?? "", {
        includeFileExtension,
        showEmoji,
        analysis,
      })
    );

    const uniqueMessages = [...new Set(commitMessages.map((m) => m.trim()).filter(Boolean))];
    if (config.general.useMultipleResults) {
      return uniqueMessages;
    }
    return uniqueMessages[0] ?? "";
  }
}

async function safeReadText(response: any): Promise<string> {
  try {
    const text = await response.text();
    return typeof text === "string" ? text.trim() : "";
  } catch {
    return "";
  }
}
