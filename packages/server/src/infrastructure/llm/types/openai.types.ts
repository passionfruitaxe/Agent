/** OpenAI Chat Completions API 在 stream: true 时，一条 SSE `data:` 中的 JSON。 */
export type TOpenAIChatCompletionChunk = {
  /** 一次生成请求的唯一标识；同一响应的所有 chunk 共用它，方便客户端聚合、日志追踪。 */
  id: string;
  /** 固定值；用于与完整响应的 `chat.completion` 区分，避免客户端误用解析逻辑。 */
  object: "chat.completion.chunk";
  /** 响应创建时的 Unix 秒级时间戳；各 chunk 通常一致，避免逐片重复计算。 */
  created: number;
  /** 实际执行推理的模型名；网关路由后可能与请求模型不同，便于排障和计费。 */
  model: string;
  /** 候选输出列表；`n > 1` 时可同时流回多个候选，普通聊天通常只有 index 为 0 的一个。 */
  choices: TOpenAIChatCompletionChunkChoice[];
  system_fingerprint?: string;
  service_tier?: "auto" | "default" | "flex" | "scale" | "priority" | null;
  usage?: TOpenAICompletionUsage | null;
};

export type TOpenAIChatCompletionChunkChoice = {
  /** 候选编号；多候选 chunk 可以交错到达，客户端依靠它分别拼接。 */
  index: number;
  /** 本次新增内容而非全文；降低传输量。 */
  delta: TOpenAIChatCompletionChunkDelta;
  /** 生成中为 null；结束时说明停止原因。 */
  finish_reason:
    | "stop"
    | "length"
    | "tool_calls"
    | "content_filter"
    | "function_call"
    | null;
  logprobs?: TOpenAIChatCompletionChunkLogprobs | null;
};

export type TOpenAIChatCompletionChunkDelta = {
  role?: "assistant" | "tool";
  content?: string | null;
  refusal?: string | null;
  function_call?: { name?: string; arguments?: string };
  tool_calls?: TOpenAIChatCompletionChunkToolCall[];
};

export type TOpenAIChatCompletionChunkToolCall = {
  index: number;
  id?: string;
  type?: "function";
  function?: { name?: string; arguments?: string };
};

export type TOpenAIChatCompletionChunkLogprobs = {
  content: TOpenAIChatCompletionTokenLogprob[] | null;
  refusal: TOpenAIChatCompletionTokenLogprob[] | null;
};

export type TOpenAIChatCompletionTokenLogprob = {
  token: string;
  logprob: number;
  bytes: number[] | null;
  top_logprobs: Array<{
    token: string;
    logprob: number;
    bytes: number[] | null;
  }>;
};

export type TOpenAICompletionUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details?: { cached_tokens?: number; audio_tokens?: number };
  completion_tokens_details?: {
    reasoning_tokens?: number;
    audio_tokens?: number;
    accepted_prediction_tokens?: number;
    rejected_prediction_tokens?: number;
  };
};
