# AI 学习路径

> 原文档：https://km.sankuai.com/collabpage/2735129838
> 
> 本文档已根据实际项目决策调整，技术选型、产品场景、部署方案均以本文为准。

## Phase 1：开发环境搭建（预计 1 周）

### Task 1.1 — 确认环境和工具链

- 通过 mise 统一管理工具版本（node 22+、bun、python 3.12）
- `mise install` 一键安装所有运行时
- 确认基础设施：ESM 模块、`import` 语法、`fetch` API（Node 22+ 内置）
- 产出：`mise install` 跑通，`bun run hello.ts` 验证通过

### Task 1.2 — 搭建项目骨架（✅ 已完成）

- bun workspace 管理 monorepo，包含 server / web / ui 三个子包
- 安装核心依赖：`ai`（Vercel AI SDK）、`@ai-sdk/openai`、`hono`、`zod`、`dotenv`
- 配 `tsconfig.json`（strict mode + ESM）
- 写 `.env` 管理 API Key（DeepSeek）
- 产出：完整的 monorepo 项目骨架，`bun run dev:server` 可启动

## Phase 2：LLM API 调用与 Prompt 工程（预计 2 周）

### Task 2.1 — 跑通第一个 LLM API 调用

- 用 Vercel AI SDK（`ai` + `@ai-sdk/openai`），通过 OpenAI 兼容协议接入 DeepSeek
- 写一个最简单的聊天脚本：终端输入 → 调 API → 打印回复
- 理解参数：`model`、`messages`、`temperature`、`maxTokens`、`stream`
- 产出：`chat-basic.ts`，能终端对话

### Task 2.2 — 实现流式输出

- 用 Vercel AI SDK 的 `streamText` 实现流式返回
- 后端用 Hono 搭一个 `/chat` 接口，返回 SSE 流
- 前端用 React + Vercel AI SDK 的 `useChat` hook 消费，做打字机效果
- 产出：前后端联通的聊天 Demo

### Task 2.3 — 系统性练习 Prompt Engineering

- 读 OpenAI 官方 Prompt Engineering Guide
- 练习并记录效果对比：Zero-shot vs Few-shot、Role Prompting、Chain-of-Thought、Structured Output（JSON）、Function Calling / Tool Use
- 每个技巧写 2-3 组对比 Prompt，用脚本批量跑、记录输出差异
- 产出：`docs/prompt-experiments.md` 笔记 + `scripts/prompt-lab.ts` 实验脚本

### Task 2.4 — 实现实用小工具：AI 笔记摘要

- 输入一篇笔记，输出中文摘要 + 关键词 + 建议标签
- 用 Zod 定义输出 schema，配合 Vercel AI SDK 的 `generateObject` 约束 LLM 返回结构化 JSON
- 批量处理笔记目录
- 产出：`scripts/summarize-notes.ts`，可批量运行

## Phase 3：RAG 系统搭建（预计 3 周）

### Task 3.1 — 理解 Embedding 和向量检索

- 读 OpenAI embeddings 文档，理解文本转向量的原理
- 用 DeepSeek 或 Ollama 的 Embedding API 生成几段文本的向量
- 手写 cosine similarity 计算（纯 TS，几行代码）
- 验证：相似文本得分高，不相关文本得分低
- 产出：`scripts/embedding-playground.ts`，含对比实验

### Task 3.2 — 搭建向量数据库

- 用 LanceDB（嵌入式向量库，无需单独部署，文件形式存储）
- 把笔记切片（按段落或固定 token 数），生成 embedding 存入 LanceDB
- 实现检索接口：输入问题 → 返回 top-K 相关笔记片段
- 产出：`server/src/vector-store/` 适配层 + `server/src/rag/retriever.ts`

### Task 3.3 — 组装完整 RAG 问答系统

- 流程：用户提问 → 检索相关笔记片段 → 拼入 Prompt → LLM 生成回答
- 加入 rerank 步骤（用 Cohere Rerank API）
- 处理边界情况：检索结果为空、Context 超长截断、引用来源标注
- 产出：`server/src/routes/qa.ts`，完整的 `/qa` 接口

### Task 3.4 — 给 RAG 加上前端界面

- 用 React + Tailwind CSS 搭问答 UI
- 后端 Hono `/qa` 接口返回 SSE 流
- 前端展示：对话气泡 + 引用来源卡片（可点击跳转到笔记）
- 产出：`web/src/pages/VaultQA.tsx`

### Task 3.5 — RAG 效果评测

- 手写 20 个问答对作为测试集
- 自己写评测脚本，计算 faithfulness（回答是否忠于检索内容）和 answer_relevancy（回答是否切题）
- 调整切片策略和检索参数，记录指标变化
- 产出：`eval/` 目录下的测试集、评测脚本和 `docs/rag-evaluation.md` 评测报告

## Phase 4：Agent 开发（预计 3 周）

### Task 4.1 — 手写一个 ReAct Agent（不用框架）

