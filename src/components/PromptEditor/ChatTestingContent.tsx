/**
 * ChatTestingContent 组件 - 对话测试面板
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, ChevronDown, Loader2, Trash2 } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import { getEncryptedConfig } from "../../utils/encryption";
import { MessageIcon } from "./MessageIcon";
import type { ChatMessage, Model } from "./types";

interface ChatTestingContentProps {
  systemPrompt: string;
}

export function ChatTestingContent({ systemPrompt }: ChatTestingContentProps) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("gpt-3.5-turbo");
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 加载模型列表
  const loadModels = useCallback(
    async (cancelled: { current: boolean }) => {
      const apiBaseUrl = (await getEncryptedConfig("encrypted_api_url")) || "";
      const apiKey = (await getEncryptedConfig("encrypted_api_key")) || "";

      if (!apiBaseUrl || !apiKey) {
        return;
      }

      setIsLoadingModels(true);
      try {
        const cleanBaseUrl = apiBaseUrl.replace(/\/+$/, "");
        const modelsApiUrl = `${cleanBaseUrl}/v1/models`;

        const response = await fetch(modelsApiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });

        if (cancelled.current) return;

        if (response.ok) {
          const data = await response.json();
          if (cancelled.current) return;

          if (data.data && Array.isArray(data.data)) {
            setModels(data.data);
            // 如果当前选中的模型不在列表中，选择第一个
            if (data.data.length > 0) {
              const modelIds = data.data.map((m: Model) => m.id);
              if (!modelIds.includes(selectedModel)) {
                setSelectedModel(data.data[0].id);
              }
            }
          }
        }
      } catch (error) {
        if (!cancelled.current) {
          console.error("加载模型列表失败:", error);
        }
      } finally {
        if (!cancelled.current) {
          setIsLoadingModels(false);
        }
      }
    },
    [selectedModel],
  );

  // 页面加载时自动获取模型列表
  useEffect(() => {
    const cancelled = { current: false };
    loadModels(cancelled);
    return () => {
      cancelled.current = true;
    };
  }, [loadModels]);

  // 监听 API 配置更新事件
  useEffect(() => {
    const handleApiConfigUpdate = () => {
      const cancelled = { current: false };
      loadModels(cancelled);
    };

    window.addEventListener("api-config-updated", handleApiConfigUpdate);
    return () => {
      window.removeEventListener("api-config-updated", handleApiConfigUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 监听 API 配置删除事件 - 清理对话测试状态
  useEffect(() => {
    const handleApiConfigDeleted = () => {
      // 清空模型列表
      setModels([]);
      // 清空选中的模型
      setSelectedModel("");
      // 清空对话消息
      setMessages([]);
      // 清空输入框
      setInput("");
    };

    window.addEventListener("api-config-deleted", handleApiConfigDeleted);
    return () => {
      window.removeEventListener("api-config-deleted", handleApiConfigDeleted);
    };
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".model-dropdown")) {
        setShowModelDropdown(false);
      }
    };

    if (showModelDropdown) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showModelDropdown]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // 获取 API 配置（从加密存储）
    let apiBaseUrl = (await getEncryptedConfig("encrypted_api_url")) || "";
    const apiKey = (await getEncryptedConfig("encrypted_api_key")) || "";

    if (!apiBaseUrl || !apiKey) {
      showToast("请先在 API 配置页面设置 API 地址和密钥", "error");
      setIsLoading(false);
      return;
    }

    // 移除尾部斜杠并拼接完整路径
    apiBaseUrl = apiBaseUrl.replace(/\/+$/, "");
    const fullApiUrl = `${apiBaseUrl}/v1/chat/completions`;

    try {
      abortControllerRef.current = new AbortController();

      // 构建消息数组，如果有系统提示词则添加
      const apiMessages: Array<{ role: string; content: string }> = [];

      if (systemPrompt.trim()) {
        apiMessages.push({
          role: "system",
          content: systemPrompt,
        });
      }

      // 添加对话历史和当前用户消息
      apiMessages.push(
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user",
          content: userMessage.content,
        },
      );

      const response = await fetch(fullApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: apiMessages,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("无法读取响应流");
      }

      let assistantMessage = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: assistantMessage,
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              // 忽略非 JSON 行（如空行）
              if (data.trim()) {
                console.warn("Failed to parse SSE data:", data, e);
              }
            }
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("请求已取消");
      } else {
        console.error("对话错误:", error);
        showToast(
          `对话失败: ${error instanceof Error ? error.message : "未知错误"}`,
          "error",
        );
        // 移除最后一条空的助手消息
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      // AI 回复完成后聚焦输入框
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageIcon />
          对话测试
        </h3>
        <div className="flex items-center gap-2">
          {/* 模型选择下拉菜单 */}
          <div className="relative model-dropdown">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              disabled={isLoadingModels}
              className="text-xs bg-[#1f1f1f] text-gray-300 px-3 py-1.5 rounded-lg hover:bg-[#2a2a2a] transition-colors flex items-center gap-2 border border-white/10 disabled:opacity-50"
            >
              <span className="max-w-[120px] truncate">
                {models.length > 0 ? selectedModel : "请配置 API"}
              </span>
              <ChevronDown size={14} />
            </button>
            {showModelDropdown && models.length > 0 && (
              <div className="absolute right-0 top-full mt-2 bg-[#1f1f1f] border border-white/10 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto min-w-[200px]">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-xs hover:bg-[#3f3f3f] transition-colors ${
                      selectedModel === model.id
                        ? "bg-[#3f3f3f] text-[#3fda8c]"
                        : "text-white"
                    }`}
                  >
                    <div className="font-medium truncate">{model.id}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* 清空按钮 - 始终显示 */}
          <button
            onClick={handleClear}
            disabled={messages.length === 0}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent"
            title="清空对话"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        {messages.length === 0 ? (
          <div className="bg-[#1f1f1f] rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-400">
              在左侧填写提示词内容，并在 API
              配置页面设置你的自定义接口，然后开始测试对话。
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-[#3fda8c] text-black"
                      : "bg-[#1f1f1f] text-white"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="消息"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 bg-[#1f1f1f] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#3fda8c] transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-[#3fda8c] text-black p-2 rounded-lg hover:bg-[#35c77a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
