# 项目规划

## 产品定位

一个 AI 驱动的知识问答与代码分析平台。用户可以导入自己的笔记或文档，通过对话式界面进行知识检索和问答（RAG），也可以让 Agent 自主分析代码仓库并给出汇总报告。平台支持云端 API 模型和 Ollama 本地模型切换，满足不同场景下对隐私和成本的需求。

## 架构概览

项目采用前后端分离架构，通过 bun workspace 管理 monorepo，包含三个核心子包和若干辅助目录。

```
┌─────────────┐     SSE/HTTP      ┌──────────────────────────────┐
│  packages/  │ ◄──────────────── │       packages/server        │
│    web      │                   │                              │
│  (React SPA)│                   │  routes ─► llm    ─► LLM API │
│             │                   │         ─► rag    ─► LanceDB │
│             │                   │         ─► agent  ─► tools   │
└─────────────┘                   └──────────────────────────────┘
       │                                       │
       │ 引用                                   │ OpenAI 兼容协议
       ▼                                       ▼
┌─────────────┐                   ┌──────────────────────────────┐
│  packages/  │                   │  DeepSeek API / Ollama 本地   │
│    ui       │                   └──────────────────────────────┘
│ (组件库)     │
└─────────────┘
```

前端是一个纯 SPA，消费后端 HTTP/SSE 接口。后端是核心引擎，内部按职责拆分为路由层、LLM 能力层、RAG 管线、Agent 编排四个模块。LLM 调用统一走 OpenAI 兼容协议，切换模型只需改环境变量，业务代码无感知。

## 目录职责

### packages/server/

后端服务，对外提供 API 接口。

**src/routes/** — HTTP 接口定义。聊天对话（`/chat`）、知识库问答（`/qa`）、代码分析（`/analyze`）等路由，统一处理参数校验和 SSE 流式响应。

**src/llm/** — LLM 交互封装。客户端初始化（多后端切换）、Prompt 模板管理、流式输出处理、推理参数配置。

**src/rag/** — RAG 检索管线。文档切片（按段落或固定 token 数）、Embedding 生成、向量检索、Rerank 重排序、Context 拼装与超长截断处理。

**src/agent/** — Agent 推理与编排。手写 ReAct 推理循环（Thought → Action → Observation）、多 Agent 协作的消息传递与状态共享。

**src/agent/tools/** — Agent 工具函数。读取文件、列目录、执行命令、搜索网络、LLM 代码分析等，每个工具独立模块，供 Function Calling 调度。

**src/vector-store/** — 向量数据库适配层。抹平 LanceDB 等不同存储方案的接口差异，提供统一的存储、检索和索引管理。

### packages/web/

前端应用，React SPA。

**src/pages/** — 页面组件。聊天对话页、知识库问答页（含引用来源展示）、代码分析页。

**src/components/** — 业务组件。流式对话气泡（Markdown 渲染 + 代码高亮）、AI 思考动画、引用来源卡片、可编辑 AI 回复区。

**src/hooks/** — 自定义 Hooks。SSE 流式消费、对话状态管理、消息历史持久化。

### packages/ui/

独立的 AI 交互组件库，从 web 中抽离的通用 UI 组件。不绑定业务逻辑，可单独发布到 npm。包含 AIChatBox、AIThinkingIndicator、AICitationCard、AIMessageEditor 等。

### scripts/

独立工具脚本。笔记导入向量库的摄入脚本、Prompt 对照实验脚本、批量摘要生成脚本等，通过 `bun run scripts/xxx.ts` 直接执行。

### model/

模型层。Ollama 本地部署说明和 LoRA 微调相关内容。`train-data/` 存放微调训练数据（输入-输出 JSON 对），Python 依赖通过 uv 管理。模型权重不纳入版本管理。

### eval/

RAG 评测体系。问答测试集和评测脚本，计算 faithfulness 和 answer_relevancy 指标，量化对比切片策略、检索参数或模型变更后的效果差异。

### docs/

学习笔记与设计文档。学习路径规划、架构设计、Prompt 实验记录、Transformer 笔记、微调报告等。

## 技术选型

| 维度 | 方案 | 选型理由 |
|---|---|---|
| 后端框架 | Hono | 原生适配 Bun，API 风格类似 Express，轻量快速 |
| 前端框架 | Vite + React | 生态成熟，AI 相关 SDK 支持最全 |
| UI 样式 | Tailwind CSS | 原子类即写即得，零 CSS 文件维护 |
| LLM SDK | Vercel AI SDK | 统一适配多家模型，内置流式输出和 React hooks |
| Schema 校验 | Zod | 类型与运行时校验一体，AI SDK / Hono 原生集成 |
| 向量数据库 | LanceDB | 嵌入式，无需部署服务，文件形式存储 |
| Agent 编排 | 手写 ReAct | 不引入框架，while 循环 + Function Calling，透明可控 |
| Embedding | OpenAI 兼容 API | DeepSeek / Ollama 统一接口，集成最快 |
| 本地模型 | Ollama | 一条命令拉模型，自带 REST API |
| LoRA 微调 | Unsloth | 显存和速度优化，uv 管理 Python 环境 |
| Markdown / 高亮 | react-markdown + Shiki | 声明式渲染 AI 回复，VSCode 级代码高亮 |

## 学习计划与产出映射

学习路径文档（见 `docs/learning-plan.md`）中各 Phase 的产出最终落入项目对应目录：

| Phase | 学习内容 | 产出归属 |
|---|---|---|
| Phase 1 | 环境搭建与项目骨架 | 根目录配置文件 |
| Phase 2 | LLM API 调用与 Prompt 工程 | `server/src/llm/`、`server/src/routes/chat`、`scripts/prompt-lab.ts` |
| Phase 3 | RAG 系统搭建 | `server/src/rag/`、`server/src/vector-store/`、`eval/` |
| Phase 4 | Agent 开发 | `server/src/agent/`、`server/src/agent/tools/` |
| Phase 5 | 模型层认知补齐 | `model/`、`docs/transformer-notes.md` |
| Phase 6 | AI + 前端交叉项目 | `packages/web/`、`packages/ui/` |
