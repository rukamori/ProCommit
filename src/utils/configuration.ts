import { z } from "zod";
import * as vscode from "vscode";

import { DeepKey } from "./types";

const configurationSchema = z.object({
  apiKey: z.string().optional(),
  endpoint: z.string().optional(),
  model: z.string().default("gpt-4o-mini").catch("gpt-4o-mini").optional(),
  temperature: z.number().default(0.2).catch(0.2).optional(),
  maxTokens: z.number().default(196).catch(196).optional(),
  general: z.object({
    generator: z
      .enum(["ChatGPT", "Gemini", "Ollama", "LMStudio", "Smithery", "AutoCommit", "Custom"])
      .default("ChatGPT")
      .catch("ChatGPT")
      .optional(),
    messageApproveMethod: z
      .enum(["Quick pick", "Message file"])
      .default("Quick pick")
      .catch("Quick pick")
      .optional(),
    language: z
      .enum(["English", "Japanese", "Russian", "Korean", "German"])
      .default("English")
      .catch("English")
      .optional(),
    useMultipleResults: z.boolean().default(false).catch(false).optional(),
    showEmoji: z.boolean().default(false).catch(false).optional(),
    includeFileExtension: z.boolean().default(true).catch(true).optional(),
  }),
});

export type Configuration = z.infer<typeof configurationSchema>;

function readConfigurationSnapshot(): unknown {
  const configuration = vscode.workspace.getConfiguration("procommit");
  return {
    apiKey: configuration.get("apiKey"),
    endpoint: configuration.get("endpoint"),
    model: configuration.get("model"),
    temperature: configuration.get("temperature"),
    maxTokens: configuration.get("maxTokens"),
    general: {
      generator: configuration.get("general.generator"),
      messageApproveMethod: configuration.get("general.messageApproveMethod"),
      language: configuration.get("general.language"),
      useMultipleResults: configuration.get("general.useMultipleResults"),
      showEmoji: configuration.get("general.showEmoji"),
      includeFileExtension: configuration.get("general.includeFileExtension"),
    },
  };
}

export async function setConfigurationValue(
  key: DeepKey<Configuration>,
  value: any
) {
  const configuration = vscode.workspace.getConfiguration("procommit");
  await configuration.update(key, value, vscode.ConfigurationTarget.Global);
}

export function getConfiguration() {
  return configurationSchema.parse(readConfigurationSnapshot());
}
