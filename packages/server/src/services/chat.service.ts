import { streamText, type UIMessage, convertToModelMessages } from "ai";
import { DEFAULT_CHAT_MODEL } from "../config/constants";
import type { TTextStream } from "../domain/chat/chat.types";
import {
  deepSeekProvider,
  openAICompatibleProvider,
} from "../infrastructure/llm/providers";

export const chatService = {
  async streamSdkChat(messages: UIMessage[]) {
    const { stream } = streamText({
      model: deepSeekProvider(DEFAULT_CHAT_MODEL),
      instructions: "You are a helpful assistant.",
      messages: await convertToModelMessages(messages),
    });
    return stream;
  },

  streamRawChat(prompt: string): TTextStream {
    const { textStream } = streamText({
      model: openAICompatibleProvider(DEFAULT_CHAT_MODEL),
      prompt,
    });
    return textStream;
  },
};
