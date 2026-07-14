# AI Agent

一个 AI 驱动的知识问答与代码分析平台，采用 bun workspace 管理 monorepo，涵盖 LLM 调用、RAG 检索、Agent 编排和前端交互的完整链路。

## 工具链

项目约定使用以下三个基础工具，通过 mise 统一管理版本：

**mise** — 开发环境版本管理。锁定 node、bun、python 等工具的版本，`mise install` 一键对齐环境，避免「我这能跑你那跑不了」的问题。

**bun** — TypeScript/JavaScript 侧的全能运行时。负责包管理（monorepo workspace）、直接运行 .ts 文件（无需 tsx 或 ts-node）、打包构建、执行测试，一个工具覆盖整个 JS/TS 工作流。

**uv** — Python 侧的包管理和虚拟环境工具。仅用于 model/ 目录下的 LoRA 微调等 Python 任务，管理 Python 版本和依赖安装。

## 技术选型

| 维度 | 方案 | 说明 |
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

## 目录结构

```
Agent/
├── packages/
│   ├── server/
│   ├── web/
│   └── ui/
├── scripts/
├── model/
├── eval/
└── docs/
```

## packages/

monorepo 子包目录，存放项目的三个核心包。

### packages/server/

后端服务，对外提供 API 接口，是整个平台的核心引擎。

```
server/src/
├── routes/        API 路由定义
├── llm/           LLM 能力层
├── rag/           RAG 检索管线
├── agent/         Agent 编排引擎
│   └── tools/     Agent 可调用的工具集
└── vector-store/  向量数据库适配层
```

**routes/** — 定义对外暴露的 HTTP 接口，包括聊天对话、知识库问答、代码分析等路由，统一处理请求参数校验和 SSE 流式响应。

**llm/** — 封装与大语言模型的交互逻辑，包括 LLM 客户端初始化（支持多后端切换）、Prompt 模板管理、流式输出处理，以及 temperature、max_tokens 等推理参数的统一配置。

**rag/** — 实现检索增强生成（Retrieval-Augmented Generation）的完整管线：文档切片策略（按段落或固定 token 数分块）、Embedding 向量生成、向量相似度检索、Rerank 重排序，以及 Context 拼装与超长截断等边界情况处理。

**agent/** — Agent 的推理与编排逻辑。包含手写的 ReAct（Thought → Action → Observation）推理循环、基于状态图的 Agent 编排，以及多 Agent 协作场景（搜索、写作、审校等 Agent 之间的消息传递与状态共享）。

**agent/tools/** — Agent 在推理过程中可调用的工具函数，例如读取文件、列出目录结构、执行 shell 命令、搜索网络、调用 LLM 分析代码片段等。每个工具定义为独立模块，包含描述信息和执行逻辑，供 Agent 的 Function Calling 机制调度。

**vector-store/** — 向量数据库的适配层，抹平不同向量存储方案的接口差异，提供统一的存储、检索和索引管理能力，便于后续切换底层存储而不影响上层 RAG 逻辑。

### packages/web/

前端应用，为用户提供与 AI 交互的界面。

```
web/src/
├── pages/         页面级组件
├── components/    业务组件
└── hooks/         自定义 Hooks
```

**pages/** — 应用的页面级组件，包括通用聊天对话页、基于知识库的问答页（展示引用来源）、代码分析页等，每个页面组合下层组件并对接后端接口。

**components/** — AI 交互相关的业务组件，包括流式对话气泡（支持 Markdown 渲染和代码高亮）、AI 思考状态动画、引用来源卡片（可点击跳转到原始笔记）、AI 生成内容的可编辑区域（支持重新生成）等。

**hooks/** — 自定义 Hooks，封装 SSE（Server-Sent Events）流式数据消费、对话状态管理、消息历史持久化等可复用逻辑。

### packages/ui/

独立的 AI 交互组件库，从 web 包中抽离的通用 UI 组件，可单独发布到 npm 供其他项目复用。不绑定任何业务逻辑，仅提供 AI 交互场景下的通用 UI 能力，如流式对话框、思考动画、引用来源卡片、可编辑消息区等。

## scripts/

独立运行的工具脚本，不属于任何子包，用于数据准备和实验。包括将笔记批量切片并导入向量数据库的摄入脚本、Prompt Engineering 的对照实验脚本（批量运行不同 Prompt 策略并记录输出差异）、批量笔记摘要生成脚本等。通过 `bun run scripts/xxx.ts` 直接执行。

## model/

模型层相关文件，包括本地模型的部署说明和 LoRA 微调相关内容。此目录下的 Python 依赖通过 uv 管理。

```
model/
└── train-data/    微调训练数据
```

**train-data/** — 存放 LoRA/QLoRA 微调所需的训练数据，格式为「输入-输出」JSON 对。训练产出的模型权重文件（.bin / .safetensors）不纳入版本管理。

## eval/

RAG 系统的评测体系。存放手工编写的问答测试集和自动化评测脚本，计算 faithfulness（回答是否忠于检索内容）和 answer_relevancy（回答是否切题）等指标。用于在调整切片策略、检索参数或模型后，量化对比效果变化，输出评测报告。

## docs/

学习笔记与项目设计文档。包括整体架构设计说明、Prompt Engineering 实验记录、Transformer 核心机制学习笔记、微调前后的对比测试报告等。

- [学习计划](docs/learning-plan.md) — 6 个阶段的完整学习路径，每个 Task 的目标和产出
- [项目规划](docs/project-plan.md) — 架构设计、目录职责、技术选型理由、学习产出与项目目录的映射关系

## 快速开始

### 环境准备

项目依赖 mise 管理工具版本，首先确保 mise 已安装：

```bash
# 安装 mise（如果还没有）
curl https://mise.run | sh

# 进入项目目录，自动安装锁定版本的 node、bun、python
cd Agent
mise install
```

### 安装依赖

```bash
# 安装所有 workspace 包的依赖
bun install
```

### 启动开发

```bash
# 启动后端服务（默认 http://localhost:3000）
bun run dev:server

# 启动前端开发服务器（另开一个终端）
bun run dev:web
```

### 运行脚本

```bash
# 直接用 bun 执行 scripts 目录下的工具脚本
bun run scripts/prompt-lab.ts
bun run scripts/ingest-vault.ts
```

### 环境变量

复制 `.env.example` 为 `.env`，填入你的 API Key：

```bash
cp .env.example .env
```

### LoRA 微调（Python 环境）

```bash
cd model
uv venv
uv pip install unsloth
```
