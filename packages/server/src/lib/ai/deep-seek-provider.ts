import { createDeepSeek } from "@ai-sdk/deepseek";

export const deepSeek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY });