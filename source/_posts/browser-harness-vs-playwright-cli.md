---
title: Browser Harness vs Playwright CLI - AI 浏览器自动化工具深度对比
date: 2026-05-26 19:00:00
categories: AI工具箱
tags:
  - AI
  - 浏览器自动化
  - Python
  - TypeScript
  - 开源项目
  - LLM
  - Claude Code
  - Playwright
  - CDP
cover: /img/Harness.jpg
---

## 前言

AI 编程助手（Claude Code、Copilot 等）的普及催生了一个新需求：**让 AI 操控浏览器完成复杂任务**。无论是自动化测试、数据采集，还是帮你在网页上点来点去，AI + 浏览器都成了热门组合。

最近 GitHub 上冒出两个备受关注的项目，正好代表了两种截然不同的技术路线：

| 项目 | Stars | 开发者 | 语言 | 定位 |
|------|:-----:|--------|------|------|
| **[Browser Harness](https://github.com/browser-use/browser-harness)** | 13.8k | browser-use 团队 | Python | 自愈式 CDP 套件 |
| **[Playwright CLI](https://github.com/microsoft/playwright-cli)** | 10.7k | Microsoft | TypeScript | Token 高效的 CLI 工具 |

今天就对它们做一个全面对比，帮你搞清楚哪个更适合你的场景。

---

## 项目简介

### Browser Harness

> "Self-healing harness that enables LLMs to complete any task."

Browser Harness 是一个**轻量级 CDP（Chrome DevTools Protocol）套件**，核心理念是：一个 WebSocket 直连 Chrome，中间没有任何中间层。它最独特的地方在于**自愈机制**——当 Agent 遇到缺失的辅助函数时，会自动编写并保存该函数，套件每次运行都会自我改进。

**项目数据：**
- GitHub Stars：13,800+
- 语言：Python 100%
- 协议：MIT
- 所属组织：browser-use
- 官网：https://browser-harness.com

### Playwright CLI

> "CLI for common Playwright actions. Record and generate Playwright code, inspect selectors and take screenshots."

Playwright CLI 是微软官方出品的命令行浏览器自动化工具，专门为**编码智能体**设计。它通过 SKILLs 的方式暴露 CLI 接口，核心优势是**Token 效率极高**——不会强制将页面数据塞入 LLM，相比 MCP 方式显著减少 token 消耗。

**项目数据：**
- GitHub Stars：10,700+
- 语言：TypeScript（55.1%）/ JavaScript（44.9%）
- 协议：Apache-2.0
- 开发者：Microsoft
- 当前版本：v0.1.13

---

## 技术架构对比

### Browser Harness：直连 CDP

Browser Harness 的架构极其精简，核心代码约 **1000 行，分布在 4 个核心文件**中：

```
browser-harness/
├── src/browser_harness/        # 核心包（约1000行）
├── agent-workspace/            # Agent 工作区
│   ├── agent_helpers.py        # Agent 可编辑的辅助代码
│   └── domain-skills/          # Agent 可编辑的站点技能
├── SKILL.md                    # 使用指南
└── install.md                  # 安装指南
```

**工作原理：**
1. 通过 CDP 协议直接与 Chrome 建立 WebSocket 连接
2. Agent 获取浏览器控制权后执行任务
3. 遇到缺失能力时（如文件上传），自动生成辅助代码
4. 辅助代码保存到 `agent-workspace/`，下次直接复用

### Playwright CLI：CLI + SKILLs

Playwright CLI 基于 Playwright 引擎，通过命令行接口暴露浏览器操作：

```bash
# 基本操作流程
playwright-cli open https://example.com --headed
playwright-cli type "搜索内容"
playwright-cli press Enter
playwright-cli screenshot
```

**工作原理：**
1. 通过 Playwright 引擎控制浏览器（支持 Chromium/Firefox/WebKit）
2. 每条命令执行后返回精简的页面快照
3. 通过 `ref` 标识符定位元素，避免加载完整的可访问性树
4. 支持 Session 管理，多浏览器实例隔离

### 架构差异总结

| 维度 | Browser Harness | Playwright CLI |
|------|----------------|----------------|
| 底层协议 | CDP（直连 Chrome） | Playwright Engine |
| 浏览器支持 | 仅 Chrome | Chromium + Firefox + WebKit |
| 连接方式 | WebSocket | CLI 进程调用 |
| Agent 集成 | Claude Code / Codex | Claude Code / Copilot |
| 代码量 | ~1000 行（极简） | 完整 Playwright 生态 |

---

## 核心特性对比

### 自愈能力 vs Token 效率

**Browser Harness 的杀手锏：自愈机制**

这是两个项目最大的差异化所在。Browser Harness 让 Agent 自己"进化"：

```
Agent 想上传文件
    ↓
agent_helpers.py 中没有上传函数
    ↓
Agent 自动编写上传函数并保存
    ↓
下次遇到相同需求，直接复用 ✓
```

此外还有 **Domain Skills**——Agent 会为特定网站（GitHub、LinkedIn、Amazon 等）生成专用技能包。这些技能包存放在 `agent-workspace/domain-skills/<site>/` 目录下，访问同一站点时自动加载。这意味着**用得越多，它越聪明**。

**Playwright CLI 的杀手锏：Token 效率**

Playwright CLI 从设计之初就考虑了 token 消耗问题。与 MCP 方式需要将完整的页面可访问性树加载到上下文中不同，CLI 方式只返回精简的命令输出。

| 方式 | Token 消耗 | 适用场景 |
|------|:----------:|---------|
| Playwright MCP | 高（加载完整页面结构） | 长时间自主工作流 |
| Playwright CLI + SKILLs | **低（精简命令输出）** | 日常浏览器自动化 |
| Browser Harness | 中（CDP 原始数据） | 需要灵活性的场景 |

### 功能覆盖对比

| 功能 | Browser Harness | Playwright CLI |
|------|:--------------:|:--------------:|
| 页面导航 | ✅ | ✅ |
| 元素交互（点击/输入） | ✅ | ✅ |
| 键盘鼠标操作 | ✅ | ✅ |
| 截图 | ✅ | ✅ |
| 文件上传（自愈） | ✅ 自动生成 | ✅ 内置 |
| 多浏览器支持 | ❌ 仅 Chrome | ✅ 三大引擎 |
| Session 管理 | ❌ | ✅ 多实例隔离 |
| 可视化仪表盘 | ❌ | ✅ `show` 命令 |
| 持久化配置 | ❌ | ✅ `--persistent` |
| Cookie/存储管理 | ❌ | ✅ |
| 网络拦截 | ✅ CDP 原生 | ✅ |
| Cloud 浏览器 | ✅ Browser Use Cloud | ❌ |
| Domain Skills | ✅ Agent 自动生成 | ❌ |
| 自愈能力 | ✅ | ❌ |
| 代码录制 | ❌ | ✅ |
| 无头模式 | ✅ | ✅ |
| 有头模式 | ✅ | ✅ |

---

## 安装与使用

### Browser Harness 安装

**方式一：Agent 自动安装（推荐）**

将以下提示词粘贴到 Claude Code 或 Codex 中：

```
Set up https://github.com/browser-use/browser-harness for me.
Read install.md and follow the steps.
```

Agent 会自动完成安装和浏览器连接配置。

**方式二：手动安装**

```bash
# 克隆项目
git clone https://github.com/browser-use/browser-harness.git
cd browser-harness

# 按照 install.md 完成安装
```

安装后需要在 Chrome 中启用远程调试（`chrome://inspect/#remote-debugging`），并允许 Agent 附加调试。

### Playwright CLI 安装

```bash
# 全局安装
npm install -g @playwright/cli@latest

# 验证安装
playwright-cli --help

# 安装 Skills（供 Claude Code / Copilot 使用）
playwright-cli install --skills
```

安装完成后可以直接在智能体中使用：

```
Use playwright skills to test https://demo.playwright.dev/todomvc/.
Take screenshots for all successful and failing scenarios.
```

### 安装对比

| 维度 | Browser Harness | Playwright CLI |
|------|----------------|----------------|
| 前置依赖 | Python + Chrome | Node.js 18+ |
| 安装复杂度 | 中等（需配置 CDP） | 简单（一行命令） |
| 浏览器配置 | 需手动开启远程调试 | 自动管理浏览器 |
| Skills 安装 | 自动生成 | `install --skills` |

---

## AI 智能体兼容性

### Browser Harness

- **推荐**：Claude Code、Codex
- 原因：需要 Agent 具备代码生成和文件编辑能力，才能利用自愈机制
- 适用模型：Claude（最佳）、GPT-4、Gemini 等

### Playwright CLI

- **支持**：Claude Code、GitHub Copilot、任何支持 shell 命令的智能体
- 原因：通过标准 CLI 接口调用，兼容性更广
- 不依赖特定的代码生成能力

---

## 适用场景分析

### 选 Browser Harness 的场景

1. **反复操作特定网站** — Domain Skills 越用越好，适合长期使用
2. **需要连接真实浏览器** — 直接操控你的 Chrome，保留登录态和 Cookie
3. **探索性任务** — Agent 能自行编写缺失功能，灵活性极高
4. **Cloud 浏览器需求** — 内置 Browser Use Cloud，免费 3 个并发浏览器
5. **Python 技术栈** — 团队以 Python 为主

### 选 Playwright CLI 的场景

1. **自动化测试** — 微软出品，测试可靠性有保障
2. **Token 预算敏感** — CLI 方式 token 消耗显著低于 MCP
3. **需要多浏览器测试** — 支持 Chromium、Firefox、WebKit 三大引擎
4. **快速上手** — 一行 npm 安装，零配置即可使用
5. **团队协作** — 可视化仪表盘方便监控智能体操作
6. **Node.js/TypeScript 技术栈** — 原生支持

---

## 优缺点总结

### Browser Harness

**优点：**
- 🧠 自愈机制：Agent 越用越强，积累的经验自动复用
- 🎯 Domain Skills：按站点定制化，社区贡献生态
- 🔌 直连 CDP：无中间层，性能和控制力最强
- ☁️ Cloud 浏览器：免费提供云端浏览器
- 📦 极简架构：核心仅 1000 行代码

**缺点：**
- 🌐 仅支持 Chrome，无法测试 Firefox/Safari
- 📝 无正式 Release 发布，API 不稳定
- 🔧 安装配置相对复杂
- 📚 文档不够完善
- 🤖 强依赖 Agent 的代码生成能力

### Playwright CLI

**优点：**
- 🏢 微软出品，代码质量和维护有保障
- 💰 Token 效率极高，节省 API 开销
- 🌐 支持三大浏览器引擎
- 🚀 安装简单，一行命令搞定
- 📊 可视化仪表盘，方便监控
- 🧪 测试生态成熟，适合 QA 场景

**缺点：**
- 🧠 无自愈能力，功能固定
- 🌐 需要 Playwright 中间层，不如 CDP 灵活
- 📦 体积相对较大
- 🔄 无 Cloud 浏览器支持
- 🎯 无站点级别的定制化机制

---

## 快速决策指南

```
你的主要需求是什么？
│
├── 反复自动化特定网站操作 → Browser Harness（Domain Skills 越用越好）
│
├── Web 自动化测试 → Playwright CLI（微软出品，多浏览器覆盖）
│
├── 让 Claude Code 帮你操作浏览器 → 两个都行，看技术栈
│   ├── Python 技术栈 → Browser Harness
│   └── Node.js 技术栈 → Playwright CLI
│
├── 追求最低 Token 消耗 → Playwright CLI
│
├── 需要连接真实浏览器（保留登录态）→ Browser Harness
│
└── 快速原型验证 → Playwright CLI（安装更简单）
```

---

## 总结

Browser Harness 和 Playwright CLI 都是为 AI 时代设计的浏览器自动化工具，但走了完全不同的技术路线：

- **Browser Harness** 是一个"会学习的工具"——通过自愈机制和 Domain Skills，它用得越多越强。适合需要长期使用、反复操作特定网站的场景。
- **Playwright CLI** 是一个"高效可靠的工具"——微软出品，token 消耗低，多浏览器覆盖，开箱即用。适合测试、快速原型和 token 预算敏感的场景。

如果你的需求是**让 AI 帮你上网做事**，Browser Harness 的自愈能力更有想象空间。如果你的需求是**让 AI 帮你测试网站**，Playwright CLI 更稳定可靠。

两个项目都不错，关键看你的具体场景。

---

> **项目链接：**
> - Browser Harness：https://github.com/browser-use/browser-harness
> - Playwright CLI：https://github.com/microsoft/playwright-cli
