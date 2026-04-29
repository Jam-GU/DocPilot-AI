# DocPilot AI

这是一个从代码注释和设计文档自动生成技术文档的 Agent 原型，支持多人协作状态记录，并可在 PR 合并后自动刷新文档。

## 目标场景

- 从代码注释、设计文档、接口说明中提取上下文
- 生成面向研发团队的技术文档
- 在 PR 合并时自动更新文档，降低人工维护成本
- 记录多人协作过程中的贡献者、评审人、审批和备注

这个版本按业务背景来设计：团队约 15 人使用，目标是每月节省约 120 小时文档维护时间，并把文档更新及时率稳定在 95% 左右。

## 目录结构

```text
.
├── .github/workflows/update-docs.yml
├── prompts/
├── scripts/run-pr-update.js
├── src/
│   ├── collaboration-store.js
│   ├── config.js
│   ├── doc-agent.js
│   ├── index.js
│   ├── llm-provider.js
│   ├── markdown-renderer.js
│   ├── parsers.js
│   ├── repository-scanner.js
│   └── utils.js
└── generated-docs/
```

## 核心能力

### 1. 自动文档生成

- 扫描仓库中的代码文件、Markdown、YAML
- 从注释块中提取语义信息
- 从设计文档中提取标题与结构
- 组合成技术文档 Markdown

### 2. 多人协作模式

- 每次生成文档会创建一个协作 session
- session 中记录 contributors、reviewers、notes、approvals
- 可通过接口追加评审意见

### 3. PR 合并自动更新

- 提供 `/api/webhooks/github` webhook 入口
- 提供 GitHub Actions 示例工作流
- PR 合并后自动生成或更新文档

## 快速开始

### 运行服务

```bash
cp .env.example .env
npm start
```

默认监听：

```text
http://127.0.0.1:3100
```

### 手动生成文档

```bash
curl -X POST http://127.0.0.1:3100/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI 文档生成 Agent",
    "contributors": ["alice", "bob"],
    "reviewers": ["tech-writer", "team-lead"],
    "notes": ["初版覆盖 PR 自动更新与多人协作"]
  }'
```

### 追加协作评审

```bash
curl -X POST http://127.0.0.1:3100/api/review \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_xxx",
    "author": "team-lead",
    "message": "补充一下回滚策略",
    "approved": true
  }'
```

## API 概览

### `POST /api/generate`

生成技术文档。

请求字段：

- `title`
- `docId`
- `channel`
- `contributors`
- `reviewers`
- `notes`
- `changedFiles`

### `POST /api/review`

向某个协作 session 增加评审意见。

### `GET /api/sessions`

查看当前协作状态。

### `GET /api/docs/:docId`

读取生成后的 Markdown 文档。

### `POST /api/webhooks/github`

处理 GitHub PR merged 事件并自动更新文档。

## 模型接入

默认支持两种模式：

- 未配置 `OPENAI_API_KEY`：使用本地 fallback 逻辑生成摘要
- 配置 `OPENAI_API_KEY`：调用兼容 OpenAI Chat Completions 的接口生成更自然的技术概述

环境变量：

```bash
PORT=3100
HOST=127.0.0.1
DOC_AGENT_MODEL=gpt-4.1-mini
OPENAI_API_KEY=your_key
OPENAI_BASE_URL=https://api.openai.com/v1
DOC_AGENT_OUTPUT_DIR=generated-docs
DOC_AGENT_DESIGN_DOC_DIR=design
```

## 推荐下一步

1. 把当前 fallback 生成器替换成你们实际使用的模型策略
2. 把 webhook 改成校验 GitHub 签名
3. 接入 PR diff API，获取真实 changed files
4. 补充文档模板分类，例如架构文档、接口文档、变更记录
5. 接入企业 IM 或评论系统，形成多人协作闭环
