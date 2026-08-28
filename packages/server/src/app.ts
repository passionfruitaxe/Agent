import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors.middleware";
import { errorHandler } from "./middleware/error.middleware";
import { apiRouter } from "./routes";

/** 应用组合根：注册跨域、错误边界与业务路由。 */
export function createApp() {
  const app = new Hono();

  app.use("*", corsMiddleware);
  app.onError(errorHandler);
  app.get("/", context => context.json({ message: "AI Agent Server" }));
  app.get("/health", context => context.json({ status: "ok" }));
  app.route("/api", apiRouter);

  return app;
}
