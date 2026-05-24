---
title: FastAPI快速入门-现代Python Web框架
date: 2026-05-30 10:00:00
categories: Python开发
tags:
  - Python
  - FastAPI
  - Web框架
  - API
  - 异步
cover: /img/python.jpg
---

## FastAPI 简介

FastAPI 是现代、高性能的 Python Web 框架，基于 Starlette 和 Pydantic 构建。

**核心优势：**
- 性能媲美 NodeJS 和 Go
- 自动生成 API 文档（Swagger UI）
- 类型提示，编辑器支持友好
- 异步支持，高并发场景首选

## 安装

```bash
pip install fastapi uvicorn
```

## 最简单的 API

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Hello FastAPI"}

@app.get("/items/{item_id}")
def get_item(item_id: int):
    return {"item_id": item_id}
```

运行服务器：
```bash
uvicorn main:app --reload
```

访问：
- http://localhost:8000 - API
- http://localhost:8000/docs - 自动生成的 Swagger 文档
- http://localhost:8000/redoc - ReDoc 文档

## 路由与请求方法

```python
from fastapi import FastAPI

app = FastAPI()

# GET 请求
@app.get("/users")
def get_users():
    return {"users": ["Alice", "Bob"]}

# POST 请求
@app.post("/users")
def create_user(name: str):
    return {"created": name}

# PUT 请求
@app.put("/users/{user_id}")
def update_user(user_id: int, name: str):
    return {"updated": user_id, "name": name}

# DELETE 请求
@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    return {"deleted": user_id}
```

## 请求参数

### 查询参数

```python
@app.get("/search")
def search(q: str, limit: int = 10):
    return {"query": q, "limit": limit}

# 访问: /search?q=python&limit=5
```

### 路径参数

```python
@app.get("/items/{item_id}")
def get_item(item_id: int):
    return {"item_id": item_id}

# 访问: /items/123
```

### 请求体（JSON）

```python
from pydantic import BaseModel

class User(BaseModel):
    name: str
    age: int
    email: str

@app.post("/users")
def create_user(user: User):
    return {"created": user.name, "age": user.age}

# POST body: {"name": "Alice", "age": 25, "email": "alice@example.com"}
```

## Pydantic 数据验证

FastAPI 使用 Pydantic 自动验证数据：

```python
from pydantic import BaseModel, EmailStr, Field

class Item(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    price: float = Field(gt=0)  # 必须大于 0
    quantity: int = Field(default=1, ge=0)  # 默认1，最小0
    email: EmailStr  # 验证邮箱格式

@app.post("/items")
def create_item(item: Item):
    return item

# 自动验证：
# - name 长度 1-50
# - price > 0
# - quantity >= 0
# - email 格式正确
```

验证失败自动返回 422 错误，带详细错误信息。

## 异步支持

```python
import asyncio

@app.get("/async-demo")
async def async_endpoint():
    await asyncio.sleep(1)
    return {"message": "异步处理完成"}

# 异步数据库查询示例
@app.get("/users-db")
async def get_users():
    users = await fetch_users_from_db()  # 异步查询
    return users
```

## 响应模型

定义响应格式：

```python
from pydantic import BaseModel

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int):
    # 返回数据会按 UserResponse 格式过滤
    user_data = {
        "id": user_id,
        "name": "Alice",
        "email": "alice@example.com",
        "password": "secret"  # 会被过滤掉
    }
    return user_data
```

## 错误处理

```python
from fastapi import HTTPException

@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id > 100:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"item_id": item_id}
```

## 中间件

```python
from fastapi import Request
import time

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    print(f"{request.method} {request.url} - {duration:.2f}s")
    return response
```

## 静态文件与模板

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/page")
def page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
```

## 完整示例：REST API

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(title="用户管理API")

class User(BaseModel):
    id: int
    name: str
    email: str

# 模拟数据库
users_db: List[User] = []

@app.get("/users", response_model=List[User])
def list_users():
    return users_db

@app.post("/users", response_model=User)
def create_user(user: User):
    if any(u.id == user.id for u in users_db):
        raise HTTPException(400, "ID已存在")
    users_db.append(user)
    return user

@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: int):
    for user in users_db:
        if user.id == user_id:
            return user
    raise HTTPException(404, "用户不存在")

@app.put("/users/{user_id}", response_model=User)
def update_user(user_id: int, updated: User):
    for i, user in enumerate(users_db):
        if user.id == user_id:
            users_db[i] = updated
            return updated
    raise HTTPException(404, "用户不存在")

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    for i, user in enumerate(users_db):
        if user.id == user_id:
            users_db.pop(i)
            return {"deleted": user_id}
    raise HTTPException(404, "用户不存在")
```

## 部署

### Docker 部署

```dockerfile
FROM python:3.10
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 生产配置

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 总结

FastAPI 是 Python Web 开发的新一代选择，特别适合：
- REST API 开发
- 微服务后端
- 高并发场景
- 需要自动文档的项目

**对比其他框架：**

| 框架 | 性能 | 文档 | 异步 | 学习难度 |
|------|------|------|------|----------|
| FastAPI | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | 低 |
| Flask | ⭐⭐⭐ | ⭐⭐ | ❌ | 低 |
| Django | ⭐⭐⭐ | ⭐⭐⭐ | ✅ | 中 |

**推荐学习路径：**
1. 跑通最简单示例，看 `/docs` 自动文档
2. 掌握 Pydantic 数据验证
3. 学习异步数据库操作
4. 实战项目练习

开始你的 FastAPI 之旅吧！