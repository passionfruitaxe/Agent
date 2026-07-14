import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.json({ message: "AI Agent Server" }));

export default {
  port: 3000,
  fetch: app.fetch,
};
