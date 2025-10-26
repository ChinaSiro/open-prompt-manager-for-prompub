/**
 * DefinitionTab 组件 - 提示词定义标签页
 */

import { useState } from "react";
import { ChevronDown, Upload, Loader2, Send as SendIcon } from "lucide-react";
import type { PromptFormData } from "./types";

interface Metadata {
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    description: string;
    count: number;
  }>;
  ai_models: Array<{
    id: number;
    slug: string;
    name: string;
    provider: string;
    description: string;
    supports_vision: boolean;
    context_length: number;
  }>;
  tags: string[];
  visibility_options: Array<{
    value: string;
    label: string;
    description: string;
  }>;
}

interface DefinitionTabProps {
  formData: PromptFormData;
  setFormData: React.Dispatch<React.SetStateAction<PromptFormData>>;
  coverImage: { id?: number; url: string } | null;
  onImageSelect: () => void;
  isUploading: boolean;
  onSave?: () => void;
  onPublish?: () => void;
  isSaving: boolean;
  isPublishing: boolean;
  metadata: Metadata | null;
  selectedCategory: number | null;
  setSelectedCategory: (id: number | null) => void;
  selectedModel: {
    id: number;
    slug: string;
    name: string;
    provider: string;
  } | null;
  setSelectedModel: (
    model: { id: number; slug: string; name: string; provider: string } | null,
  ) => void;
  promptStatus: "draft" | "publish" | "published" | "archived";
}

export function DefinitionTab({
  formData,
  setFormData,
  coverImage,
  onImageSelect,
  isUploading,
  onSave,
  onPublish,
  isSaving,
  isPublishing,
  metadata,
  selectedCategory,
  setSelectedCategory,
  selectedModel,
  setSelectedModel,
  promptStatus,
}: DefinitionTabProps) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">提示词</h2>

      {/* Name and Cover */}
      <div className="bg-[#252429] rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              <span className="text-orange-500">*</span> 名称
            </label>
            <input
              type="text"
              placeholder="为你的机器人提供一个唯一的名称"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              maxLength={100}
              className="w-full bg-[#2C2A2F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#3fda8c] transition-colors"
            />
            <p className="text-xs text-gray-500 mt-2">
              {formData.title.length} / 100 字符
            </p>
          </div>

          {/* Cover */}
          <div>
            <label className="block text-sm font-semibold mb-3">封面</label>
            <div className="flex gap-4 items-start">
              <div className="w-20 h-20 rounded-full bg-[#1f1f1f] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {coverImage ? (
                  <img
                    src={coverImage.url}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="text-gray-600"
                  >
                    <circle cx="12" cy="8" r="5" strokeWidth="1.5" />
                    <path d="M3 21c0-5 4-8 9-8s9 3 9 8" strokeWidth="1.5" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={onImageSelect}
                  disabled={isUploading}
                  className="bg-[#3f3f3f] text-white px-3 py-1.5 rounded-lg hover:bg-[#4a4a4a] transition-colors text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  {isUploading ? "上传中..." : "上传"}
                </button>
                <p className="text-xs text-gray-500">JPG、PNG、WEBP</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category and AI Model */}
      {metadata && (
        <div className="bg-[#252429] rounded-xl p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-3">分类</label>
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full bg-[#2C2A2F] border border-white/10 rounded-lg px-4 py-3 text-left flex items-center justify-between hover:border-[#3fda8c] transition-colors"
                >
                  <span
                    className={
                      selectedCategory ? "text-white" : "text-gray-600"
                    }
                  >
                    {selectedCategory
                      ? metadata.categories.find(
                          (c) => c.id === selectedCategory,
                        )?.name
                      : "选择分类"}
                  </span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#1f1f1f] border border-white/10 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                    {metadata.categories.map((category: { id: number; name: string; description: string }) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-[#3f3f3f] transition-colors ${
                          selectedCategory === category.id
                            ? "bg-[#3f3f3f] text-[#3fda8c]"
                            : "text-white"
                        }`}
                      >
                        <div className="font-semibold text-sm">
                          {category.name}
                        </div>
                        {category.description && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            {category.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Model */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                AI 模型
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="w-full bg-[#2C2A2F] border border-white/10 rounded-lg px-4 py-3 text-left flex items-center justify-between hover:border-[#3fda8c] transition-colors"
                >
                  <div className="truncate">
                    {selectedModel ? (
                      <>
                        <div className="text-white font-semibold text-sm truncate">
                          {selectedModel.name}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {selectedModel.provider}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-600">选择模型</span>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className="text-gray-400 flex-shrink-0 ml-2"
                  />
                </button>
                {showModelDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#1f1f1f] border border-white/10 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                    {metadata.ai_models.map((model: { id: number; slug: string; name: string; provider: string; description: string }) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          setShowModelDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-[#3f3f3f] transition-colors ${
                          selectedModel?.id === model.id ? "bg-[#3f3f3f]" : ""
                        }`}
                      >
                        <div className="font-semibold text-sm text-white">
                          {model.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {model.provider}
                        </div>
                        {model.description && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {model.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bot Intro */}
      <div className="bg-[#252429] rounded-xl p-6">
        <label className="block text-sm font-semibold mb-3">介绍</label>
        <textarea
          placeholder="这将显示在机器人卡片中并影响搜索，不会影响机器人的响应方式。"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          maxLength={500}
          rows={5}
          className="w-full bg-[#2C2A2F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#3fda8c] resize-none transition-colors"
        />
        <p className="text-xs text-gray-500 mt-2">
          {formData.description.length} / 500 字符
        </p>
      </div>

      {/* Prompt */}
      <div className="bg-[#252429] rounded-xl p-6">
        <label className="block text-sm font-semibold mb-3">
          <span className="text-orange-500">*</span> 提示词
        </label>
        <textarea
          placeholder="# 定义机器人的行为和核心人格。
使用 [#] 后跟空格来突出显示每个段落的标题。"
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          maxLength={10000}
          rows={16}
          className="w-full bg-[#2C2A2F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#3fda8c] resize-none font-mono text-sm leading-relaxed transition-colors"
        />
        <p className="text-xs text-gray-500 mt-2">
          {formData.content.length} / 10000 字符
        </p>
      </div>

      {/* Mobile Action Buttons */}
      <div className="lg:hidden space-y-3 pb-4">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full bg-[#1f1f1f] text-white py-3 rounded-lg font-semibold hover:bg-[#2a2a2a] transition-colors border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving && <Loader2 size={16} className="animate-spin" />}
          {isSaving ? "保存中..." : "保存"}
        </button>
        <button
          onClick={onPublish}
          disabled={isPublishing}
          className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            promptStatus === "published" || promptStatus === "publish"
              ? "bg-[#1f1f1f] text-gray-400 border border-gray-500/30 hover:bg-[#2a2a2a] hover:border-gray-500/50"
              : "bg-[#3fda8c] text-black hover:bg-[#35c77a]"
          }`}
        >
          {isPublishing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <SendIcon size={16} />
          )}
          {isPublishing
            ? promptStatus === "published" || promptStatus === "publish"
              ? "处理中..."
              : "发布中..."
            : promptStatus === "published" || promptStatus === "publish"
              ? "设为私人"
              : "发布"}
        </button>
      </div>
    </div>
  );
}
