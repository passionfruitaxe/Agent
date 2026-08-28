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
  /** 后端配置指纹；用于定位模型或推理集群变更造成的输出差异。 */
  system_fingerprint?: string;
  /** 实际采用的服务等级；让客户端观测性能/成本策略，兼容服务可能不返回。 */
  service_tier?: "auto" | "default" | "flex" | "scale" | "priority" | null;
  /** Token 用量；一般仅在最后一个 chunk 返回，需请求 `stream_options.include_usage`。 */
  usage?: TOpenAICompletionUsage | null;
};

/** 一条候选答案在当前 chunk 中的增量。 */
export type TOpenAIChatCompletionChunkChoice = {
  /** 候选编号；多个候选的 chunk 可以交错到达，客户端依靠它分别拼接。 */
  index: number;
  /** 本次新增内容而非截至当前的全文；降低传输量，也避免客户端反复替换完整文本。 */
  delta: TOpenAIChatCompletionChunkDelta;
  /**
   * 停止原因；生成中为 null，结束时才赋值。
   * `stop` 正常结束，`length` 达到上限，`tool_calls` 请求调用工具，
   * `content_filter` 被安全策略截断，`function_call` 为旧版函数调用兼容值。
   */
  finish_reason:
    | "stop"
    | "length"
    | "tool_calls"
    | "content_filter"
    | "function_call"
    | null;
  /** Token 概率信息；仅在请求显式开启时返回，默认省略以避免显著增加传输开销。 */
  logprobs?: TOpenAIChatCompletionChunkLogprobs | null;
};

/** 模型本次输出的字段增量；每个字段均可拆分到多个 chunk，所以都是可选的。 */
export type TOpenAIChatCompletionChunkDelta = {
  /** 消息角色；一般只在第一个 chunk 中发送，后续重复没有信息增量。 */
  role?: "assistant" | "tool";
  /** 新增的可展示文本；可能为空或 null，例如首个角色 chunk、工具调用 chunk。 */
  content?: string | null;
  /** 新增的拒答文本；与正常 content 分离，使客户端可采用不同的展示或处理策略。 */
  refusal?: string | null;
  /** 旧版函数调用协议；保留以兼容旧客户端，新实现应优先使用 tool_calls。 */
  function_call?: {
    /** 函数名称可能先到达。 */
    name?: string;
    /** JSON 字符串参数可被拆分；客户端须累积后再 JSON.parse。 */
    arguments?: string;
  };
  /** 现代工具调用协议；工具名、调用 ID、参数均可能分散在多个 chunk。 */
  tool_calls?: TOpenAIChatCompletionChunkToolCall[];
};

/** 单次工具调用的增量；由 index 将不同工具调用与其分片关联起来。 */
export type TOpenAIChatCompletionChunkToolCall = {
  /** 工具调用在本候选中的编号；用于正确累积多工具并发调用的各自参数。 */
  index: number;
  /** 工具调用唯一 ID；通常首个相关 chunk 给出，后续分片可省略以减少冗余。 */
  id?: string;
  /** 当前标准工具类型为 function；可选是因为后续 chunk 不需要重复发送。 */
  type?: "function";
  function?: {
    /** 函数名称；通常只在首个相关 chunk 出现。 */
    name?: string;
    /** 函数参数 JSON 的字符串增量；拼接完成前不能直接解析。 */
    arguments?: string;
  };
};

/** 输出 token 的对数概率；用于置信度分析或候选 token 展示。 */
export type TOpenAIChatCompletionChunkLogprobs = {
  /** 正常生成文本的 token 概率；没有普通文本时为 null。 */
  content: TOpenAIChatCompletionTokenLogprob[] | null;
  /** 拒答文本的 token 概率；与 content 分离以保留不同输出语义。 */
  refusal: TOpenAIChatCompletionTokenLogprob[] | null;
};

/** 一个已选 token 及其候选分布。 */
export type TOpenAIChatCompletionTokenLogprob = {
  /** 模型最终选择的 token 文本。 */
  token: string;
  /** 该 token 的自然对数概率；值越接近 0，模型越倾向于选择它。 */
  logprob: number;
  /** token 的 UTF-8 字节；可精确处理 emoji 或不可见字符，无法表示时为 null。 */
  bytes: number[] | null;
  /** 同一位置概率最高的备选 token，支持分析模型当时的其他选择。 */
  top_logprobs: Array<{
    token: string;
    logprob: number;
    bytes: number[] | null;
  }>;
};

/** 本请求的 Token 消耗，用于计费、限额统计和性能观测。 */
export type TOpenAICompletionUsage = {
  /** 输入消息、系统提示词等消耗的 token 数。 */
  prompt_tokens: number;
  /** 模型生成内容消耗的 token 数，可能包含推理 token。 */
  completion_tokens: number;
  /** 总 token 数；等于输入和输出 token 之和。 */
  total_tokens: number;
  /** 输入 token 的细分；可用于分析缓存命中等成本优化效果。 */
  prompt_tokens_details?: {
    /** 被服务端缓存命中的输入 token，通常具有不同计费或延迟特征。 */
    cached_tokens?: number;
    /** 输入音频 token 数。 */
    audio_tokens?: number;
  };
  /** 输出 token 的细分；使推理、音频及预测命中等成本可独立观测。 */
  completion_tokens_details?: {
    /** 模型内部推理所用 token 数。 */
    reasoning_tokens?: number;
    /** 输出音频 token 数。 */
    audio_tokens?: number;
    /** 预测输出被接受的 token 数。 */
    accepted_prediction_tokens?: number;
    /** 预测输出被拒绝的 token 数。 */
    rejected_prediction_tokens?: number;
  };
};
