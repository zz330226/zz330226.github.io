---
title: Python异步编程实战
date: 2026-05-20 09:00:00
cover: /img/python.jpg
categories:
  - Python开发
tags:
  - Python
  - asyncio
  - 异步编程
  - 并发
---

## 为什么需要异步编程

在处理大量I/O操作时，同步代码会严重阻塞程序执行。异步编程可以让程序在等待I/O时继续执行其他任务。

### 同步 vs 异步对比

```python
# 同步方式 - 总耗时约6秒
import time

def fetch_data(url):
    time.sleep(2)  # 模拟网络请求
    return f"Data from {url}"

def main():
    start = time.time()
    results = []
    for url in ['url1', 'url2', 'url3']:
        results.append(fetch_data(url))
    print(f"耗时: {time.time() - start}秒")
    
main()
```

```python
# 异步方式 - 总耗时约2秒
import asyncio

async def fetch_data(url):
    await asyncio.sleep(2)  # 模拟网络请求
    return f"Data from {url}"

async def main():
    start = time.time()
    tasks = [fetch_data(url) for url in ['url1', 'url2', 'url3']]
    results = await asyncio.gather(*tasks)
    print(f"耗时: {time.time() - start}秒")
    print(results)

asyncio.run(main())
```

## asyncio 核心概念

### 1. Coroutine（协程）

```python
async def my_coroutine():
    """协程函数，使用 async def 定义"""
    await some_async_operation()
```

### 2. Task（任务）

```python
# 创建任务
task = asyncio.create_task(my_coroutine())

# 等待任务完成
result = await task
```

### 3. Future（未来对象）

```python
future = asyncio.Future()
future.set_result("完成")
result = await future
```

## 实战案例：并发HTTP请求

```python
import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url) as response:
        return await response.text()

async def fetch_all(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        return await asyncio.gather(*tasks)

urls = [
    'https://api.github.com/users/github',
    'https://api.github.com/users/python',
    'https://api.github.com/repos/python/cpython'
]

results = asyncio.run(fetch_all(urls))
```

## 常见陷阱与解决方案

| 陷阱 | 解决方案 |
|-----|---------|
| 在同步代码中调用async函数 | 使用 `asyncio.run()` |
| 阻塞事件循环 | 使用 `run_in_executor()` |
| 忘记await | 检查所有async函数调用 |

## 最佳实践

1. **避免阻塞操作** - 不要在async函数中使用time.sleep()
2. **合理使用并发** - 不是所有场景都需要异步
3. **资源管理** - 使用 async with 管理上下文