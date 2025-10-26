/**
 * APITab 组件 - API 配置标签页
 */

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "../../contexts/ToastContext";
import {
  getEncryptedConfig,
  saveEncryptedConfig,
  removeEncryptedConfig,
} from "../../utils/encryption";
import type { PromptFormData } from "./types";

interface APITabProps {
  formData: PromptFormData;
  setFormData: React.Dispatch<React.SetStateAction<PromptFormData>>;
  onApiConfigDeleted?: () => void;
}

export function APITab({
  formData,
  setFormData,
  onApiConfigDeleted,
}: APITabProps) {
  const { showToast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // 页面加载时从加密存储读取配置
  useEffect(() => {
    const loadApiConfig = async () => {
      const apiUrl = (await getEncryptedConfig("encrypted_api_url")) || "";
      const apiKey = (await getEncryptedConfig("encrypted_api_key")) || "";

      if (apiUrl || apiKey) {
        setFormData((prev) => ({
          ...prev,
          apiUrl,
          apiKey,
        }));
      }
    };

    loadApiConfig();
  }, [setFormData]);

  const handleSaveApiSettings = async () => {
    if (!formData.apiUrl.trim() && !formData.apiKey.trim()) {
      showToast("请至少填写 API 地址或密钥", "error");
      return;
    }

    setIsSaving(true);
    try {
      // 移除尾部斜杠
      const cleanApiUrl = formData.apiUrl.trim()
        ? formData.apiUrl.trim().replace(/\/+$/, "")
        : "";
      const cleanApiKey = formData.apiKey.trim();

      // 加密保存到本地 localStorage
      if (cleanApiUrl) {
        await saveEncryptedConfig("encrypted_api_url", cleanApiUrl);
        // 同步更新表单数据
        setFormData((prev) => ({ ...prev, apiUrl: cleanApiUrl }));
      }

      if (cleanApiKey) {
        await saveEncryptedConfig("encrypted_api_key", cleanApiKey);
      }

      // 触发自定义事件通知其他组件刷新
      window.dispatchEvent(new CustomEvent("api-config-updated"));

      showToast("API 设置已加密保存到本地", "success");
    } catch (error) {
      console.error("保存 API 设置错误:", error);
      showToast("保存失败", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteApiSettings = async () => {
    setIsDeleting(true);
    try {
      // 删除加密存储的配置
      removeEncryptedConfig("encrypted_api_url");
      removeEncryptedConfig("encrypted_api_key");

      // 清空表单
      setFormData({ ...formData, apiUrl: "", apiKey: "" });

      // 通知父组件
      onApiConfigDeleted?.();

      // 触发自定义事件通知其他组件刷新和清理状态
      window.dispatchEvent(new CustomEvent("api-config-deleted"));
      window.dispatchEvent(new CustomEvent("api-config-updated"));

      showToast("API 设置已删除", "success");
    } catch (error) {
      console.error("删除 API 设置错误:", error);
      showToast("删除失败", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTestAPI = async () => {
    if (!formData.apiUrl.trim()) {
      showToast("请先填写 API 地址", "error");
      return;
    }

    if (!formData.apiKey.trim()) {
      showToast("请先填写 API 密钥", "error");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // 移除尾部斜杠并拼接模型列表路径
      const apiBaseUrl = formData.apiUrl.trim().replace(/\/+$/, "");
      const modelsApiUrl = `${apiBaseUrl}/v1/models`;

      const response = await fetch(modelsApiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${formData.apiKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          const modelCount = data.data.length;
          setTestResult({
            success: true,
            message: `API 连接成功！检测到 ${modelCount} 个可用模型`,
          });
          showToast("API 连接成功！", "success");

          // 测试成功后自动保存配置
          const cleanApiUrl = formData.apiUrl.trim();
          const cleanApiKey = formData.apiKey.trim();

          if (cleanApiUrl) {
            await saveEncryptedConfig("encrypted_api_url", cleanApiUrl);
            setFormData((prev) => ({ ...prev, apiUrl: cleanApiUrl }));
          }

          if (cleanApiKey) {
            await saveEncryptedConfig("encrypted_api_key", cleanApiKey);
          }

          // 触发自定义事件通知对话测试刷新模型列表
          window.dispatchEvent(new CustomEvent("api-config-updated"));
        } else {
          setTestResult({
            success: false,
            message: "API 响应格式不正确",
          });
          showToast("API 响应格式不正确", "error");
        }
      } else {
        const errorText = await response.text();
        let errorMessage = `连接失败: ${response.status} ${response.statusText}`;

        // 尝试解析错误信息
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = `${errorMessage} - ${errorData.error.message}`;
          }
        } catch {
          // 忽略 JSON 解析错误
        }

        setTestResult({
          success: false,
          message: errorMessage,
        });
        showToast(`连接失败: ${response.status}`, "error");
        console.error("API 测试失败:", errorText);
      }
    } catch (error) {
      console.error("API 测试错误:", error);
      setTestResult({
        success: false,
        message: `连接错误: ${error instanceof Error ? error.message : "未知错误"}`,
      });
      showToast("API 连接失败", "error");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">API 配置</h2>

      {/* 安全说明 */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white mb-1">
              本地加密存储
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              您的 API 密钥使用{" "}
              <span className="text-blue-400 font-medium">
                AES-256-GCM 加密算法
              </span>
              存储在浏览器本地，不会上传到我们的服务器。所有 API
              请求直接从您的浏览器发送到目标服务，保护您的隐私安全。
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#252429] rounded-xl p-6">
        <p className="text-sm text-gray-400 mb-6">
          配置自定义 API 端点以连接外部 OpenAI 兼容服务。
        </p>

        {/* API URL */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3">
            API 基础地址
          </label>
          <input
            type="text"
            placeholder="https://api.openai.com"
            value={formData.apiUrl}
            onChange={(e) =>
              setFormData({ ...formData, apiUrl: e.target.value })
            }
            className="w-full bg-[#2C2A2F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#3fda8c] transition-colors"
          />
          <p className="text-xs text-gray-500 mt-2">
            只需输入基础域名，系统会自动拼接 /v1/chat/completions
          </p>
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-semibold mb-3">API 密钥</label>
          <input
            type="password"
            placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
            value={formData.apiKey}
            onChange={(e) =>
              setFormData({ ...formData, apiKey: e.target.value })
            }
            className="w-full bg-[#2C2A2F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#3fda8c] transition-colors"
          />
          <p className="text-xs text-gray-500 mt-2">
            你的 API 密钥将被加密并安全存储
          </p>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              testResult.success
                ? "bg-green-500/10 border border-green-500/30"
                : "bg-red-500/10 border border-red-500/30"
            }`}
          >
            <p
              className={`text-sm ${
                testResult.success ? "text-green-400" : "text-red-400"
              }`}
            >
              {testResult.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleTestAPI}
            disabled={isTesting || !formData.apiUrl || !formData.apiKey}
            className="flex-1 bg-[#1f1f1f] text-white py-2.5 rounded-lg font-semibold hover:bg-[#2a2a2a] transition-colors border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isTesting && <Loader2 size={16} className="animate-spin" />}
            {isTesting ? "测试中..." : "测试连接"}
          </button>
          <button
            onClick={handleSaveApiSettings}
            disabled={isSaving}
            className="flex-1 bg-[#3fda8c] text-black py-2.5 rounded-lg font-semibold hover:bg-[#35c77a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            {isSaving ? "保存中..." : "保存配置"}
          </button>
          {(formData.apiUrl || formData.apiKey) && (
            <button
              onClick={handleDeleteApiSettings}
              disabled={isDeleting}
              className="bg-red-500/10 text-red-400 py-2.5 px-4 rounded-lg font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-red-500/20"
            >
              {isDeleting && <Loader2 size={16} className="animate-spin" />}
              {isDeleting ? "删除中..." : "删除"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
