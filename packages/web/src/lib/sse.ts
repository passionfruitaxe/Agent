export type TSseParseResult = {
  data: string[];
  remaining: string;
};

/**
 * 从累积缓冲区取出完整 SSE 事件，保留不完整尾部供下一次网络读取继续拼接。
 * fetch 的 ReadableStream 分片没有事件边界，因此不能把一次 read() 当成一条 SSE。
 */
export function parseSseEvents(buffer: string): TSseParseResult {
  const events = buffer.split(/\r?\n\r?\n/);
  const remaining = events.pop() ?? "";

  return {
    data: events
      .map(event =>
        event
          .split(/\r?\n/)
          .filter(line => line.startsWith("data:"))
          .map(line => line.slice("data:".length).trimStart())
          .join("\n"),
      )
      .filter(Boolean),
    remaining,
  };
}
