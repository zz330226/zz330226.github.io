---
title: DeepSeek本地部署完整教程
date: 2026-05-25 10:00:00
categories: AI工具箱
tags:
  - DeepSeek
  - AI
  - 本地部署
  - LLM
  - Ollama
cover: /img/deepseek.jpg
---

## DeepSeek 简介

DeepSeek 是国产开源大模型的佼佼者，由深度求索公司开发。其 DeepSeek-V3 和 DeepSeek-R1 模型在性能上可与 GPT-4、Claude 等国际顶尖模型媲美，且完全开源免费。

**核心优势：**
- 完全开源，可本地部署
- 中文理解能力强
- 推理性能优秀
- 支持 67B、7B 等多种规格

## 部署方式一：Ollama（最简单）

Ollama 是最便捷的本地 LLM 运行工具，一键拉取运行 DeepSeek。

### 安装 Ollama

```bash
# Linux/macOS
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# 下载安装包：https://ollama.com/download/windows
```

### 运行 DeepSeek

```bash
# 拉取并运行 DeepSeek-R1 7B
ollama run deepseek-r1:7b

# 其他版本
ollama run deepseek-r1:1.5b    # 轻量版，适合低配电脑
ollama run deepseek-r1:8b      # 中等版本
ollama run deepseek-v3:67b     # 完整版（需要高端显卡）
```

### 测试对话

```bash
>>> 你是谁？
我是 DeepSeek-R1，一个由深度求索开发的 AI 助手...

>>> 用 Python 写一个快速排序算法
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    ...
```

## 部署方式二：vLLM（高性能）

vLLM 适合需要高并发推理的场景，吞吐量比 Ollama 高 10 倍以上。

### 安装 vLLM

```bash
pip install vllm
```

### 启动推理服务

```bash
# 下载模型（需要 HuggingFace 账号）
huggingface-cli download deepseek-ai/deepseek-r1-distill-qwen-7b

# 启动 API 服务
vllm serve deepseek-ai/deepseek-r1-distill-qwen-7b \
    --host 0.0.0.0 \
    --port 8000 \
    --dtype auto
```

### 调用 API

```python
import requests

response = requests.post(
    "http://localhost:8000/v1/chat/completions",
    json={
        "model": "deepseek-ai/deepseek-r1-distill-qwen-7b",
        "messages": [{"role": "user", "content": "你好，请介绍一下自己"}],
        "temperature": 0.7
    }
)

print(response.json()["choices"][0]["message"]["content"])
```

## 部署方式三：LM Studio（可视化界面）

适合不想折腾命令行的用户，提供友好的 GUI 界面。

### 安装步骤

1. 下载 LM Studio：https://lmstudio.ai
2. 搜索并下载 DeepSeek-R1 模型
3. 点击「Chat」开始对话

## 硬件配置建议

| 模型规格 | 显存需求 | 推荐显卡 |
|----------|----------|----------|
| 1.5B | 4GB | GTX 1650 |
| 7B | 8GB | RTX 3060 |
| 8B | 12GB | RTX 4070 |
| 67B | 80GB+ | A100/H100（或多卡并行） |

**CPU 运行方案：**
显存不足时，可用 CPU + 内存运行，但速度较慢。8GB 内存可跑 1.5B 版本。

```bash
# CPU 模式运行
ollama run deepseek-r1:1.5b --device cpu
```

## 进阶：接入 Web UI

使用 Open WebUI 提供类似 ChatGPT 的网页界面。

```bash
# Docker 一键部署
docker run -d -p 3000:8080 \
    --add-host=host.docker.internal:host-gateway \
    -v open-webui:/app/backend/data \
    --name open-webui \
    ghcr.io/open-webui/open-webui:main

# 访问 http://localhost:3000
# 设置 Ollama API 地址：http://host.docker.internal:11434
```

## 总结

DeepSeek 本地部署方案对比：

| 方案 | 优点 | 缺点 |
|------|------|------|
| Ollama | 简单易用，一键部署 | 并发性能有限 |
| vLLM | 高吞吐量，API 服务 | 配置复杂 |
| LM Studio | 可视化界面 | 功能相对简单 |

**推荐新手选择 Ollama**，几分钟即可上手体验 DeepSeek 的强大能力！