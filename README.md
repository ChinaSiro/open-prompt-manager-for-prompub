# PromPub 开源提示词管理器

> Prompt 的简写 + Pub 酒馆

有太多的优质提示词不知道安放在什么地方，所以诞生了这个提示词管理工具。

## 项目地址

- **线上 Demo**: [https://prompub.com](https://prompub.com)
- **开源仓库**: [https://github.com/ChinaSiro/open-prompt-manager-for-prompub](https://github.com/ChinaSiro/open-prompt-manager-for-prompub)

## 架构说明

- **线上版本**: 后端使用 WP API（过于复杂，未开源）
- **开源版本**: 使用 LocalStorage 本地存储（简单易用）

## 基本功能

### 私人仓库 - 管理你的海量提示词
- 搜索功能 - 快速找到你需要的提示词
- 分类筛选 - 写作/编程/创意/商务/教育等
- 模型筛选 - 支持 GPT/Claude/Gemini 等主流模型
- 状态管理 - 草稿/已发布状态切换

### 创作中心 - 实时调试提示词
- 实时预览 - 编写提示词的同时立即测试效果
- 对话调试 - 系统提示词实时更新到对话中
- 第三方 API - 支持任意兼容 OpenAI 格式的中转 API
- 安全保障 - **API KEY 不上传服务器，仅存储在浏览器本地**

## 技术栈

- **框架**: React 19.1 + TypeScript
- **构建工具**: Vite 7.1
- **样式**: Tailwind CSS 4.1
- **路由**: React Router 7.9
- **存储**: LocalStorage (浏览器本地存储)


## 快速开始

### 安装依赖

```bash
npm install
```

### 配置分类和模型（可选）

复制 `.env.example` 为 `.env`，根据需要自定义分类和 AI 模型：

```bash
# 查看配置说明
cat .env.README.md
```

### 启动开发服务器

```bash
npm run dev
```

服务器将运行在 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

## 注意事项

- **隐私安全**: 所有数据（提示词、API KEY）仅存储在本地浏览器，不会上传到任何服务器
- **自定义配置**: 可通过 `.env` 文件自定义分类和 AI 模型列表

## 开发计划 v1.1

- [ ] 数据导入/导出
  - [ ] JSON 格式导入/导出
  - [ ] 单个提示词导出
  - [ ] 批量导入/导出
- [ ] 更多功能待定...

## 贡献与反馈

欢迎提交 Issue 或 Pull Request！

## 许可证

MIT License - 本项目开源免费使用