- 读 Lilian Weng 的博客 "LLM Powered Autonomous Agents"
- 理解 ReAct 模式：Thought → Action → Observation 循环
- 用纯 TypeScript 实现：`while` 循环 + Vercel AI SDK 的 Tool Calling，定义 2-3 个工具（如查天气、搜索、计算器）
- 产出：`server/src/agent/react-loop.ts`，能自主决定调哪个工具、多步推理

### Task 4.2 — 做一个实用的 Agent：代码分析助手

- 支持两种代码来源：
  - **本地模式**：用户指定本地目录路径，Agent 直接读取分析（开发阶段优先实现）
  - **在线模式**：用户输入 Git 仓库 URL，后端 clone 到临时目录后分析（产品化阶段实现）
- 定义工具集（`server/src/agent/tools/`）：
  - `cloneRepo(url)` — clone Git 仓库到临时目录（在线模式）
  - `listFiles(dir)` — 读取目录结构
  - `readFile(path)` — 读取文件内容
  - `runCommand(cmd)` — 执行 shell 命令
  - `analyzeCode(code)` — 调 LLM 分析代码片段
- Agent 自主决策：先看目录 → 选关键文件 → 分析 → 汇总
- 在线模式需处理：Git 认证、clone 超时、临时目录清理、仓库大小限制
- 产出：`server/src/routes/analyze.ts`，完整的 `/analyze` 接口

### Task 4.3 — 多 Agent 协作

- 基于手写编排实现多 Agent 场景
- 场景：Agent A 负责搜索信息，Agent B 负责写作，Agent C 负责审校
- 理解 Agent 间消息传递和状态共享
- 产出：`server/src/agent/multi-agent.ts`

### Task 4.4 — （可选）学习 LangChain.js / LangGraph.js

- 过一遍 LangChain.js 官方 Tutorial
- 重点理解：Chain、Tool、Agent、Memory、Callback
- 了解 LangGraph.js 的状态图式编排思路
- 产出：理解框架设计理念，与手写方案做对比

## Phase 5：模型层认知补齐（预计 2 周，与 Phase 4 并行）

### Task 5.1 — 本地跑一个开源模型

- 安装 Ollama（macOS 一键装），拉 Qwen2.5-7B 或 DeepSeek-7B
- Ollama 提供 OpenAI 兼容 API，Vercel AI SDK 只需改 `baseURL` 为 http://localhost:11434/v1
- 把 Phase 3 的 RAG 问答系统切到本地模型跑通
- 对比本地模型和 API 模型的效果差异
- 产出：不依赖外部 API 的本地问答系统

### Task 5.2 — 跑通一次 LoRA 微调（Python 环境，用 uv 管理）

- 用 Unsloth（对 LoRA 做了显存和速度优化，上手门槛最低）
- 通过 uv 创建虚拟环境：`cd model && uv venv && uv pip install unsloth`
- 准备 100 条「输入-输出」JSON 对（存放在 `model/train-data/`）
- 跑 QLoRA 微调，观察微调前后输出差异
- 产出：微调后的模型权重 + `docs/lora-finetune-report.md` 对比测试报告

### Task 5.3 — 理解 Transformer 核心机制

- 看 3Blue1Brown 的 GPT 系列视频
- 读 Jay Alammar 的「The Illustrated Transformer」
- 能说清楚：Self-Attention 在做什么、为什么要位置编码、LayerNorm 的作用
- 产出：`docs/transformer-notes.md` 笔记

## Phase 6：产品完善与组件沉淀（预计 3 周）

### Task 6.1 — 封装 AI 交互 React 组件库

- 在 `packages/ui/` 中封装组件：
  - `AIChatBox` — 流式对话，react-markdown 渲染 + Shiki 代码高亮
  - `AIThinkingIndicator` — AI 思考动画
  - `AICitationCard` — 引用来源展示
  - `AIMessageEditor` — AI 生成内容可编辑、可重新生成
- 用 bun 打包
- 产出：`@ai-agent/ui` 组件库

### Task 6.2 — 完善知识问答与代码分析平台

- 前端：React + `@ai-agent/ui` 组件库 + Tailwind CSS
- 后端：Hono + 手写 ReAct Agent
- 模型：DeepSeek API + Ollama 本地降级
- 功能完善：聊天对话、知识库问答（带引用来源）、代码分析（支持本地路径和 Git URL 两种输入）
- 产出：功能完整的全栈 AI 应用

### Task 6.3 — 部署上线

- 前端：部署到 Vercel，`git push` 自动构建部署，零配置
- 后端：部署到 Railway，基于 `oven/bun` 的 Docker 镜像，支持持久化 Volume（挂载 LanceDB 数据）
- 编写 Dockerfile：基于 `oven/bun` 基础镜像，直接运行 TypeScript，无需编译步骤
- 配置环境变量：Railway 上设置 API Key、LanceDB 路径等
- 产出：Dockerfile + Vercel 配置 + Railway 部署，`git push` 即上线

### Task 6.4 — （可选）浏览器端模型推理

- 用 `@mlc-ai/web-llm` 在浏览器里跑小模型
- 实现纯前端 AI 对话，零后端依赖
- 产出：纯前端 AI Chat Demo 作为降级方案
