import { Hono } from "hono";
import { chatController } from "../controllers/chat.controller";

/** 聊天传输协议路由；业务逻辑由 controller/service 承担。 */
export const chatRouter = new Hono()
  .post("/", chatController.streamSdkChat)
  .post("/raw", chatController.streamRawChat);
