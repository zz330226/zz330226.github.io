---
title: Docker容器化部署实战指南
date: 2026-05-31 10:00:00
categories: Linux运维
tags:
  - Docker
  - 容器
  - 部署
  - Linux
  - DevOps
cover: /img/linux.jpg
---

## Docker 简介

Docker 是容器化技术的代表，将应用及其依赖打包成轻量级容器，实现「一次构建，到处运行」。

**核心优势：**
- 环境一致性，告别「在我机器上能跑」
- 快速部署，秒级启动
- 资源隔离，安全可靠
- 版本管理，方便回滚

## 安装 Docker

### Ubuntu/Debian

```bash
# 更新包索引
sudo apt update

# 安装依赖
sudo apt install -y ca-certificates curl gnupg

# 添加 Docker 官方 GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg

# 添加仓库
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list

# 安装 Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# 启动并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker
```

### CentOS/RHEL

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker
```

### Windows/macOS

下载 Docker Desktop：https://www.docker.com/products/docker-desktop

## 基础命令

### 镜像操作

```bash
# 搜索镜像
docker search nginx

# 拉取镜像
docker pull nginx:latest
docker pull python:3.10

# 查看本地镜像
docker images

# 删除镜像
docker rmi nginx:latest

# 构建镜像
docker build -t myapp:v1 .
```

### 容器操作

```bash
# 运行容器
docker run -d -p 80:80 nginx

# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 停止容器
docker stop <容器ID>

# 启动容器
docker start <容器ID>

# 重启容器
docker restart <容器ID>

# 删除容器
docker rm <容器ID>

# 进入容器
docker exec -it <容器ID> bash

# 查看容器日志
docker logs <容器ID>

# 查看容器详情
docker inspect <容器ID>
```

## Dockerfile 编写

### 基本结构

```dockerfile
# 基础镜像
FROM python:3.10

# 设置工作目录
WORKDIR /app

# 复制文件
COPY requirements.txt .

# 安装依赖
RUN pip install -r requirements.txt

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["python", "main.py"]
```

### Python Web 应用示例

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# 先复制依赖文件（利用缓存）
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY app/ ./app/

EXPOSE 8000

# 使用 gunicorn 生产启动
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app.main:app"]
```

### Node.js 应用示例

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

## Docker Compose

多容器编排工具，一个 YAML 文件管理多个服务。

### 示例：Web + 数据库

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./app:/app
    environment:
      - DB_HOST=db
      - DB_PORT=5432
    depends_on:
      - db

  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=mydb

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Compose 命令

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 构建并启动
docker-compose up -d --build
```

## 实战案例

### 部署 Nginx 反向代理

```bash
docker run -d \
  --name nginx \
  -p 80:80 \
  -p 443:443 \
  -v ./nginx.conf:/etc/nginx/nginx.conf \
  -v ./html:/usr/share/nginx/html \
  nginx:latest
```

### 部署 MySQL 数据库

```bash
docker run -d \
  --name mysql \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=mydb \
  mysql:8.0
```

### 部署 Redis

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine redis-server --appendonly yes
```

## 数据管理

### Volume（数据卷）

```bash
# 创建数据卷
docker volume create mydata

# 查看数据卷
docker volume ls

# 使用数据卷
docker run -v mydata:/app/data myapp

# 删除数据卷
docker volume rm mydata
```

### Bind Mount（绑定挂载）

```bash
# 挂载本地目录
docker run -v /host/path:/container/path myapp

# 挂载文件
docker run -v ./config.yaml:/app/config.yaml myapp
```

## 网络

### 网络类型

| 类型 | 说明 |
|------|------|
| bridge | 默认网络，容器间可通信 |
| host | 使用宿主机网络 |
| none | 无网络 |

### 自定义网络

```bash
# 创建网络
docker network create mynet

# 容器加入网络
docker run --network mynet --name web myapp
docker run --network mynet --name db mysql

# 同一网络内容器可通过名称互访
# web 可直接连接 db:3306
```

## 最佳实践

### 1. 使用 .dockerignore

```
__pycache__
*.pyc
.git
.env
node_modules
*.log
```

### 2. 镜像优化

```dockerfile
# 使用 slim/alpine 版本
FROM python:3.10-slim

# 合并 RUN 命令减少层数
RUN apt update && apt install -y \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# 多阶段构建
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### 3. 健康检查

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8000/health || exit 1
```

### 4. 安全配置

```bash
# 不使用 root 运行
docker run --user 1000:1000 myapp

# 限制资源
docker run --memory 512m --cpus 1 myapp

# 只读文件系统
docker run --read-only myapp
```

## 总结

Docker 核心概念速查：

| 概念 | 说明 |
|------|------|
| Image | 镜像，应用的模板 |
| Container | 容器，镜像的运行实例 |
| Volume | 数据卷，持久化存储 |
| Network | 网络，容器通信 |
| Dockerfile | 镜像构建脚本 |
| Compose | 多容器编排工具 |

**推荐学习路径：**
1. 熟练基础命令
2. 学会写 Dockerfile
3. 掌握 Docker Compose
4. 了解 Kubernetes 进阶

Docker 是现代开发的必备技能，开始容器化你的应用吧！