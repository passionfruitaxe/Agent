import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";

export default function ChatSdk() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "http://localhost:3000/api/chat",
    }),
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const busy = status !== "ready";

  return (
    <div className="chat">
      <div className="chat-messages" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">
            <h2>和 DeepSeek 聊两句</h2>
            <p>SDK 版 · UI Message Stream</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const streaming =
              busy && i === messages.length - 1 && m.role === "assistant";
            return (
              <div
                key={m.id}
                className={
                  "msg " +
                  (m.role === "user" ? "is-user" : "is-assistant") +
                  (streaming ? " is-streaming" : "")
                }
              >
                <span className="msg-role">{m.role === "user" ? "你" : "AI"}</span>
                <div className="msg-bubble">
                  {m.parts.map((part, idx) =>
                    part.type === "text" ? (
                      <span key={idx}>{part.text}</span>
                    ) : null,
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !busy) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
      >
        <div className="composer-form">
          <textarea
            className="composer-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            placeholder={busy ? "生成中…" : "说点什么…"}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
              }
            }}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={busy || !input.trim()}
            data-state={busy ? "loading" : undefined}
          >
            {busy ? "生成中" : "发送"}
          </button>
        </div>
      </form>
    </div>
  );
}
