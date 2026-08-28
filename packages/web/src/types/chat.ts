export type TChatRole = "user" | "assistant";

/** 页面渲染使用的消息模型；与 OpenAI 的传输 chunk 分离。 */
export type TChatMessage = {
  id: string;
  role: TChatRole;
  content: string;
  status: "streaming" | "complete";
};

export type TChatStatus = "ready" | "submitted" | "streaming" | "error";
