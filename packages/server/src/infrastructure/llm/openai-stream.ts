import type {
  TOpenAIChatCompletionChunk,
  TOpenAIChatCompletionChunkChoice,
} from "./types/openai.types";

type TCompletionChunkFactory = {
  createTextChunk: (content: string) => TOpenAIChatCompletionChunk;
  createFinalChunk: () => TOpenAIChatCompletionChunk;
};

/** 将服务层文本增量映射为 OpenAI Chat Completions 协议 chunk。 */
export function createCompletionChunkFactory(
  model: string,
): TCompletionChunkFactory {
  const common: Omit<TOpenAIChatCompletionChunk, "choices"> = {
    id: `chatcmpl_${crypto.randomUUID()}`,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
  };
  let hasSentRole = false;

  const createChunk = (
    choice: TOpenAIChatCompletionChunkChoice,
  ): TOpenAIChatCompletionChunk => ({ ...common, choices: [choice] });

  return {
    createTextChunk: content => {
      const role = hasSentRole ? undefined : "assistant";
      hasSentRole = true;
      return createChunk({
        index: 0,
        delta: { role, content },
        finish_reason: null,
      });
    },
    createFinalChunk: () =>
      createChunk({ index: 0, delta: {}, finish_reason: "stop" }),
  };
}
