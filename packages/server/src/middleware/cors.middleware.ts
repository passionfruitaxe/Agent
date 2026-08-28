import type { MiddlewareHandler } from "hono";
import { cors } from "hono/cors";

/** 集中隔离当前 Hono/Bun 类型兼容断言，业务路由无需感知该细节。 */
export const corsMiddleware = cors() as unknown as MiddlewareHandler;
