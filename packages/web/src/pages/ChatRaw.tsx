import { useEffect, useRef, useState } from "react";
import { useRawChat } from "../hooks/useRawChat";

export default function ChatRaw() {
  const { messages, status, error, sendMessage, stop } = useRawChat({
    api: "http://localhost:3000/api/chat/raw",
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, status]);

  return (
    <div className="chat">
      <div className="chat-messages" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">
            <h2>和 DeepSeek 聊两句</h2>
            <p>原生 fetch · 手写 SSE 解析</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={
                "msg " +
                (message.role === "user" ? "is-user" : "is-assistant") +
                (message.status === "streaming" ? " is-streaming" : "")
              }
            >
              <span className="msg-role">
                {message.role === "user" ? "你" : "AI"}
              </span>
              <div className="msg-bubble">{message.content}</div>
            </div>
          ))
        )}
        {error && <p role="alert">{error}</p>}
      </div>

      <form
        className="composer"
        onSubmit={event => {
          event.preventDefault();
          if (!input.trim() || busy) return;
          void sendMessage({ text: input });
          setInput("");
        }}
      >
        <div className="composer-form">
          <textarea
            className="composer-input"
            value={input}
            onChange={event => setInput(event.target.value)}
            disabled={busy}
            placeholder={busy ? "生成中…" : "说点什么…"}
            rows={1}
            onKeyDown={event => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          {busy ? (
            <button type="button" className="send-btn" onClick={stop}>
              停止
            </button>
          ) : (
            <button type="submit" className="send-btn" disabled={!input.trim()}>
              发送
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
