import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import ChatRaw from "./pages/ChatRaw";
import ChatSdk from "./pages/ChatSdk";

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-brand">
          <span className="mark">◆</span>
          AI Agent
        </h1>
        <nav className="app-nav" aria-label="Routes">
          <NavLink
            to="/sdk"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " is-active" : "")
            }
          >
            SDK 版
          </NavLink>
          <NavLink
            to="/raw"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " is-active" : "")
            }
          >
            手写版
          </NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/sdk" replace />} />
          <Route path="/sdk" element={<ChatSdk />} />
          <Route path="/raw" element={<ChatRaw />} />
        </Routes>
      </main>
    </div>
  );
}
