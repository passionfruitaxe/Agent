import { cors } from 'hono/cors';
import { Hono, type MiddlewareHandler } from 'hono';
import { apiApp } from './routes';

const app = new Hono();

app.use('*', cors() as unknown as MiddlewareHandler);

app.get("/", (c) => c.json({ message: "AI Agent Server" }));

app.route("/api", apiApp);

export default {
  port: 3000,
  fetch: app.fetch,
};
