import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream, UIMessage } from 'ai';
import { Hono } from 'hono';
import { deepSeek } from '../lib/ai';

const apiApp: Hono = new Hono();

apiApp.post("/chat", async (c) => {
  const { messages }: { messages: UIMessage[] } = await c.req.json();
  const { stream } = streamText({
    model: deepSeek('deepseek-v4-flash'),
    instructions: 'You are a helpful assistant.',
    messages: await convertToModelMessages(messages),
  });
  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream })
  })
});

export { apiApp }