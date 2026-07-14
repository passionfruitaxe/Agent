# AI 学习路径

## Phase 1：Node.js AI 开发环境搭建（预计 1 周）

### Task 1.1 — 确认 Node.js 环境和工具链

- 确认 Node.js 20+ 已安装（`node -v`），没有的话用 nvm 装
- 全局安装 `tsx`（直接跑 TypeScript，不需要编译）、`pnpm`
- 确认你熟悉的基础设施：ESM 模块、`import` 语法、`fetch` API（Node 20+ 内置）
- 产出：能跑通 `tsx hello.ts`

### Task 1.2 — 搭建一个 AI 开发用的 Node.js 项目骨架

- `pnpm init`，配 `"type": "module"`
- 安装核心依赖：`openai`（LLM SDK）、`zod`（schema 校验）、`dotenv`（环境变量）、`chalk`（终端美化）
- 配 `tsconfig.json`（strict mode + ESM）
- 写一个 `.env` 管理 API Key（DeepSeek 或通义千问）
- 产出：一个可复用的 `ai-starter/` 项目模板

## Phase 2：LLM API 调用与 Prompt 工程（预计 2 周）

### Task 2.1 — 跑通第一个 LLM API 调用

- 用 `openai` npm 包（兼容 DeepSeek，只需改 `baseURL` 和 `apiKey`）
- 写一个最简单的聊天脚本：终端输入 → 调 API → 打印回复
- 理解参数：`model`、`messages`、`temperature`、`max_tokens`、`stream`
- 产出：`chat-basic.ts`，能终端对话

### Task 2.2 — 实现流式输出

- 用 `stream: true` 实现 Server-Sent Events 流式返回
- 后端用 `Hono` 或 `Fastify` 搭一个 `/chat` 接口，返回 SSE 流
- 前端用你熟悉的 React + `EventSource` 消费，做打字机效果
- 产出：前后端联通的聊天 Demo

### Task 2.3 — 系统性练习 Prompt Engineering

- 读 OpenAI 官方 Prompt Engineering Guide
- 练习并记录效果对比：Zero-shot vs Few-shot、Role Prompting、Chain-of-Thought、Structured Output（JSON）、Function Calling / Tool Use
- 每个技巧写 2-3 组对比 Prompt，用脚本批量跑、记录输出差异
- 产出：`prompt-experiments.md` 笔记 + `prompt-lab.ts` 实验脚本

### Task 2.4 — 实现实用小工具：AI 笔记摘要

- 输入一篇 Vault 笔记，输出中文摘要 + 关键词 + 建议标签
- 用 `zod` 定义输出 schema，配合 Structured Output 约束 LLM 返回 JSON
- 用 `fs/promises` + `gray-matter` 解析 frontmatter，批量处理 `raw/` 目录
- 产出：`summarize-notes.ts`，可批量运行

## Phase 3：RAG 系统搭建（预计 3 周）

### Task 3.1 — 理解 Embedding 和向量检索

- 读 OpenAI embeddings 文档，理解文本转向量的原理
- 用 DeepSeek/通义千问的 Embedding API 生成几段文本的向量
- 手写 cosine similarity 计算（纯 TS，几行代码）
- 验证：相似文本得分高，不相关文本得分低
- 产出：`embedding-playground.ts`，含对比实验

### Task 3.2 — 搭建向量数据库

- 用 ChromaDB 的 Node.js SDK（`chromadb`）或更简单的方案：用 `vectra`（纯 Node.js 本地向量库，零外部依赖）
- 把你 Vault 的笔记切片（按段落或固定 token 数），生成 embedding 存入向量库
- 实现检索接口：输入问题 → 返回 top-K 相关笔记片段
- 产出：`vault-retriever.ts`

### Task 3.3 — 组装完整 RAG 问答系统

- 流程：用户提问 → 检索相关笔记片段 → 拼入 Prompt → LLM 生成回答
- 加入 rerank 步骤（用 Cohere Rerank API，有 Node SDK）
- 处理边界情况：检索结果为空、Context 超长截断、引用来源标注
- 产出：`vault-qa.ts`，能基于你笔记回答问题并标注来源

### Task 3.4 — 给 RAG 加上前端界面

- 用 React + Tailwind 搭问答 UI
- 后端用 `Hono` 暴露 `/chat` 接口（SSE 流式）
- 前端展示：对话气泡 + 引用来源卡片（可点击跳转到笔记）
- 产出：一个可跑的 `vault-qa-web/` 项目

### Task 3.5 — RAG 效果评测

