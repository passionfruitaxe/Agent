export type TChatModel = string;

/** 服务层向传输层输出的文本增量，不携带 HTTP 或 SSE 实现细节。 */
export type TTextStream = AsyncIterable<string>;
