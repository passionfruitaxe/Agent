import { useCallback, useEffect, useRef, useState } from "react";
import { mergeCompletionChunk, parseOpenAIStreamData } from "../lib/open-ai-stream";
import { parseSseEvents } from "../lib/sse";
import type { TChatMessage, TChatStatus } from "../types/chat";

type TUseRawChatOptions = {
  api: string;
};

export function useRawChat({ api }: TUseRawChatOptions) {
  const [messages, setMessages] = useState<TChatMessage[]>([]);
  const [status, setStatus] = useState<TChatStatus>("ready");
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  useEffect(() => stop, [stop]);

  const sendMessage = useCallback(
    async ({ text }: { text: string }) => {
      const content = text.trim();
      if (!content || status !== "ready") return;

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setError(null);
      setStatus("submitted");
      setMessages(previous => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "user",
          content,
          status: "complete",
        },
      ]);

      try {
        const response = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: content }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`请求失败：${response.status} ${response.statusText}`);
        }
        if (!response.body) {
          throw new Error("服务端没有返回可读取的数据流");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let receivedContent = false;

        while (true) {
          const { done, value } = await reader.read();
          buffer += decoder.decode(value, { stream: !done });

          const parsed = parseSseEvents(buffer);
          buffer = parsed.remaining;

          for (const data of parsed.data) {
            const chunk = parseOpenAIStreamData(data);
            if (!chunk) continue;

            receivedContent ||= chunk.choices.some(
              choice => choice.delta.content !== undefined,
            );
            setMessages(previous => mergeCompletionChunk(previous, chunk));
          }

          if (done) break;
        }

        if (!controller.signal.aborted && !receivedContent) {
          throw new Error("服务端未返回模型文本");
        }
        if (!controller.signal.aborted) setStatus("ready");
      } catch (reason) {
        if (controller.signal.aborted) {
          setStatus("ready");
          return;
        }

        setError(reason instanceof Error ? reason.message : "流式请求失败");
        setStatus("error");
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [api, status],
  );

  return { messages, status, error, sendMessage, stop };
}
