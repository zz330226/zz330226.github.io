---
title: Python正则表达式实战指南
date: 2026-05-29 10:00:00
categories: Python开发
tags:
  - Python
  - 正则表达式
  - regex
  - 文本处理
cover: /img/python.jpg
---

## 正则表达式简介

正则表达式（Regular Expression，简称 regex）是处理文本的强大工具。通过模式匹配，可以快速完成查找、提取、替换等操作。

Python 使用 `re` 模块处理正则表达式。

## 基本语法速查

| 符号 | 含义 | 示例 |
|------|------|------|
| `.` |任意字符 | `a.c` 匹配 "abc"、"a1c" |
| `\d` | 数字 | `\d\d` 匹配 "12" |
| `\w` | 字母/数字/下划线 | `\w+` 匹配 "hello_123" |
| `\s` | 空格/制表符 | `\s+` 匹配连续空白 |
| `*` | 0次或多次 | `ab*c` 匹配 "ac"、"abbc" |
| `+` | 1次或多次 | `ab+c` 匹配 "abc"、"abbc" |
| `?` | 0次或1次 | `ab?c` 匹配 "ac"、"abc" |
| `{n}` | 恰好n次 | `a{3}` 匹配 "aaa" |
| `{n,m}` | n到m次 | `a{2,4}` 匹配 "aa"、"aaa"、"aaaa" |
| `^` | 开头 | `^Hello` 匹配开头的 Hello |
| `$` | 结尾 | `end$` 匹配结尾的 end |
| `[]` | 字符集合 | `[abc]` 匹配 a/b/c |
| `|` | 或 | `cat|dog` 匹配 cat 或 dog |
| `()` | 分组 | `(ab)+` 匹配 "abab" |

## re 模块核心方法

```python
import re

# 1. 匹配（从开头匹配）
re.match(r'Hello', 'Hello World')  # 返回 Match 对象

# 2. 搜索（任意位置）
re.search(r'World', 'Hello World')  # 返回 Match 对象

# 3. 查找所有
re.findall(r'\d+', '2024-05-30')  # ['2024', '05', '30']

# 4. 替换
re.sub(r'\d+', 'NUM', '2024年')  # 'NUM年'

# 5. 分割
re.split(r'[,\s]+', 'a,b, c d')  # ['a', 'b', 'c', 'd']
```

## 实战案例

### 1. 提取邮箱地址

```python
import re

text = "联系我: test@example.com 或 admin@company.cn"

pattern = r'[\w.-]+@[\w.-]+\.\w+'
emails = re.findall(pattern, text)
print(emails)  # ['test@example.com', 'admin@company.cn']
```

### 2. 提取手机号码

```python
text = "我的手机是13812345678，备用号是139-8765-4321"

pattern = r'1[3-9]\d-?\d{4}-?\d{4}'
phones = re.findall(pattern, text)
print(phones)  # ['13812345678', '139-8765-4321']
```

### 3. 提取 URL

```python
text = "访问 https://example.com 或 http://test.org/path"

pattern = r'https?://[\w./-]+'
urls = re.findall(pattern, text)
print(urls)  # ['https://example.com', 'http://test.org/path']
```

### 4. 清洗 HTML 标签

```python
html = "<p>这是一段<b>重要</b>文字</p>"

clean_text = re.sub(r'<[^>]+>', '', html)
print(clean_text)  # 这是一段重要文字
```

### 5. 验证密码强度

```python
def check_password(password):
    # 至少8位，包含大小写字母和数字
    if len(password) < 8:
        return False, "密码太短"
    if not re.search(r'[A-Z]', password):
        return False, "缺少大写字母"
    if not re.search(r'[a-z]', password):
        return False, "缺少小写字母"
    if not re.search(r'\d', password):
        return False, "缺少数字"
    return True, "密码合格"

print(check_password("Abc12345"))  # (True, "密码合格")
```

### 6. 解析日期格式

```python
text = "日期: 2024-05-30 或 2024/05/30"

pattern = r'(\d{4})[-/](\d{2})[-/](\d{2})'
matches = re.findall(pattern, text)

for match in matches:
    year, month, day = match
    print(f"年:{year} 月:{month} 日:{day}")
```

### 7. 提取 JSON 数字

```python
json_str = '{"price": 99.99, "count": 100, "rate": 0.5}'

numbers = re.findall(r'\d+\.?\d*', json_str)
print(numbers)  # ['99.99', '100', '0.5']
```

## 分组与捕获

使用 `()` 捕获匹配内容：

```python
text = "张三: 100分, 李四: 95分"

pattern = r'(\w+): (\d+)分'
matches = re.findall(pattern, text)

print(matches)  # [('张三', '100'), ('李四', '95')]
```

**命名分组：**

```python
text = "2024-05-30"

pattern = r'(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})'
match = re.search(pattern, text)

print(match.group('year'))   # 2024
print(match.group('month'))  # 05
print(match.group('day'))    # 30
```

## 常用模式模板

```python
# 邮箱
EMAIL = r'[\w.-]+@[\w.-]+\.\w+'

# 手机号（中国大陆）
PHONE = r'1[3-9]\d{9}'

# 身份证号
ID_CARD = r'\d{17}[\dXx]'

# IP 地址
IP = r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}'

# 银行卡号
BANK_CARD = r'\d{16,19}'

# 日期 YYYY-MM-DD
DATE = r'\d{4}-\d{2}-\d{2}'

# 时间 HH:MM:SS
TIME = r'\d{2}:\d{2}:\d{2}'
```

## 性能优化

### 编译正则表达式

多次使用同一个模式时，先编译：

```python
import re

# 编译一次
pattern = re.compile(r'\d+')

# 多次使用
result1 = pattern.findall('123 abc')
result2 = pattern.findall('456 def')
```

### 避免贪婪匹配

默认是贪婪匹配（匹配尽可能多），用 `?` 变成非贪婪：

```python
text = "<div>内容1</div><div>内容2</div>"

# 贪婪
re.findall(r'<div>.*</div>', text)
# ['<div>内容1</div><div>内容2</div>']

# 非贪婪
re.findall(r'<div>.*?</div>', text)
# ['<div>内容1</div>', '<div>内容2</div>']
```

## 总结

正则表达式是文本处理的瑞士军刀，掌握它能大幅提升效率。

**学习路径：**
1. 先记住基本语法 `\d`, `\w`, `*`, `+`, `?`
2. 练习 `findall`, `search`, `sub` 三大方法
3. 掌握分组捕获 `()`
4. 积累常用模式模板

**调试工具推荐：**
- https://regex101.com - 在线调试，可视化解释
- https://regexr.com - 交互式学习

遇到复杂文本处理需求，第一时间想想：能否用正则表达式解决？