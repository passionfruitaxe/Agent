import { Hono } from "hono";
import { chatRouter } from "./chat.route";

/** /api 下所有业务路由的聚合入口。 */
export const apiRouter = new Hono().route("/chat", chatRouter);
