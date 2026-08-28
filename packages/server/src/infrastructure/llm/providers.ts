import { createDeepSeek } from "@ai-sdk/deepseek";
import { createOpenAI } from "@ai-sdk/openai";
import { env } from "../../config/env";

/** DeepSeek 原生 Provider，供 AI SDK UI Message Stream 使用。 */
export const deepSeekProvider = createDeepSeek({ apiKey: env.DEEPSEEK_API_KEY });

/** OpenAI 兼容 Provider，供 /chat-raw 输出 OpenAI Chat Completions 协议。 */
export const openAICompatibleProvider = createOpenAI({
  baseURL: env.DEEPSEEK_BASE_URL,
  apiKey: env.DEEPSEEK_API_KEY,
});
