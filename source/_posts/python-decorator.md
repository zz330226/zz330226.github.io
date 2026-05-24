---
title: Python装饰器详解-从入门到精通
date: 2026-05-28 10:00:00
categories: Python开发
tags:
  - Python
  - 装饰器
  - 函数式编程
  - 进阶
cover: /img/Decorator.jpg
---

## 什么是装饰器

装饰器（Decorator）是 Python 的高级特性，本质上是一个函数，用于「装饰」其他函数，在不修改原函数代码的情况下增加额外功能。

**通俗理解：**
就像给手机贴膜，手机本身功能不变，但多了一层「保护」功能。装饰器就是给函数「贴膜」。

## 最简单的装饰器

```python
def my_decorator(func):
    def wrapper():
        print("函数开始执行")
        func()
        print("函数执行结束")
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")

# 调用
say_hello()
```

**输出：**
```
函数开始执行
Hello!
函数执行结束
```

## 装饰器的原理

`@my_decorator` 等价于：
```python
say_hello = my_decorator(say_hello)
```

装饰器把原函数「包装」成新函数，调用时实际执行的是 wrapper。

## 带参数的装饰器

原函数有参数时，wrapper 需要接收：

```python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("开始执行...")
        result = func(*args, **kwargs)
        print("执行结束!")
        return result
    return wrapper

@my_decorator
def add(a, b):
    return a + b

print(add(3, 5))
```

**输出：**
```
开始执行...
执行结束!
8
```

`*args, **kwargs` 让 wrapper 能接收任意参数。

## 实用装饰器示例

### 1. 计时装饰器

```python
import time

def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} 执行耗时: {end - start:.2f}秒")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(2)
    return "完成"

slow_function()
# 输出: slow_function 执行耗时: 2.00秒
```

### 2. 日志装饰器

```python
def logger(func):
    def wrapper(*args, **kwargs):
        print(f"调用函数: {func.__name__}")
        print(f"参数: args={args}, kwargs={kwargs}")
        result = func(*args, **kwargs)
        print(f"返回值: {result}")
        return result
    return wrapper

@logger
def calculate(x, y, operation="add"):
    if operation == "add":
        return x + y
    return x - y

calculate(10, 5, operation="add")
```

### 3. 缓存装饰器

```python
def cache(func):
    cached_results = {}
    
    def wrapper(*args):
        if args in cached_results:
            print(f"命中缓存: {args}")
            return cached_results[args]
        result = func(*args)
        cached_results[args] = result
        return result
    
    return wrapper

@cache
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))  # 第一次计算
print(fibonacci(10))  # 第二次命中缓存
```

### 4. 权限验证装饰器

```python
def require_auth(func):
    def wrapper(*args, **kwargs, user=None):
        if user is None or not user.get('is_admin'):
            print("权限不足！")
            return None
        return func(*args, **kwargs)
    return wrapper

@require_auth
def delete_user(user_id):
    print(f"删除用户 {user_id}")

delete_user(1, user={'is_admin': True})   # 成功
delete_user(2, user={'is_admin': False})  # 权限不足
```

## 保留原函数信息

装饰器会覆盖原函数的元信息（名称、文档等），使用 `functools.wraps` 解决：

```python
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def example():
    """这是一个示例函数"""
    pass

print(example.__name__)  # example（不是 wrapper）
print(example.__doc__)   # 这是一个示例函数
```

## 带参数的装饰器工厂

当装饰器本身需要参数时，需要三层嵌套：

```python
def repeat(n):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(n):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say_hi():
    print("Hi!")

say_hi()
# 输出: Hi! Hi! Hi!
```

## 类装饰器

装饰器也可以是类：

```python
class CountCalls:
    def __init__(self, func):
        self.func = func
        self.count = 0
    
    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"第 {self.count} 次调用")
        return self.func(*args, **kwargs)

@CountCalls
def greet():
    print("Hello")

greet()  # 第 1 次调用
greet()  # 第 2 次调用
```

## Python 内置装饰器

### @property

将方法变成属性访问：

```python
class Circle:
    def __init__(self, radius):
        self.radius = radius
    
    @property
    def area(self):
        return 3.14 * self.radius ** 2

c = Circle(5)
print(c.area)  # 78.5（像属性一样访问）
```

### @staticmethod 和 @classmethod

```python
class MyClass:
    @staticmethod
    def static_method():
        print("静态方法，不需要实例")
    
    @classmethod
    def class_method(cls):
        print(f"类方法，类是 {cls.__name__}")

MyClass.static_method()
MyClass.class_method()
```

## 装饰器叠加

多个装饰器可以叠加使用，执行顺序从下到上：

```python
@decorator1
@decorator2
def func():
    pass

# 等价于: func = decorator1(decorator2(func))
```

## 总结

装饰器是 Python 进阶必备技能，核心要点：

| 要点 | 说明 |
|------|------|
| 基本结构 | 函数嵌套 + 返回 wrapper |
| 参数处理 | 使用 `*args, **kwargs` |
| 元信息保留 | 使用 `@wraps(func)` |
| 带参数装饰器 | 三层嵌套或使用类 |

**常见用途：**
- 日志记录
- 性能计时
- 权限验证
- 缓存优化
- 错误处理

掌握装饰器，让你的 Python 代码更优雅、更强大！