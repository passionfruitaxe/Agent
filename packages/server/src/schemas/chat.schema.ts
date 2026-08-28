import { z } from "zod";

export const rawChatRequestSchema = z.object({
  messages: z.string().trim().min(1, "messages 必须是非空字符串"),
});

export const sdkChatRequestSchema = z.object({
  messages: z.array(z.unknown()).min(1, "messages 不能为空"),
});

export type TRawChatRequest = z.infer<typeof rawChatRequestSchema>;
