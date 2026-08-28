import type { TChatMessage } from "../types/chat";
import type { TOpenAIChatCompletionChunk } from "../types/open-ai";


export function parseOpenAIStreamData(
  data: string,
): TOpenAIChatCompletionChunk | null {
  return JSON.parse(data) as TOpenAIChatCompletionChunk;
}

/** 将一个传输 chunk 的所有候选增量合并进页面消息。 */
export function mergeCompletionChunk(
  messages: TChatMessage[],
  chunk: TOpenAIChatCompletionChunk,
): TChatMessage[] {
  return chunk.choices.reduce<TChatMessage[]>((nextMessages, choice) => {
    const id = `${chunk.id}:${choice.index}`;
    const existingIndex = nextMessages.findIndex(message => message.id === id);
    const content = choice.delta.content ?? "";
    const status = choice.finish_reason === null ? "streaming" : "complete";

    if (existingIndex === -1) {
      return [
        ...nextMessages,
        {
          id,
          role: "assistant",
          content,
          status,
        },
      ];
    }

    return nextMessages.map((message, index) =>
      index === existingIndex
        ? {
          ...message,
          content: message.content + content,
          status: message.status === "complete" ? "complete" : status,
        }
        : message,
    );
  }, messages);
}
