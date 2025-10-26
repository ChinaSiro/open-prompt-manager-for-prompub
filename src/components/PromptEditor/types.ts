/**
 * PromptEditor 共享类型定义
 */

export interface PromptFormData {
  title: string;
  description: string;
  content: string;
  apiUrl: string;
  apiKey: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface Model {
  id: string;
  object: string;
  created?: number;
  owned_by?: string;
}
