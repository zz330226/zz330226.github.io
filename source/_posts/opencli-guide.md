---
title: OpenCLI 实战 - 用命令行征服全网150+网站
date: 2026-05-27 07:30:00
categories: AI工具箱
tags:
  - AI
  - OpenCLI
  - 爬虫
  - 自动化
  - 开源项目
  - 财经数据
cover: /img/opencli-guide.jpg
---

## 什么是 OpenCLI

> "Make any website your CLI."

OpenCLI 是一个 npm 工具，能把**任意网站变成你的命令行工具**。它通过适配器（Adapter）机制，为每个站点封装一套 CLI 命令，直接调用网站的 API 接口获取结构化数据。

装完之后，你的终端瞬间变成全网数据终端：

```bash
npm install -g opencli
opencli xueqiu hot-stock          # 雪球热股
opencli weibo hot                  # 微博热搜
opencli reddit hot -s stocks       # Reddit r/stocks
opencli twitter user -u elonmusk   # Twitter 用户信息
opencli bilibili subtitle <BV号>  # B站视频字幕
```

**当前规模：**
- 143 个适配器（Adapter）
- 859 个命令（Command）
- 涵盖社交媒体、财经、新闻、视频、知识社区等

## 核心使用技巧

### 基本参数

```bash
opencli <site> <command> [options]
  --window background   # 后台运行，不弹浏览器窗口（推荐）
  -f yaml               # YAML 格式化输出（推荐，方便解析）
  -f json               # JSON 格式输出
```

### 登录态问题

OpenCLI 的**私有接口依赖浏览器 Cookie**。比如雪球的 `feed`、微博的 `search`、Twitter 的 `search`，都需要先在 Chrome 中登录对应网站，OpenCLI 才能调用。

**处理策略：** 遇到 `AUTH_REQUIRED` 错误，手动在浏览器登录一次即可，后续命令复用 Cookie。

## 五大平台实战测试

### 1. B站 — 最完善的体验

B站适配器功能最齐全，视频信息、字幕提取、摘要生成都能一条命令搞定。

```bash
# 提取视频字幕（精准到时间轴）
opencli bilibili subtitle BV1oBGa6SEty -f yaml --window background

# 获取视频详情
opencli bilibili video BV1oBGa6SEty -f yaml --window background

# AI 生成视频摘要
opencli bilibili summary BV1oBGa6SEty -f yaml --window background
```

**输出示例（subtitle）：**

```yaml
subtitles:
  - time: "00:00:01"
    text: "大家好，今天我们来聊聊..."
  - time: "00:00:05"
    text: "这个话题其实在业内已经讨论很久了..."
```

**评价：⭐⭐⭐⭐⭐** 字幕 API 是原生接口，干净利落，直接拿到 SRT/VTT 格式的时间轴字幕。

### 2. 抖音 — 能用但要绕

抖音的适配器覆盖了基础功能，但**没有原生字幕 API**，和 B站相比差了一截。

```bash
# 热门话题标签
opencli douyin hashtag -f yaml --window background

# 用户主页视频列表
opencli douyin profile <用户ID> -f yaml --window background

# 搜索视频
opencli douyin videos --keyword "AI" -f yaml --window background
```

**短链接解析技巧：**

抖音分享链接形如 `https://v.douyin.com/RI9KJEWjuPc/`，不能直接传给 OpenCLI，需要先拿到真实的 `aweme_id`：

```bash
# 第一步：解析短链接拿到 aweme_id
# 用 curl 或 WebFetch 访问短链接，从重定向 URL 中提取 aweme_id
# 例如得到 7644153019826818356

# 第二步：用 browser 模式打开并提取内容
opencli browser dy open "https://www.douyin.com/video/7644153019826818356"
opencli browser dy extract
```

**评价：⭐⭐⭐☆** 基础功能可用，但短链接需要手动解析，且无原生字幕支持。口播视频的内容获取只能靠 extract 页面文本。

### 3. 雪球 — 财经数据利器

雪球适配器是财经场景的主力，公开接口无需登录，私有接口需要 Cookie。

```bash
# 热门股票（公开，无需登录）
opencli xueqiu hot-stock -f yaml --window background

# 热门讨论话题（需要登录）
opencli xueqiu hot -f yaml --window background

# 个股评论区
opencli xueqiu comments --stock sh600519 -f yaml --window background
```

**实测 hot-stock 输出：**

```yaml
stocks:
  - rank: 1
    name: "中芯国际"
    code: "SH688981"
    heat: 982341
    change: "+5.23%"
  - rank: 2
    name: "贵州茅台"
    code: "SH600519"
    heat: 876543
    change: "-1.02%"
```

**评价：⭐⭐⭐⭐☆** 公开接口稳定，热股排行数据质量高。`hot` 和 `feed` 需要登录态。

### 4. 新浪微博 — 热搜王者

微博适配器的 `hot` 命令非常稳定，热搜榜数据实时性很好。

```bash
# 热搜榜（公开，无需登录）
opencli weibo hot -f yaml --window background

# 关键词搜索（需要登录）
opencli weibo search --keyword "A股" -f yaml --window background
```

**评价：⭐⭐⭐⭐☆** 热搜榜即开即用，搜索功能需要登录。财经话题的时效性不错。

### 5. X/Twitter — 登录门槛高

Twitter 适配器功能完整，但**几乎全部需要登录态**，没有公开接口可用。

