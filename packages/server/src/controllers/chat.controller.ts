import { chatService } from '../services/chat.service';
import { createCompletionChunkFactory } from '../infrastructure/llm/openai-stream';
import { DEFAULT_CHAT_MODEL } from '../config/constants';
import { rawChatRequestSchema, sdkChatRequestSchema } from '../schemas/chat.schema';
import { streamSSE } from 'hono/streaming';
import { createUIMessageStreamResponse, toUIMessageStream, type UIMessage } from "ai";
import type { Context } from "hono";

export const chatController = {
  async streamSdkChat(context: Context) {
    const payload = sdkChatRequestSchema.parse(await context.req.json());
    const stream = await chatService.streamSdkChat(payload.messages as UIMessage[]);

    return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream }) });
  },

  async streamRawChat(context: Context) {
    const { messages } = rawChatRequestSchema.parse(await context.req.json());
    const textStream = chatService.streamRawChat(messages);
    const completion = createCompletionChunkFactory(DEFAULT_CHAT_MODEL);

    return streamSSE(context, async stream => {
      for await (const text of textStream) {
        if (stream.aborted) return;
        await stream.writeSSE({
          data: JSON.stringify(completion.createTextChunk(text)),
        });
      }

      if (stream.aborted) return;
      await stream.writeSSE({ data: JSON.stringify(completion.createFinalChunk()) });
    });
  },
};
