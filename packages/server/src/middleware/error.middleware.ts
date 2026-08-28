import type { ErrorHandler } from "hono";
import { ZodError } from "zod";
import { AppError } from "../domain/errors";

/** 将领域错误与参数校验错误统一转换成安全的 JSON HTTP 响应。 */
export const errorHandler: ErrorHandler = (error, context) => {
  if (error instanceof ZodError) {
    return context.json(
      { error: "请求参数无效", details: error.flatten() },
      400,
    );
  }
  if (error instanceof AppError) {
    return context.json({ error: error.message }, error.statusCode);
  }

  console.error(error);
  return context.json({ error: "服务器内部错误" }, 500);
};
