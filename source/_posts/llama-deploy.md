---
title: Llama 3.1 本地部署教程
date: 2026-05-19 15:30:00
cover: /img/llama.jpg
categories:
  - GitHub精选
tags:
  - Llama
  - Meta
  - 本地部署
  - Ollama
  - 开源项目
---

## 项目介绍

Meta 开源的 Llama 3.1 是目前最强的开源大语言模型之一，8B版本可以在消费级显卡上流畅运行。

GitHub: [https://github.com/meta-llama/llama3](https://github.com/meta-llama/llama3)

## 环境准备

### 硬件要求

| 模型版本 | 显存需求 | 推荐显卡 |
|---------|---------|---------|
| 8B | 8GB | RTX 3060/4060 |
| 70B | 40GB+ | RTX 4090 x2 |

### 软件环境

```bash
# Ubuntu 22.04 系统
sudo apt update
sudo apt install nvidia-driver-535
```

## 部署方式一：Ollama（推荐）

```bash
# 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 下载 Llama 3.1 8B
ollama pull llama3.1:8b

# 运行对话
ollama run llama3.1:8b

# API 服务
ollama serve
```

## 部署方式二：llama.cpp

```bash
# 克隆项目
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp

# 编译
make LLAMA_CUBLAS=1

# 下载模型权重
# 需从 Meta 官网申请下载权限

# 运行推理
./main -m models/llama-3.1-8b.gguf -n 512 --color
```

## Python 调用示例

```python
import requests

response = requests.post('http://localhost:11434/api/generate', json={
    "model": "llama3.1:8b",
    "prompt": "用Python写一个快速排序算法",
    "stream": False
})

print(response.json()['response'])
```

## 性能优化技巧

1. 使用量化版本（Q4_K_M）减少显存占用
2. 调整 `num_ctx` 参数控制上下文长度
3. 启用 GPU offloading 提升推理速度