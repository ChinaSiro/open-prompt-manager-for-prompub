import { useState, useEffect, useRef } from "react";
import { FileCode, Send as SendIcon, Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EditorHeader } from "../components/EditorHeader";
import { useToast } from "../contexts/ToastContext";
import { TabButton } from "../components/PromptEditor/TabButton";
import { MessageIcon } from "../components/PromptEditor/MessageIcon";
import { EditorSkeleton } from "../components/PromptEditor/EditorSkeleton";
import { ChatTestingContent } from "../components/PromptEditor/ChatTestingContent";
import { DefinitionTab } from "../components/PromptEditor/DefinitionTab";
import { APITab } from "../components/PromptEditor/APITab";
import type { PromptFormData } from "../components/PromptEditor/types";
import {
  getAllCategories,
  getAllAIModels,
  getPromptById,
  savePrompt,
  publishPrompt as publishPromptLocal,
  unpublishPrompt as unpublishPromptLocal,
  type Category,
  type AIModel,
} from "../services/localStorage";
import { getEncryptedConfig } from "../utils/encryption";

export function PromptEditor() {
  const { id } = useParams();
  const promptId = id ? parseInt(id) : undefined;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"definition" | "api" | "chat">(
    "definition",
  );
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  // 元数据
  const [categories, setCategories] = useState<Category[]>([]);
  const [aiModels, setAIModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  // 表单数据
  const [currentPromptId, setCurrentPromptId] = useState<number | undefined>(
    promptId,
  );

  const [formData, setFormData] = useState<PromptFormData>({
    title: "",
    description: "",
    content: "",
    apiUrl: "",
    apiKey: "",
  });

  // 图片相关
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 分类
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // 保存状态
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(!!promptId);

  // 文章状态
  const [promptStatus, setPromptStatus] = useState<"draft" | "published">(
    "draft",
  );
  const [promptVisibility, setPromptVisibility] = useState<
    "public" | "private"
  >("public");

  // 加载元数据
  useEffect(() => {
    setCategories(getAllCategories());
    setAIModels(getAllAIModels());
  }, []);

  // 加载用户 API 设置（从本地加密存储）
  const loadUserApiSettings = async () => {
    try {
      const apiUrl = (await getEncryptedConfig("encrypted_api_url")) || "";
      const apiKey = (await getEncryptedConfig("encrypted_api_key")) || "";

      setFormData((prev) => ({
        ...prev,
        apiUrl,
        apiKey,
      }));
    } catch (error) {
      console.error("加载 API 设置失败:", error);
    }
  };

  // 加载 API 设置
  useEffect(() => {
    loadUserApiSettings();
  }, []);

  // 监听路由参数变化
  useEffect(() => {
    const newId = promptId;

    // 如果从有 ID 变为无 ID（点击新建按钮）
    if (currentPromptId && !newId) {
      // 重置表单
      setFormData((prev) => ({
        title: "",
        description: "",
        content: "",
        apiUrl: prev.apiUrl, // 保留 API 配置
        apiKey: prev.apiKey,
      }));
      setCoverImage(null);
      setSelectedCategory(null);
      setSelectedModel(null);
      setCurrentPromptId(undefined);
      setPromptStatus("draft");
      setPromptVisibility("public");
    } else if (newId !== currentPromptId) {
      // ID 变化了，更新 currentPromptId
      setCurrentPromptId(newId);
      if (newId) {
        setIsLoading(true);
      }
    }
  }, [promptId, currentPromptId]);

  // 加载提示词（编辑模式）
  useEffect(() => {
    if (currentPromptId) {
      setIsLoading(true);
      try {
        const prompt = getPromptById(currentPromptId);
        if (prompt) {
          setFormData((prev) => ({
            ...prev,
            title: prompt.title,
            description: prompt.description,
            content: prompt.content,
            // apiUrl 和 apiKey 保持本地存储的值
          }));

          setPromptStatus(prompt.status);
          setPromptVisibility(prompt.visibility);

          if (prompt.image) {
            setCoverImage(prompt.image);
          }

          if (prompt.categoryId) {
            setSelectedCategory(prompt.categoryId);
          }

          if (prompt.aiModelSlug) {
            const model = aiModels.find((m) => m.slug === prompt.aiModelSlug);
            if (model) {
              setSelectedModel(model);
            }
          }
        } else {
          showToast("未找到该提示词", "error");
          navigate("/my-prompts");
        }
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentPromptId, aiModels, navigate, showToast]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      showToast("图片大小不能超过 5MB", "error");
      return;
    }

    // 检查文件类型
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast("仅支持 JPG、PNG、WEBP 格式的图片", "error");
      return;
    }

    // 预览图片（转为 base64）
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverImage(e.target?.result as string);
      showToast("图片已选择", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (): Promise<number | null> => {
    // 草稿保存时只验证标题和内容
    if (!formData.title.trim()) {
      showToast("请填写提示词名称", "error");
      return null;
    }

    if (!formData.content.trim()) {
      showToast("请填写提示词内容", "error");
      return null;
    }

    setIsSaving(true);
    try {
      const savedPrompt = savePrompt({
        id: currentPromptId,
        title: formData.title,
        description: formData.description,
        content: formData.content,
        image: coverImage || undefined,
        categoryId: selectedCategory || undefined,
        aiModelSlug: selectedModel?.slug,
        status: promptStatus,
        visibility: promptVisibility,
        statistics: {
          views: 0,
          uses: 0,
          favorites: 0,
        },
      });

      // 更新当前 ID
      setCurrentPromptId(savedPrompt.id);
      setPromptStatus(savedPrompt.status);
      setPromptVisibility(savedPrompt.visibility);

      // 如果是新建的草稿，更新 URL
      if (!currentPromptId) {
        navigate(`/prompt-editor/${savedPrompt.id}`, { replace: true });
      }

      showToast("保存成功", "success");
      return savedPrompt.id;
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = () => {
    const isPublished = promptStatus === "published";

    // 如果是已发布，点击后应该设为私人（变回草稿）
    if (isPublished) {
      setShowPublishDialog(true);
      return;
    }

    // 草稿状态，发布前需要检查必填项
    if (!formData.title.trim()) {
      showToast("请填写提示词名称", "error");
      return;
    }
    if (!formData.content.trim()) {
      showToast("请填写提示词内容", "error");
      return;
    }
    if (!selectedCategory) {
      showToast("请选择分类", "error");
      return;
    }
    if (!selectedModel) {
      showToast("请选择 AI 模型", "error");
      return;
    }
    if (!formData.description.trim()) {
      showToast("请填写介绍", "error");
      return;
    }

    setShowPublishDialog(true);
  };

  const confirmPublish = async () => {
    const isPublished = promptStatus === "published";

    // 如果是已发布，设为私人（变回草稿）
    if (isPublished) {
      if (!currentPromptId) {
        showToast("无效的提示词ID", "error");
        setShowPublishDialog(false);
        return;
      }

      setIsPublishing(true);
      try {
        const updated = unpublishPromptLocal(currentPromptId);
        setShowPublishDialog(false);

        if (updated) {
          showToast("已设为私人！", "success");
          setPromptStatus("draft");
          setPromptVisibility("private");
        } else {
          showToast("操作失败", "error");
        }
      } finally {
        setIsPublishing(false);
      }
      return;
    }

    // 草稿状态，先保存再发布
    setIsPublishing(true);
    try {
      // 先保存
      const savedPrompt = savePrompt({
        id: currentPromptId,
        title: formData.title,
        description: formData.description,
        content: formData.content,
        image: coverImage || undefined,
        categoryId: selectedCategory || undefined,
        aiModelSlug: selectedModel?.slug,
        status: "draft",
        visibility: promptVisibility,
        statistics: {
          views: 0,
          uses: 0,
          favorites: 0,
        },
      });

      // 然后发布
      const published = publishPromptLocal(savedPrompt.id);

      setShowPublishDialog(false);

      if (published) {
        showToast("发布成功！", "success");
        setPromptStatus("published");
        setPromptVisibility("public");
        setCurrentPromptId(published.id);

        // 如果是新建的，更新 URL
        if (!currentPromptId) {
          navigate(`/prompt-editor/${published.id}`, { replace: true });
        }
      } else {
        showToast("发布失败", "error");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen bg-[#1e1e1e] text-white p-3 lg:p-4 flex flex-col gap-3 lg:gap-4 lg:overflow-hidden">
      {/* Header */}
      <EditorHeader />

      {/* Mobile Tabs */}
      <div className="lg:hidden bg-[#2C2A2F] rounded-xl">
        <div className="flex overflow-x-auto no-scrollbar">
          <TabButton
            icon={<FileCode size={18} />}
            label="提示词"
            active={activeTab === "definition"}
            onClick={() => setActiveTab("definition")}
          />
          <TabButton
            icon={<MessageIcon />}
            label="对话"
            active={activeTab === "chat"}
            onClick={() => setActiveTab("chat")}
          />
          <TabButton
            icon={<FileCode size={18} />}
            label="调试API"
            active={activeTab === "api"}
            onClick={() => setActiveTab("api")}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 lg:gap-4 min-h-0 lg:overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-64 bg-[#2C2A2F] rounded-xl flex flex-col overflow-hidden hidden lg:flex">
          <nav className="flex-1 p-4 overflow-y-auto">
            <TabButton
              icon={<FileCode size={20} />}
              label="提示词"
              active={activeTab === "definition"}
              onClick={() => setActiveTab("definition")}
            />
            <TabButton
              icon={<FileCode size={20} />}
              label="调试API"
              active={activeTab === "api"}
              onClick={() => setActiveTab("api")}
            />
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-[#1f1f1f] text-white py-2 rounded-lg font-semibold hover:bg-[#2a2a2a] transition-colors border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {isSaving ? "保存中..." : "保存"}
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className={`w-full py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                promptStatus === "published"
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
                ? promptStatus === "published"
                  ? "处理中..."
                  : "发布中..."
                : promptStatus === "published"
                  ? "设为私人"
                  : "发布"}
            </button>
          </div>
        </aside>

        {/* Center Content */}
        <main className="flex-1 bg-[#2C2A2F] rounded-xl flex flex-col lg:overflow-hidden">
          {activeTab === "chat" ? (
            <div className="lg:hidden flex-1 flex flex-col overflow-hidden">
              <ChatTestingContent systemPrompt={formData.content} />
            </div>
          ) : (
            <div className="flex-1 w-full p-4 lg:p-8 overflow-y-auto no-scrollbar">
              {activeTab === "definition" &&
                (isLoading ? (
                  <EditorSkeleton />
                ) : (
                  <DefinitionTab
                    formData={formData}
                    setFormData={setFormData}
                    coverImage={coverImage ? { url: coverImage } : null}
                    onImageSelect={() => fileInputRef.current?.click()}
                    isUploading={false}
                    onSave={handleSave}
                    onPublish={handlePublish}
                    isSaving={isSaving}
                    isPublishing={isPublishing}
                    metadata={{
                      categories: categories.map((c) => ({
                        ...c,
                        count: 0,
                        description: c.description,
                      })),
                      ai_models: aiModels.map((m) => ({
                        ...m,
                        description: "",
                        supports_vision: false,
                        context_length: 0,
                      })),
                      tags: [],
                      visibility_options: [],
                    }}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedModel={selectedModel}
                    setSelectedModel={(model) => {
                      setSelectedModel(model);
                    }}
                    promptStatus={promptStatus}
                  />
                ))}
              {activeTab === "api" && (
                <APITab
                  formData={formData}
                  setFormData={setFormData}
                  onApiConfigDeleted={() => {
                    setFormData((prev) => ({
                      ...prev,
                      apiUrl: "",
                      apiKey: "",
                    }));
                  }}
                />
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar - Chat Testing */}
        <aside className="w-full lg:w-96 bg-[#2C2A2F] rounded-xl flex-col overflow-hidden hidden lg:flex">
          <ChatTestingContent systemPrompt={formData.content} />
        </aside>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Publish Confirm Dialog */}
      <ConfirmDialog
        isOpen={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        onConfirm={confirmPublish}
        title={
          promptStatus === "published" ? "设为私人" : "发布提示词"
        }
        message={
          promptStatus === "published"
            ? "设为私人后将变为草稿状态，不再公开显示。您随时可以重新发布。"
            : "发布后任何人都可以看到您分享的提示词，您随时可以设为私人。"
        }
        confirmText={
          isPublishing
            ? promptStatus === "published"
              ? "处理中..."
              : "发布中..."
            : promptStatus === "published"
              ? "设为私人"
              : "发布"
        }
        cancelText="取消"
        type="publish"
      />
    </div>
  );
}
