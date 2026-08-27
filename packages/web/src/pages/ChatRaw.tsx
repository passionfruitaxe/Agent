import { Link } from "react-router-dom";

export default function ChatRaw() {
  return (
    <section className="placeholder">
      <span className="status-pill">未实现 · Task 2.2a</span>
      <h2 className="placeholder-title">手写 SSE 聊天</h2>
      <p className="placeholder-body">
        将用原生 <code>fetch</code> + <code>ReadableStream</code> 手动解析 SSE 帧，
        对应后端 <code>/api/chat-raw</code> 端点。与 SDK 版对比，理解 SSE 协议本质。
      </p>
      <Link className="placeholder-link" to="/sdk">
        先用 SDK 版 →
      </Link>
    </section>
  );
}
