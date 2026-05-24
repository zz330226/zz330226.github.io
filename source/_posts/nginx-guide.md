---
title: Nginx配置优化完全指南
date: 2026-05-10 10:00:00
categories: Linux运维
tags:
  - Nginx
  - Web服务器
  - 性能优化
  - Linux
  - 运维
cover: /img/Nginx.jpg
---

## Nginx 简介

Nginx 是高性能 Web 服务器，以高并发、低内存著称。全球超过 30% 的网站使用 Nginx。

**核心用途：**
- Web 服务器
- 反向代理
- 负载均衡
- 缓存服务器

## 基础配置结构

```nginx
# /etc/nginx/nginx.conf

user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    sendfile on;
    keepalive_timeout 65;
    
    # 加载站点配置
    include /etc/nginx/sites-enabled/*;
}
```

## 常用配置示例

### 静态网站

```nginx
server {
    listen 80;
    server_name example.com;
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

### 反向代理

```nginx
server {
    listen 80;
    server_name api.example.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 负载均衡

```nginx
upstream backend {
    server 192.168.1.1:8000 weight=3;
    server 192.168.1.2:8000 weight=2;
    server 192.168.1.3:8000 backup;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://backend;
    }
}
```

**负载均衡策略：**

| 策略 | 配置 | 说明 |
|------|------|------|
| 轮询 | 默认 | 依次分配 |
| weight | weight=N | 按权重分配 |
| ip_hash | ip_hash | 按IP固定分配 |
| least_conn | least_conn | 分配给连接最少的服务 |

## 性能优化配置

### Worker 进程

```nginx
worker_processes auto;         # 自动匹配CPU核心数
worker_connections 4096;       # 每个进程最大连接数
multi_accept on;               # 同时接受多个连接
use epoll;                     # Linux高效事件模型
```

### 连接优化

```nginx
keepalive_timeout 30;          # 保持连接超时时间
keepalive_requests 100;        # 单连接最大请求数
sendfile on;                   # 高效文件传输
tcp_nopush on;                 # 优化数据包发送
tcp_nodelay on;                # 禁用 Nagle 算法
```

### 缓冲区优化

```nginx
client_body_buffer_size 16K;   # 请求体缓冲
client_header_buffer_size 1k;  # 请求头缓冲
client_max_body_size 8m;       # 最大请求体大小

output_buffers 1 32k;          # 输出缓冲
postpone_output 1460;          # 响应延迟发送
```

### Gzip 压缩

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;          # 最小压缩大小
gzip_comp_level 6;             # 压缩级别（1-9）
gzip_types text/plain text/css application/json application/javascript text/xml;
gzip_disable "msie6";
```

## SSL/HTTPS 配置

### 基本 SSL

```nginx
server {
    listen 443 ssl;
    server_name example.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

### SSL 优化

```nginx
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_prefer_server_ciphers on;

# HTTP 严格传输安全
add_header Strict-Transport-Security "max-age=31536000" always;

# 自动跳转 HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}
```

## 缓存配置

### 静态文件缓存

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
    access_log off;
}
```

### 代理缓存

```nginx
# 缓存配置
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=mycache:10m 
                 inactive=60m max_size=100m;

server {
    location / {
        proxy_pass http://backend;
        proxy_cache mycache;
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404 1m;
        proxy_cache_key $scheme$proxy_host$request_uri;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

## 安全配置

### 防止常见攻击

```nginx
# 隐藏版本号
server_tokens off;

# 防止目录遍历
location ~ /\. {
    deny all;
}

# 限制请求方法
location / {
    if ($request_method !~ ^(GET|POST|HEAD)$ ) {
        return 405;
    }
}

# SQL注入防护
location ~* "(select|insert|update|delete|drop|union|script)" {
    return 403;
}
```

### 请求限制

```nginx
# 限制请求速率
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

location /api/ {
    limit_req zone=mylimit burst=20 nodelay;
}

# 限制连接数
limit_conn_zone $binary_remote_addr zone=connlimit:10m;

location / {
    limit_conn connlimit 10;
}
```

### IP 白名单/黑名单

```nginx
# 白名单
location /admin {
    allow 192.168.1.0/24;
    deny all;
}

# 黑名单
location / {
    deny 1.2.3.4;
    deny 5.6.7.8;
    allow all;
}
```

## 日志配置

```nginx
# 自定义日志格式
log_format main '$remote_addr - $remote_user [$time_local] '
                 '"$request" $status $body_bytes_sent '
                 '"$http_referer" "$http_user_agent" '
                 '$request_time $upstream_response_time';

access_log /var/log/nginx/access.log main;
error_log /var/log/nginx/error.log warn;

# 静态文件不记录日志
location ~* \.(jpg|jpeg|png|gif|css|js)$ {
    access_log off;
}
```

## 常用命令

```bash
# 测试配置
nginx -t

# 重载配置
nginx -s reload

# 停止
nginx -s stop

# 查看状态
systemctl status nginx

# 查看连接数
nginx -V 2>&1 | grep --color -- "configure arguments"
```

## 故障排查

### 常见错误码

| 错误码 | 原因 | 解决方案 |
|--------|------|----------|
| 502 | 后端服务不可用 | 检查后端服务状态 |
| 504 | 后端响应超时 | 增加 proxy_read_timeout |
| 413 | 请求体过大 | 增加 client_max_body_size |
| 403 | 权限拒绝 | 检查文件权限和 location 配置 |

### 调试技巧

```nginx
# 开启调试日志（仅调试时使用）
error_log /var/log/nginx/error.log debug;

# 查看变量值
location /debug {
    return 200 "Host: $host\nURI: $uri\n";
}
```

## 总结

Nginx 配置优化要点：

| 类别 | 关键配置 |
|------|----------|
| 性能 | worker_processes, worker_connections, sendfile |
| 压缩 | gzip on, gzip_comp_level |
| 缓存 | expires, proxy_cache |
| 安全 | server_tokens off, limit_req, SSL |
| 监控 | access_log, error_log |

**推荐配置模板：** 先从简单配置开始，逐步添加优化项，每次修改后 `nginx -t` 测试。

掌握 Nginx，让你的网站更快更安全！