- 手写 20 个问答对作为测试集
- 用 `ragas` 的 Node.js 替代方案：自己写评测脚本，计算 faithfulness（回答是否忠于检索内容）和 answer_relevancy（回答是否切题）
- 调整切片策略和检索参数，记录指标变化
- 产出：`rag-evaluation.md`，含评测报告

## Phase 4：Agent 开发（预计 3 周）

### Task 4.1 — 手写一个 ReAct Agent（不用框架）

- 读 Lilian Weng 的博客 "LLM Powered Autonomous Agents"
- 理解 ReAct 模式：Thought → Action → Observation 循环
- 用纯 TypeScript 实现：`while` 循环 + Function Calling，定义 2-3 个工具（如查天气、搜索、计算器）
- 产出：`react-agent.ts`，能自主决定调哪个工具、多步推理

### Task 4.2 — 学 LangChain.js / LangGraph.js

- 过一遍 LangChain.js 官方 Tutorial（js.langchain.com）
- 重点学：Chain、Tool、Agent、Memory、Callback
- 然后学 LangGraph.js（状态图式 Agent 编排）
- 用 LangGraph.js 重写 Task 4.1 的 Agent
- 产出：`langgraph-agent.ts`

### Task 4.3 — 做一个实用的 Agent：代码分析助手

- 定义工具集（都是 TypeScript 函数）：
  - `listFiles(dir)` — 读取目录结构
  - `readFile(path)` — 读取文件内容
  - `runCommand(cmd)` — 执行 shell 命令（`execa` 包）
  - `analyzeCode(code)` — 调 LLM 分析代码片段
- Agent 自主决策：先看目录 → 选关键文件 → 分析 → 汇总
- 产出：`code-analyzer-agent.ts`

### Task 4.4 — 多 Agent 协作

- 用 LangGraph.js 或 `crewai` 的 Node 替代方案（如 `mastra` 或自己用 LangGraph 搭）
- 场景：Agent A 负责搜索信息，Agent B 负责写作，Agent C 负责审校
- 理解 Agent 间消息传递和状态共享
- 产出：`multi-agent-demo.ts`

## Phase 5：模型层认知补齐（预计 2 周，与 Phase 4 并行）

这层确实绕不开 Python，但目标是「能跑通、能理解」，不是「能精通」。

### Task 5.1 — 本地跑一个开源模型

- 安装 Ollama（macOS 一键装），拉 Qwen2.5-7B 或 DeepSeek-7B
- Ollama 提供 OpenAI 兼容 API，你的 Node.js 代码只需改 `baseURL` 为 http://localhost:11434/v1
- 把 Phase 3 的 Vault QA 系统切到本地模型跑通
- 对比本地模型和 API 模型的效果差异
- 产出：不依赖外部 API 的本地 Vault QA 系统

### Task 5.2 — 跑通一次 LoRA 微调（唯一必须用 Python 的任务）

- 用 LLaMA-Factory（图形界面，不需要写 Python 代码）
- 准备 100 条「输入-输出」JSON 对（比如你整理笔记的格式化数据）
- 跑 QLoRA 微调，观察微调前后输出差异
- 产出：一个微调后的模型权重 + 对比测试报告

### Task 5.3 — 理解 Transformer 核心机制

- 看 3Blue1Brown 的 GPT 系列视频
- 读 Jay Alammar 的「The Illustrated Transformer」
- 能说清楚：Self-Attention 在做什么、为什么要位置编码、LayerNorm 的作用
- 产出：一篇 `transformer-notes.md` 笔记

## Phase 6：AI + 前端交叉项目（预计 3 周）

### Task 6.1 — 用 WebLLM 在浏览器跑模型

- 用 `@mlc-ai/web-llm` 在浏览器里跑 Llama-3.2-1B
- 实现纯前端 AI 对话，零后端依赖
- 产出：纯前端 AI Chat Demo

### Task 6.2 — 封装一套 AI 交互 React 组件库

- 封装组件：
  - `AIChatBox`（流式对话，Markdown 渲染、代码高亮）
  - `AIThinkingIndicator`（AI 思考动画）
  - `AICitationCard`（引用来源展示）
  - `AIMessageEditor`（AI 生成内容可编辑、可重新生成）
- 用 `tsup` 打包，发布到 npm
- 产出：`ai-react-components` npm 包

### Task 6.3 — 做一个完整的 AI 产品

- 选一个真实场景：AI 辅助 Code Review / AI 简历优化器 / AI 技术日报生成器
- 前端：React + 你的组件库
- 后端：Hono + LangGraph.js Agent
- 模型：DeepSeek API + Ollama 本地降级
- 部署：Vercel（前端）+ Railway/Fly.io（后端）
- 产出：一个可公开访问的产品
