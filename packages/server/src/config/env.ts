import { z } from "zod";

const environmentSchema = z.object({
  DEEPSEEK_API_KEY: z.string().min(1, "DEEPSEEK_API_KEY 未配置").optional(),
  DEEPSEEK_BASE_URL: z.url().optional(),
});

/** 进程环境变量的唯一读取入口，避免业务代码直接散落访问 process.env。 */
export const env = environmentSchema.parse(process.env);
