/**
 * LocalStorage 服务 - 管理 prompts 和 categories
 */

// ============= 类型定义 =============

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface AIModel {
  id: number;
  slug: string;
  name: string;
  provider: string;
}

export interface Prompt {
  id: number;
  title: string;
  description: string;
  content: string;
  image?: string; // 图片 URL 或 base64
  categoryId?: number;
  aiModelSlug?: string;
  status: "draft" | "published";
  visibility: "public" | "private";
  statistics: {
    views: number;
    uses: number;
    favorites: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ============= 存储键 =============

const STORAGE_KEYS = {
  PROMPTS: "prompts",
  CATEGORIES: "categories",
  AI_MODELS: "ai_models",
  NEXT_ID: "next_prompt_id",
};

// ============= 默认数据（从环境变量读取） =============

// 从环境变量读取分类配置
function loadCategoriesFromEnv(): Category[] {
  try {
    const envCategories = import.meta.env.VITE_CATEGORIES;
    if (envCategories) {
      return JSON.parse(envCategories);
    }
  } catch (error) {
    console.error("Failed to parse VITE_CATEGORIES:", error);
  }

  // 默认分类（如果环境变量未设置）
  return [
    { id: 1, name: "写作", slug: "writing", description: "写作相关提示词" },
    { id: 2, name: "编程", slug: "coding", description: "编程相关提示词" },
    { id: 3, name: "创意", slug: "creative", description: "创意相关提示词" },
    { id: 4, name: "商务", slug: "business", description: "商务相关提示词" },
    { id: 5, name: "教育", slug: "education", description: "教育相关提示词" },
    { id: 6, name: "其他", slug: "other", description: "其他提示词" },
  ];
}

// 从环境变量读取 AI 模型配置
function loadAIModelsFromEnv(): AIModel[] {
  try {
    const envModels = import.meta.env.VITE_AI_MODELS;
    if (envModels) {
      return JSON.parse(envModels);
    }
  } catch (error) {
    console.error("Failed to parse VITE_AI_MODELS:", error);
  }

  // 默认模型（如果环境变量未设置）
  return [
    { id: 1, slug: "gpt-4", name: "GPT-4", provider: "OpenAI" },
    { id: 2, slug: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
    { id: 3, slug: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic" },
    { id: 4, slug: "claude-3-sonnet", name: "Claude 3 Sonnet", provider: "Anthropic" },
    { id: 5, slug: "gemini-pro", name: "Gemini Pro", provider: "Google" },
  ];
}

const DEFAULT_CATEGORIES = loadCategoriesFromEnv();
const DEFAULT_AI_MODELS = loadAIModelsFromEnv();

// ============= 初始化 =============

function initializeStorage() {
  // 始终从环境变量更新分类和 AI 模型配置
  localStorage.setItem(
    STORAGE_KEYS.CATEGORIES,
    JSON.stringify(DEFAULT_CATEGORIES)
  );

  localStorage.setItem(
    STORAGE_KEYS.AI_MODELS,
    JSON.stringify(DEFAULT_AI_MODELS)
  );

  // 初始化提示词列表（只在第一次时创建）
  if (!localStorage.getItem(STORAGE_KEYS.PROMPTS)) {
    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify([]));
  }

  // 初始化 ID 计数器（只在第一次时创建）
  if (!localStorage.getItem(STORAGE_KEYS.NEXT_ID)) {
    localStorage.setItem(STORAGE_KEYS.NEXT_ID, "1");
  }
}

// 自动初始化
initializeStorage();

// ============= 辅助函数 =============

function getNextId(): number {
  const nextId = parseInt(localStorage.getItem(STORAGE_KEYS.NEXT_ID) || "1");
  localStorage.setItem(STORAGE_KEYS.NEXT_ID, (nextId + 1).toString());
  return nextId;
}

// ============= Prompts 操作 =============

export function getAllPrompts(): Prompt[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROMPTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("读取提示词失败:", error);
    return [];
  }
}

export function getPromptById(id: number): Prompt | null {
  const prompts = getAllPrompts();
  return prompts.find((p) => p.id === id) || null;
}

export function savePrompt(prompt: Omit<Prompt, "id" | "createdAt" | "updatedAt"> & { id?: number }): Prompt {
  const prompts = getAllPrompts();
  const now = new Date().toISOString();

  if (prompt.id) {
    // 更新现有提示词
    const index = prompts.findIndex((p) => p.id === prompt.id);
    if (index !== -1) {
      const updatedPrompt: Prompt = {
        ...prompts[index],
        ...prompt,
        id: prompt.id,
        updatedAt: now,
      };
      prompts[index] = updatedPrompt;
      localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
      return updatedPrompt;
    }
  }

  // 创建新提示词
  const newPrompt: Prompt = {
    ...prompt,
    id: prompt.id || getNextId(),
    createdAt: now,
    updatedAt: now,
    statistics: prompt.statistics || {
      views: 0,
      uses: 0,
      favorites: 0,
    },
  };

  prompts.push(newPrompt);
  localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
  return newPrompt;
}

export function deletePrompt(id: number): boolean {
  const prompts = getAllPrompts();
  const filteredPrompts = prompts.filter((p) => p.id !== id);

  if (filteredPrompts.length === prompts.length) {
    return false; // 未找到要删除的提示词
  }

  localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(filteredPrompts));
  return true;
}

export function publishPrompt(id: number): Prompt | null {
  const prompts = getAllPrompts();
  const index = prompts.findIndex((p) => p.id === id);

  if (index === -1) return null;

  prompts[index].status = "published";
  prompts[index].visibility = "public";
  prompts[index].updatedAt = new Date().toISOString();

  localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
  return prompts[index];
}

export function unpublishPrompt(id: number): Prompt | null {
  const prompts = getAllPrompts();
  const index = prompts.findIndex((p) => p.id === id);

  if (index === -1) return null;

  prompts[index].status = "draft";
  prompts[index].visibility = "private";
  prompts[index].updatedAt = new Date().toISOString();

  localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
  return prompts[index];
}

// ============= 搜索和筛选 =============

export interface FilterOptions {
  status?: "all" | "draft" | "published";
  search?: string;
  categorySlug?: string;
  aiModelSlug?: string;
}

export function filterPrompts(options: FilterOptions = {}): Prompt[] {
  let prompts = getAllPrompts();

  // 状态筛选
  if (options.status && options.status !== "all") {
    prompts = prompts.filter((p) => p.status === options.status);
  }

  // 搜索
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    prompts = prompts.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.content.toLowerCase().includes(searchLower)
    );
  }

  // 分类筛选
  if (options.categorySlug) {
    const category = getCategoryBySlug(options.categorySlug);
    if (category) {
      prompts = prompts.filter((p) => p.categoryId === category.id);
    }
  }

  // AI 模型筛选
  if (options.aiModelSlug) {
    prompts = prompts.filter((p) => p.aiModelSlug === options.aiModelSlug);
  }

  // 按更新时间降序排序
  prompts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return prompts;
}

// ============= Categories 操作 =============

export function getAllCategories(): Category[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  } catch (error) {
    console.error("读取分类失败:", error);
    return DEFAULT_CATEGORIES;
  }
}

export function getCategoryById(id: number): Category | null {
  const categories = getAllCategories();
  return categories.find((c) => c.id === id) || null;
}

export function getCategoryBySlug(slug: string): Category | null {
  const categories = getAllCategories();
  return categories.find((c) => c.slug === slug) || null;
}

// ============= AI Models 操作 =============

export function getAllAIModels(): AIModel[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.AI_MODELS);
    return data ? JSON.parse(data) : DEFAULT_AI_MODELS;
  } catch (error) {
    console.error("读取 AI 模型失败:", error);
    return DEFAULT_AI_MODELS;
  }
}

export function getAIModelBySlug(slug: string): AIModel | null {
  const models = getAllAIModels();
  return models.find((m) => m.slug === slug) || null;
}

// ============= 统计 =============

export function getPromptCounts() {
  const prompts = getAllPrompts();
  return {
    all: prompts.length,
    published: prompts.filter((p) => p.status === "published").length,
    draft: prompts.filter((p) => p.status === "draft").length,
  };
}
