---
title: Voicebox-开源AI语音工作室部署教程
date: 2026-05-24 10:00:00
cover: /img/voicebox.jpg
categories:
  - AI工具箱
tags:
  - AI工具
  - TTS
  - 语音合成
  - 开源项目
  - 本地部署
---

## 项目简介

Voicebox 是一个本地优先的 AI 语音工作室，被誉为 ElevenLabs 和 WisprFlow 的开源替代品。该项目由 jamiepine 开发，目前已获得超过 27.9k Star，采用 MIT 开源许可证。

**核心定位**：将语音合成（TTS）、语音识别（STT）和 AI Agent 语音输出三大功能集成在一个应用中，完全本地运行，数据不离设备。

## 主要特性

### 🎙️ 语音输出（TTS）

Voicebox 内置 **7 个 TTS 引擎**：

| 引擎 | 特点 |
|------|------|
| Qwen3-TTS | 阿里最新多语言TTS模型 |
| Qwen CustomVoice | 支持自定义声音克隆 |
| LuxTTS | 高质量中文语音 |
| Chatterbox Multilingual | 多语言支持 |
| Chatterbox Turbo | 快速生成模式 |
| HumeAI TADA | 情感语音合成 |
| Kokoro | 轻量级高效引擎 |

**亮点功能**：
- 支持 **23 种语言**
- **零样本语音克隆**：仅需几秒参考音频即可克隆声音
- **50+ 预设声音**可直接使用
- **表情标签支持**：`[laugh]`、`[sigh]`、`[gasp]` 等情感控制
- **8 种后处理效果**：变调、混响、延迟、合唱、压缩器等
- **无限长度生成**：自动分块 + 交叉淡入淡出

### 🎧 语音输入（STT）

- 基于 **Whisper** 的语音转文字
- **全局快捷键听写**，随时随地语音输入
- macOS 目标感知自动粘贴
- LLM 润色功能，自动优化语音转出的文字

### 🤖 Agent 语音输出

Voicebox 内置 **MCP 服务器**，一行代码即可让任何 MCP 感知的 AI Agent 说话：

```python
# 让 Claude Code、Cursor、Cline 等 AI 工具语音输出
mcp_client.say("任务已完成！")
```

支持的工具包括：
- Claude Code
- Cursor
- Cline
- 其他 MCP 协议兼容的 AI 工具

## 技术架构

Voicebox 采用现代化的技术栈：

| 层级 | 技术选型 |
|------|----------|
| 桌面应用 | **Tauri (Rust)** - 非 Electron，原生性能 |
| 前端 | React + TypeScript + Tailwind CSS |
| 后端 | FastAPI (Python) |
| 推理引擎 | MLX (Apple Silicon) / PyTorch (CUDA/ROCm/XPU/CPU) |
| 数据库 | SQLite |
| 音频处理 | Pedalboard (Spotify 开源库) |

**多 GPU 支持**：
- Apple Metal
- NVIDIA CUDA
- AMD ROCm
- Intel DirectML

## 本地部署教程

### 方式一：下载安装包

官方提供各平台安装包：

| 平台 | 下载地址 |
|------|----------|
| macOS (Apple Silicon) | `voicebox.sh/download/mac-arm` |
| macOS (Intel) | `voicebox.sh/download/mac-intel` |
| Windows | `voicebox.sh/download/windows` |

下载后双击安装即可使用。

### 方式二：Docker 部署

适合 Linux 用户或服务器部署：

```bash
# 克隆仓库
git clone https://github.com/jamiepine/voicebox.git
cd voicebox

# 启动服务
docker compose up
```

### 方式三：源码编译

适合开发者自定义修改：

```bash
# 克隆仓库
git clone https://github.com/jamiepine/voicebox.git
cd voicebox

# 安装前端依赖
pnpm install

# 安装后端依赖
cd server
pip install -r requirements.txt

# 开发模式启动
pnpm tauri dev
```

## API 使用示例

Voicebox 采用 API 优先设计，可通过 REST API 调用：

### TTS 语音合成

```python
import requests

# 合成语音
response = requests.post(
    "http://localhost:8000/tts",
    json={
        "text": "你好，这是Voicebox语音合成测试",
        "voice": "zh-CN-female-1",
        "engine": "kokoro"
    }
)

# 获取音频文件
audio_path = response.json()["output_path"]
```

### 语音克隆

```python
# 上传参考音频克隆声音
response = requests.post(
    "http://localhost:8000/clone",
    files={"audio": open("reference.wav", "rb")},
    json={"name": "my_voice"}
)

# 使用克隆的声音合成
requests.post(
    "http://localhost:8000/tts",
    json={
        "text": "这是克隆后的声音",
        "voice": "my_voice"
    }
)
```

### MCP Agent 集成

```python
from mcp import Client

client = Client("localhost:8000/mcp")

# 让AI Agent语音输出
client.call("say", {"text": "代码编译成功，无错误！"})
```

## 使用技巧

### 1. 表情标签增强语音表现力

```text
你好[laugh]，很高兴见到你！
这个消息让人[gasp]太惊讶了。
嗯...[sigh]今天有点累。
```

### 2. 后处理效果组合

推荐配置用于不同场景：

| 场景 | 效果组合 |
|------|----------|
| 播客录音 | 混响 30% + 压缩器 |
| 游戏语音 | 变调 -2 + 延迟 10ms |
| 会议纪要 | 原声 + 轻微压缩 |
| ASMR | 混响 50% + 低音增强 |

### 3. 快捷键听写

设置全局快捷键（如 `Ctrl+Shift+V`），在任何应用中：
1. 按下快捷键开始录音
2. 说话内容实时转文字
3. 松开后自动粘贴到当前光标位置

## 与同类工具对比

| 特性 | Voicebox | ElevenLabs | WisprFlow |
|------|----------|------------|-----------|
| 开源免费 | ✅ MIT | ❌ 商业付费 | ❌ 商业付费 |
| 本地运行 | ✅ 完全本地 | ❌ 云端API | ❌ 云端API |
| 数据隐私 | ✅ 不上传 | ❌ 上传云端 | ❌ 上传云端 |
| 语音克隆 | ✅ 零样本克隆 | ✅ 需付费 | ❌ 不支持 |
| TTS引擎数 | ✅ 7个引擎 | 1个 | 1个 |
| Agent集成 | ✅ MCP协议 | ❌ 不支持 | ❌ 不支持 |
| 多语言 | ✅ 23种 | ✅ 29种 | ❌ 仅英语 |

## 未来路线图

项目正在积极开发中，计划功能包括：

- Windows/Linux 自动粘贴支持
- 更多 STT 引擎（Parakeet v3、Qwen3-ASR）
- 流式转录实时显示
- 端到端语音 LLM 对话
- 移动端伴侣应用

## 总结

Voicebox 是目前最完整的开源 AI 语音解决方案，适合：

- **内容创作者**：快速生成配音、播客音频
- **开发者**：集成到 AI Agent 实现语音交互
- **隐私敏感用户**：完全本地处理，数据安全
- **多语言需求**：支持中文、英文等23种语言

相比商业产品 ElevenLabs，Voicebox 提供了免费、开源、本地化的替代方案，功能更全面，是 AI 语音工具的最佳选择。

---

**项目地址**：[https://github.com/jamiepine/voicebox](https://github.com/jamiepine/voicebox)

**官方网站**：[https://voicebox.sh](https://voicebox.sh)