```bash
# 用户信息（需要登录）
opencli twitter user --username elonmusk -f yaml --window background

# 搜索推文（需要登录）
opencli twitter search --query "AI stocks" -f yaml --window background
```

**评价：⭐⭐⭐☆** 功能齐全但强依赖登录。登录后 user/search/timeline 都能用，数据质量高。

## 平台能力对比

| 平台 | 热榜/排行 | 搜索 | 详情 | 登录要求 | 评价 |
|------|:---------:|:----:|:----:|:--------:|:----:|
| B站 | ✅ | ❌ | ✅字幕/视频 | 无 | ⭐⭐⭐⭐⭐ |
| 抖音 | ✅ | ✅ | ✅ | 无 | ⭐⭐⭐ |
| 雪球 | ✅热股 | ✅需登录 | ✅评论 | 部分需 | ⭐⭐⭐⭐ |
| 微博 | ✅热搜 | ✅需登录 | ✅ | 部分需 | ⭐⭐⭐⭐ |
| Twitter | ❌ | ✅需登录 | ✅ | 全部需 | ⭐⭐⭐ |
| Reddit | ✅ | ✅ | ✅ | 无 | ⭐⭐⭐⭐ |

## 财经数据矩阵

把 OpenCLI 支持的所有能抓取财经信息的适配器梳理了一下，分成六大类：

### A. 专业财经平台

| 站点 | 命令示例 | 数据类型 |
|------|---------|---------|
| 雪球 xueqiu | `hot-stock` / `hot` / `comments` | A股热股、讨论、个股评论 |
| 新浪财经 finance.sina | `news` | 财经新闻 |
| 同花顺 10jqka | `hot` | 市场热点 |
| 通达信 tdx | 市场数据 | 行情报价 |
| Barchart | 美股数据 | 美股排行 |
| Yahoo Finance | 市场数据 | 全球市场 |
| Binance | `trending` | 加密货币 |

### B. 新闻资讯

| 站点 | 命令示例 | 数据类型 |
|------|---------|---------|
| 36kr | `hot` | 科技创投 |
| 今日头条 | `hot` | 综合新闻 |
| BBC | `news` | 国际新闻 |
| Reuters | `news` | 财经新闻 |
| 知乎 | `hot` | 话题讨论 |

### C. 社交媒体

| 站点 | 命令示例 | 数据类型 |
|------|---------|---------|
| 微博 weibo | `hot` / `search` | 热搜+搜索 |
| Twitter | `user` / `search` | 大V动态 |
| Reddit | `hot -s <sub>` | 海外讨论 |
| 抖音 douyin | `hashtag` / `videos` | 短视频财经内容 |
| 小红书 | 帖子数据 | 消费投资 |

### D. 知识星球 & 微信公众号

| 站点 | 数据类型 |
|------|---------|
| 知识星球 zsxq | 付费圈子内容 |
| 微信公众号 weixin | 公众号文章 |

### E. AI & 科技

| 站点 | 命令示例 | 数据类型 |
|------|---------|---------|
| AIbase | `hot` | AI 产品排行 |
| arXiv | 论文搜索 | AI 论文 |
| Hacker News | `hot` | 科技前沿 |

## 进阶玩法：每日自动化扫描

OpenCLI 最强的地方在于：**它可以被自动化调度**。

我用 WorkBuddy 的 CRON 自动化功能，创建了一个每日定时任务：

**任务配置：**
- 执行时间：每天晚上 20:00
- 扫描范围：雪球、新浪财经、同花顺、36kr、知乎、微博、Reddit、Twitter、Binance
- 重点跟踪：X 上的 @aleabitoreddit（Serenity）每日新观点
- 输出：结构化 Markdown 报告

**报告结构：**

1. 今日市场热词 TOP 10
2. A股市场情绪（雪球+同花顺+微博）
3. 美股/全球市场关注（Reddit+Reuters）
4. 科技与创投动态（36kr+知乎）
5. Serenity 跟踪报告
6. 今日风险信号

每天晚上自动跑，第二天早上打开就能看到全网财经一页通。比手动刷 10 个 App 高效多了。

## 踩坑总结

### 1. 短链接必须手动解析

抖音的 `v.douyin.com` 短链接不能直接传给 OpenCLI，需要先访问拿到真实 URL 中的 `aweme_id`，再构造完整链接。

### 2. 登录态是最大门槛

大约 30% 的命令需要登录态。**不要在自动化流程里依赖需要登录的命令**，或者确保浏览器始终处于登录状态。

### 3. 部分命令不稳定

某些适配器可能因为网站改版而失效。建议在 CRON 任务中设置容错：失败则跳过，不要中断整体流程。

### 4. `--window background` 是必需品

不加这个参数，每次调用都会弹出 Chrome 窗口，在自动化场景下会非常烦人。

### 5. `-f yaml` 比 JSON 更易读

YAML 格式在终端查看时比 JSON 更友好，尤其是数据量大的场景。

## 总结

OpenCLI 是目前我见过的**最轻量的全网数据抓取方案**。不需要写代码、不需要配环境、不需要管反爬——装一个 npm 包，150 个网站的数据就在你终端里了。

特别适合：
- **财经信息聚合**：一站扫描雪球、微博、Reddit、Twitter
- **内容创作辅助**：B站字幕提取、抖音内容获取
- **自动化监控**：配合 CRON 做每日定时扫描

项目地址：[https://github.com/nicepkg/opencli](https://github.com/nicepkg/opencli)

---

*本文基于 2026 年 5 月实测，适配器数量和功能可能随版本更新变化。*
