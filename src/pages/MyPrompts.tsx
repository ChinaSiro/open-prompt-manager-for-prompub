import { useState, useEffect } from "react";
import { Edit, Trash2, Lock, Search, X, EyeOff } from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import { EditorHeader } from "../components/EditorHeader";
import { MyPromptsListSkeleton } from "../components/MyPromptItemSkeleton";
import { useToast } from "../contexts/ToastContext";
import {
  getAllCategories,
  getAllAIModels,
  deletePrompt,
  publishPrompt as publishPromptLocal,
  unpublishPrompt as unpublishPromptLocal,
  filterPrompts,
  getPromptCounts,
  getCategoryById,
  getAIModelBySlug,
  type Prompt,
  type Category,
  type AIModel,
} from "../services/localStorage";

const tabs = [
  { id: "all", label: "所有创作" },
  { id: "published", label: "已发布" },
  { id: "draft", label: "草稿" },
];

interface DisplayPrompt extends Prompt {
  category: { id: number; name: string; slug: string } | null;
  ai_model?: { id: number; slug: string; name: string; provider: string } | null;
}

export function MyPrompts() {
  const [activeTab, setActiveTab] = useState("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<DisplayPrompt | null>(
    null,
  );
  const navigate = useNavigate();
  const { showToast } = useToast();

  // 数据状态
  const [prompts, setPrompts] = useState<DisplayPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // 统计数据
  const [counts, setCounts] = useState({
    all: 0,
    published: 0,
    draft: 0,
  });

  // 搜索和筛选状态
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("所有提示词");
  const [selectedModel, setSelectedModel] = useState("所有模型");

  // 元数据（分类和模型）
  const [categories, setCategories] = useState<Category[]>([]);
  const [aiModels, setAIModels] = useState<AIModel[]>([]);

  // 加载元数据
  useEffect(() => {
    setCategories(getAllCategories());
    setAIModels(getAllAIModels());
  }, []);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // 加载数据
  useEffect(() => {
    setIsLoading(true);

    try {
      const status =
        activeTab === "all"
          ? undefined
          : activeTab === "published"
            ? "published"
            : "draft";

      const filteredPrompts = filterPrompts({
        status: status as "all" | "draft" | "published" | undefined,
        search: searchKeyword.trim() || undefined,
        categorySlug:
          selectedCategory !== "所有提示词" ? selectedCategory : undefined,
        aiModelSlug: selectedModel !== "所有模型" ? selectedModel : undefined,
      });

      // 转换为 DisplayPrompt 格式
      const displayPrompts: DisplayPrompt[] = filteredPrompts.map((p) => ({
        ...p,
        category: p.categoryId ? getCategoryById(p.categoryId) : null,
        ai_model: p.aiModelSlug ? getAIModelBySlug(p.aiModelSlug) : undefined,
      }));

      setPrompts(displayPrompts);
    } catch (err) {
      console.error("加载提示词异常:", err);
      showToast("加载失败，请重试", "error");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchKeyword, selectedCategory, selectedModel, showToast]);

  // 加载统计数据
  useEffect(() => {
    const counts = getPromptCounts();
    setCounts(counts);
  }, [prompts]); // 当 prompts 变化时更新统计

  const handleDelete = (prompt: DisplayPrompt) => {
    setSelectedPrompt(prompt);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedPrompt) return;

    setIsDeleting(true);
    try {
      const success = deletePrompt(selectedPrompt.id);

      if (success) {
        // 删除成功，重新加载数据
        const filteredPrompts = filterPrompts({
          status:
            activeTab === "all"
              ? undefined
              : activeTab === "published"
                ? "published"
                : "draft",
        });

        const displayPrompts: DisplayPrompt[] = filteredPrompts.map((p) => ({
          ...p,
          category: p.categoryId ? getCategoryById(p.categoryId) : null,
          ai_model: p.aiModelSlug ? getAIModelBySlug(p.aiModelSlug) : undefined,
        }));

        setPrompts(displayPrompts);
        setShowDeleteDialog(false);
        setSelectedPrompt(null);
        showToast("删除成功", "success");
      } else {
        showToast("删除失败：未找到该提示词", "error");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublish = (prompt: DisplayPrompt) => {
    setSelectedPrompt(prompt);
    setShowPublishDialog(true);
  };

  const confirmPublish = async () => {
    if (!selectedPrompt) return;

    setIsPublishing(true);
    try {
      const updated = publishPromptLocal(selectedPrompt.id);

      if (updated) {
        // 重新加载数据
        const filteredPrompts = filterPrompts({
          status:
            activeTab === "all"
              ? undefined
              : activeTab === "published"
                ? "published"
                : "draft",
        });

        const displayPrompts: DisplayPrompt[] = filteredPrompts.map((p) => ({
          ...p,
          category: p.categoryId ? getCategoryById(p.categoryId) : null,
          ai_model: p.aiModelSlug ? getAIModelBySlug(p.aiModelSlug) : undefined,
        }));

        setPrompts(displayPrompts);
        setShowPublishDialog(false);
        setSelectedPrompt(null);
        showToast("发布成功", "success");
      } else {
        showToast("发布失败：未找到该提示词", "error");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = (prompt: DisplayPrompt) => {
    setSelectedPrompt(prompt);
    setShowUnpublishDialog(true);
  };

  const confirmUnpublish = async () => {
    if (!selectedPrompt) return;

    setIsPublishing(true);
    try {
      const updated = unpublishPromptLocal(selectedPrompt.id);

      if (updated) {
        // 重新加载数据
        const filteredPrompts = filterPrompts({
          status:
            activeTab === "all"
              ? undefined
              : activeTab === "published"
                ? "published"
                : "draft",
        });

        const displayPrompts: DisplayPrompt[] = filteredPrompts.map((p) => ({
          ...p,
          category: p.categoryId ? getCategoryById(p.categoryId) : null,
          ai_model: p.aiModelSlug ? getAIModelBySlug(p.aiModelSlug) : undefined,
        }));

        setPrompts(displayPrompts);
        setShowUnpublishDialog(false);
        setSelectedPrompt(null);
        showToast("已设为私人", "success");
      } else {
        showToast("设为私人失败：未找到该提示词", "error");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/prompt-editor/${id}`);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (value === "") {
      setSearchKeyword("");
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  const getVisibilityDisplay = (
    visibility: string,
    status: string,
  ): { label: string; color: string } => {
    if (status === "draft") {
      return { label: "私人", color: "gray" };
    }

    if (visibility === "public") {
      return { label: "公开", color: "green" };
    } else if (visibility === "private") {
      return { label: "私人", color: "gray" };
    } else {
      return { label: "不公开列出", color: "yellow" };
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white p-3 lg:p-4 flex flex-col gap-3 lg:gap-4">
      {/* Header */}
      <EditorHeader />

      {/* Tabs */}
      <div className="bg-[#2C2A2F] rounded-xl px-3 sm:px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-[18px] border transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-[#3f3f3f] border-white/10 text-white"
                  : "bg-transparent border-white/10 text-gray-400 hover:bg-[#252525] hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs ${
                  activeTab === tab.id
                    ? "bg-[#3fda8c] text-black"
                    : "bg-[#3f3f3f] text-gray-400"
                }`}
              >
                {counts[tab.id as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-[#2C2A2F] rounded-xl px-3 sm:px-4 lg:px-6 py-3 lg:py-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <Search className="text-gray-400" size={18} />
          </div>
          <input
            type="text"
            placeholder="搜索我的提示词..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="block w-full border-none pl-11 pr-10 py-2.5 text-sm font-medium text-white placeholder-gray-400 outline-none ring-transparent backdrop-blur-[30px] rounded-full bg-[#3f3f3f] focus:outline-none focus:ring-2 focus:ring-[#3fda8c]/20 transition-all"
          />
          {searchInput && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="text-gray-400 hover:text-white" size={16} />
            </button>
          )}
        </div>

        {/* Category and Model Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
            <span className="text-xs text-gray-400 whitespace-nowrap">
              分类:
            </span>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => handleCategoryChange("所有提示词")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === "所有提示词"
                    ? "bg-white text-black"
                    : "bg-[#3f3f3f] text-gray-400 hover:text-white hover:bg-[#4a4a4a]"
                }`}
              >
                所有提示词
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === category.slug
                      ? "bg-white text-black"
                      : "bg-[#3f3f3f] text-gray-400 hover:text-white hover:bg-[#4a4a4a]"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Model Filter */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-xs text-gray-400 whitespace-nowrap">
              模型:
            </span>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => handleModelChange("所有模型")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedModel === "所有模型"
                    ? "bg-white text-black"
                    : "bg-[#3f3f3f] text-gray-400 hover:text-white hover:bg-[#4a4a4a]"
                }`}
              >
                所有模型
              </button>
              {aiModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelChange(model.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedModel === model.slug
                      ? "bg-white text-black"
                      : "bg-[#3f3f3f] text-gray-400 hover:text-white hover:bg-[#4a4a4a]"
                  }`}
                >
                  {model.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-[#2C2A2F] rounded-xl p-3 sm:p-4 lg:p-6 overflow-y-auto">
        {/* 首次加载骨架屏 */}
        {isLoading && prompts.length === 0 ? (
          <MyPromptsListSkeleton count={5} />
        ) : prompts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">
              {activeTab === "all"
                ? "暂无提示词"
                : activeTab === "published"
                  ? "暂无已发布的提示词"
                  : "暂无草稿"}
            </p>
            <button
              onClick={() => navigate("/prompt-editor")}
              className="bg-[#3fda8c] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#35c77a] transition-colors"
            >
              创建第一个提示词
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {prompts.map((prompt) => {
                const visibility = getVisibilityDisplay(
                  prompt.visibility,
                  prompt.status,
                );
                const isDraft = prompt.status === "draft";

                return (
                  <div
                    key={prompt.id}
                    className="bg-[#313135] rounded-[18px] p-6 border border-white/5 hover:border-white/10 transition-all duration-300"
                    style={{ borderWidth: "0.5px" }}
                  >
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                      {/* Left: Thumbnail */}
                      <div className="flex-shrink-0 w-full md:w-auto">
                        <div className="w-full md:w-[150px] h-[180px] md:h-[210px] rounded-lg overflow-hidden bg-[#1f1f1f]">
                          {prompt.image ? (
                            <img
                              src={prompt.image}
                              alt={prompt.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                className="text-gray-600"
                              >
                                <circle
                                  cx="12"
                                  cy="8"
                                  r="5"
                                  strokeWidth="1.5"
                                />
                                <path
                                  d="M3 21c0-5 4-8 9-8s9 3 9 8"
                                  strokeWidth="1.5"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Middle: Title, Tags and Actions */}
                      <div className="flex flex-col justify-between md:h-[210px] flex-1 md:flex-none pt-1 gap-4 md:gap-0">
                        {/* Title and Visibility */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-base sm:text-lg font-semibold text-white">
                              {prompt.title}
                            </h3>
                            <span
                              className={`px-3 sm:px-4 py-1 rounded-md font-semibold text-xs sm:text-sm flex items-center gap-1.5 flex-shrink-0 ${
                                visibility.color === "green"
                                  ? "bg-[#3fda8c] text-black"
                                  : visibility.color === "gray"
                                    ? "bg-gray-600 text-white border border-gray-500"
                                    : "bg-yellow-600 text-white border border-yellow-500"
                              }`}
                            >
                              {visibility.color === "gray" && (
                                <Lock size={12} className="sm:w-3.5 sm:h-3.5" />
                              )}
                              {visibility.label}
                            </span>
                          </div>
                          {/* Category and AI Model */}
                          {(prompt.category || prompt.ai_model) && (
                            <div className="flex flex-wrap items-center gap-2">
                              {prompt.category && (
                                <span className="px-2.5 py-1 rounded-md bg-[#2a2a35] text-[#3fda8c] text-xs font-medium border border-[#3fda8c]/20">
                                  {prompt.category.name}
                                </span>
                              )}
                              {prompt.ai_model && (
                                <span className="px-2.5 py-1 rounded-md bg-[#2a2a35] text-blue-400 text-xs font-medium border border-blue-400/20">
                                  {prompt.ai_model.name}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions - aligned to bottom */}
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          {isDraft ? (
                            <button
                              onClick={() => handlePublish(prompt)}
                              className="flex items-center gap-1.5 sm:gap-2 rounded-[18px] border border-[#3fda8c]/30 bg-[#1f1f1f] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#3fda8c] hover:bg-[#252525] hover:border-[#3fda8c]/50 transition-all"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="sm:w-4 sm:h-4"
                              >
                                <path
                                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span>发布</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnpublish(prompt)}
                              className="flex items-center gap-1.5 sm:gap-2 rounded-[18px] border border-gray-500/30 bg-[#1f1f1f] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-400 hover:bg-[#252525] hover:border-gray-500/50 transition-all"
                            >
                              <EyeOff size={14} className="sm:w-4 sm:h-4" />
                              <span>设为私人</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleEdit(prompt.id)}
                            className="flex items-center gap-1.5 sm:gap-2 rounded-[18px] border border-white/10 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#3f3f3f] hover:bg-[#4a4a4a] transition-colors"
                          >
                            <Edit size={14} className="sm:w-4 sm:h-4" />
                            <span>编辑</span>
                          </button>
                          <button
                            onClick={() => handleDelete(prompt)}
                            className="flex items-center gap-1.5 sm:gap-2 rounded-[18px] border border-white/10 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#252525] transition-colors"
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                            <span>删除</span>
                          </button>
                        </div>
                      </div>

                      {/* Right side - Stats */}
                      <div className="flex-1 flex flex-col md:min-h-[210px] justify-center py-1 w-full md:w-auto">
                        {/* Stats */}
                        <div className="flex gap-6 sm:gap-8 lg:gap-16 justify-center md:justify-end items-center">
                          <div className="flex flex-col items-center">
                            <div className="text-xl sm:text-2xl lg:text-[30px] font-bold text-white mb-1 leading-none">
                              {prompt.statistics.views}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 leading-tight">
                              浏览量
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-xl sm:text-2xl lg:text-[30px] font-bold text-white mb-1 leading-none">
                              {prompt.statistics.uses}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 leading-tight">
                              使用次数
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-xl sm:text-2xl lg:text-[30px] font-bold text-white mb-1 leading-none">
                              {prompt.statistics.favorites}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500 leading-tight">
                              收藏数
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="删除提示词"
        message={`确定要删除「${selectedPrompt?.title || ""}」吗？此操作无法撤销。`}
        confirmText={isDeleting ? "删除中..." : "删除"}
        cancelText="取消"
        type="delete"
      />

      {/* Publish Confirm Dialog */}
      <ConfirmDialog
        isOpen={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        onConfirm={confirmPublish}
        title="发布提示词"
        message={`确定要发布「${selectedPrompt?.title || ""}」吗？发布后任何人都可以看到您分享的提示词。`}
        confirmText={isPublishing ? "发布中..." : "发布"}
        cancelText="取消"
        type="publish"
      />

      {/* Unpublish Confirm Dialog */}
      <ConfirmDialog
        isOpen={showUnpublishDialog}
        onClose={() => setShowUnpublishDialog(false)}
        onConfirm={confirmUnpublish}
        title="设为私人"
        message={`确定要将「${selectedPrompt?.title || ""}」设为私人吗？设为私人后将变为草稿状态，不再公开显示。`}
        confirmText={isPublishing ? "设置中..." : "设为私人"}
        cancelText="取消"
        type="delete"
      />
    </div>
  );
}
