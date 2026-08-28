# @ai-agent/server

基于 Bun 和 Hono 的 AI Agent 服务端。服务端采用分层架构：HTTP 请求从路由进入 Controller，由 Service 执行业务用例，再通过 Infrastructure 调用模型或其他外部系统。这样的边界让协议、业务和第三方实现能够独立演进与测试。

## 启动与调试

```bash
# 在项目根目录执行
bun run dev:server
bun run debug:server
```

服务默认监听 `http://localhost:3000`：

- `GET /`：服务说明。
- `GET /health`：健康检查。
- `POST /api/chat`：AI SDK UI Message Stream。
- `POST /api/chat/raw`：OpenAI Chat Completions 兼容 SSE 流。

## 请求流转

```text
HTTP Request
  → routes
  → controllers
  → services
  → domain + infrastructure
  → HTTP / SSE Response
```

- `routes` 只声明 URL、HTTP 方法和 Controller 绑定。
- `controllers` 负责 HTTP/SSE 协议：解析请求、调用 Schema、设置响应格式。
- `services` 实现可复用的业务用例，不依赖 Hono `Context`。
- `domain` 定义稳定业务类型，避免模型 SDK、Hono 等技术细节污染核心概念。
- `infrastructure` 封装 AI Provider 等外部系统的具体实现。

## 目录结构

```text
src/
├── index.ts
├── app.ts
├── config/
├── routes/
├── controllers/
├── services/
├── schemas/
├── domain/
├── infrastructure/
├── middleware/
├── lib/
├── agent/
├── rag/
└── vector-store/
```

### `index.ts`

Bun 服务进程入口。只创建应用并导出 `port`、`fetch`，不放路由或业务逻辑。

### `app.ts`

应用组合根。负责挂载 CORS、统一错误处理、健康检查和 `/api` 路由。新增全局中间件应优先放在这里注册。

### `config/`

配置与常量层。

- `env.ts`：唯一的环境变量读取入口，通过 Zod 约束环境变量形状。
- `constants.ts`：模型名等业务常量，避免在 Controller、Service 中散落字符串字面量。

### `routes/`

传输层路由声明。每个 `*.route.ts` 文件仅组合路径与 HTTP method，并把请求委托给对应 Controller；不应包含模型调用、参数解析或 SSE 拼装逻辑。

- `index.ts`：`/api` 路由聚合入口。
- `chat.route.ts`：聊天相关 URL 与 `chatController` 的绑定。

### `controllers/`

HTTP Controller 层。负责把请求转为 Service 调用，并把 Service 的结果编码为 HTTP JSON、AI SDK Stream 或 SSE。Controller 可以依赖 Hono，但 Service 不可以。

- `chat.controller.ts`：处理 `/api/chat` 和 `/api/chat/raw`；后者负责最终写出 OpenAI 协议的 SSE chunk。

### `services/`

应用服务层（用例层）。编排模型调用、RAG、Agent 等能力，返回业务结果或 `AsyncIterable`，不处理 URL、状态码或 Hono Context。

- `chat.service.ts`：提供 SDK 聊天流和原始文本流两个用例。

### `schemas/`

所有外部输入的运行时校验边界，使用 Zod。Controller 在调用 Service 前必须先解析 Schema；这可以将不可信的 HTTP 输入拦在业务层外。

- `chat.schema.ts`：聊天接口请求体 Schema。

### `domain/`

稳定的业务类型与规则。这里不依赖 Hono、AI SDK 或具体数据库客户端。后续会承载对话、知识库、Agent 任务等核心领域模型。

- `domain/chat/chat.types.ts`：聊天服务输出的文本流等领域契约。

### `infrastructure/`

第三方技术适配层。模型供应商、数据库、文件系统、消息队列等可替换实现应放在这里，上层通过其暴露的能力工作。

- `infrastructure/llm/providers.ts`：DeepSeek 原生和 OpenAI 兼容 Provider 的初始化。
- `infrastructure/llm/openai.types.ts`：OpenAI Chat Completions 流协议类型定义。
- `infrastructure/llm/openai-stream.ts`：将服务层文本增量转换成 OpenAI Chat Completions SSE chunk；它是协议适配器，不属于聊天业务规则。

### `middleware/`

横切关注点。

- `cors.middleware.ts`：集中封装 CORS，并隔离 Hono/Bun 当前的类型兼容断言。
- `error.middleware.ts`：将 Zod 校验错误、业务错误和未知错误规范化为 JSON HTTP 响应。

### `lib/`

轻量通用基础能力，不承载业务用例。

- `errors.ts`：`AppError` 等通用应用错误。

Provider 实例和 OpenAI 流协议类型均位于 `infrastructure/llm/`，避免供应商协议细节泄漏到通用基础库。

### `agent/`、`rag/`、`vector-store/`

为后续能力预留的模块边界：

- `agent/`：ReAct 循环、任务编排和 `tools/` 工具定义。
- `rag/`：文档切片、检索、重排和上下文构造。
- `vector-store/`：LanceDB 等向量存储的实现与适配器。

## 依赖规则

```text
routes → controllers → services → domain
                         ↓
                   infrastructure

controllers → schemas / middleware / lib
infrastructure → config / lib
```

禁止：

- Controller 直接创建模型 Provider。
- Service 依赖 Hono `Context`、HTTP 状态码或 SSE writer。
- Domain 依赖 Hono、AI SDK 或具体数据库客户端。
- Route 中堆放参数校验、模型调用或业务编排。

## OpenAI SSE 约定

`POST /api/chat/raw` 遵循 Chat Completions 流式协议：每个 SSE `data:` 是一个 `chat.completion.chunk` JSON；同一次 completion 共享 `id`、`created`、`model`；单候选聊天的 `choices[0].index` 固定为 `0`。结束时发送 `finish_reason: "stop"` 的 JSON chunk。
