---
title: Linux性能监控工具大全
date: 2026-06-02 10:00:00
categories: Linux运维
tags:
  - Linux
  - 监控
  - 性能
  - 运维
  - Shell
cover: /img/linux.jpg
---

## 为什么需要性能监控

服务器性能问题可能导致：
- 服务响应慢
- 用户流失
- 系统崩溃

掌握监控工具，及时发现瓶颈，是运维必备技能。

## CPU 监控

### top - 实时进程监控

```bash
top

# 按 P 按 CPU 排序
# 按 M 按内存排序
# 按 q 退出
```

**关键指标：**
- `us`：用户进程占用
- `sy`：系统进程占用
- `id`：空闲百分比
- `wa`：等待 IO（过高说明磁盘瓶颈）

### htop - 美化版 top

```bash
# 安装
sudo apt install htop

# 使用
htop
```

功能更丰富，支持鼠标交互，可视化更好。

### mpstat - 多核 CPU 统计

```bash
# 安装
sudo apt install sysstat

# 查看 CPU 统计
mpstat -P ALL 1

# 输出示例
# CPU  %usr  %nice %sys %iowait %irq %soft %idle
# all  25.3  0.0   3.2  0.5     0.0  0.1   70.9
# 0    30.2  0.0   2.1  0.3     0.0  0.0   67.4
```

### uptime - 系统负载

```bash
uptime
# 10:30:45 up 5 days, 3 users, load average: 0.5, 0.3, 0.1
```

**load average：**
- 三个数值：1分钟、5分钟、15分钟平均负载
- 负载 ≈ CPU 核数时系统繁忙
- 负载 > CPU 核数时系统过载

## 内存监控

### free - 内存使用

```bash
free -h
#               total    used    free    shared  buff/cache   available
# Mem:          16Gi    8Gi     2Gi     500Mi   6Gi          6Gi
# Swap:         8Gi     1Gi     7Gi
```

**关键理解：**
- `available` 是真正可用内存（比 free 更准确）
- `buff/cache` 是缓存，应用需要时可释放

### vmstat - 虚拟内存统计

```bash
vmstat 1 5
# procs -----------memory---------- ---swap-- -----io---- -system-- ----cpu----
#  r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs  us sy id wa
#  1  0  1024   2048   512   4096    0    0     5     2   50   30  25  5 70  0
```

**关键指标：**
- `si/so`：swap in/out（有值说明内存不足）
- `bi/bo`：块设备读写
- `r`：等待运行的进程数

### ps_mem - 进程内存排序

```bash
# 安装
pip install ps_mem

# 使用
sudo ps_mem
# Private  +   Shared  =  RAM used    Program
# 500.0 MiB +  10.0 MiB = 510.0 MiB   python
# 200.0 MiB +   5.0 MiB = 205.0 MiB   nginx
```

## 磁盘监控

### df - 磁盘空间

```bash
df -h
# Filesystem      Size  Used Avail Use% Mounted on
# /dev/sda1       100G   50G   50G  50% /
```

### du - 目录大小

```bash
# 查看当前目录大小
du -sh .

# 查看子目录大小并排序
du -sh * | sort -rh
```

### iotop - IO 使用排名

```bash
# 安装
sudo apt install iotop

# 使用
sudo iotop
```

显示各进程的磁盘读写速率，找出 IO 瓶颈进程。

### iostat - IO 统计

```bash
iostat -x 1
# Device  r/s   w/s   rkB/s  wkB/s  %util
# sda     50    30    500    300    85.0
```

`%util` 过高说明磁盘繁忙。

## 网络监控

### iftop - 流量监控

```bash
# 安装
sudo apt install iftop

# 使用
sudo iftop
```

显示各连接的实时流量。

### nethogs - 进程流量

```bash
# 安装
sudo apt install nethogs

# 使用
sudo nethogs
```

按进程显示网络流量，找出占用带宽的程序。

### netstat/ss - 连接统计

```bash
# 查看所有连接
ss -tunlp

# 查看端口占用
ss -tlnp | grep 80

# 统计连接状态
ss -s
# TCP: 100 (estab 50, closed 30, synrecv 10)
```

### ping - 网络连通性

```bash
ping -c 4 8.8.8.8
# 4 packets transmitted, 4 received, 0% packet loss
# avg latency = 20.5 ms
```

### mtr - 路由追踪

```bash
# 安装
sudo apt install mtr

# 使用
mtr 8.8.8.8
```

结合 ping 和 traceroute，可视化网络路径质量。

## 进程监控

### ps - 进程列表

```bash
# 查看所有进程
ps aux

# 按 CPU 排序
ps aux --sort=-%cpu | head

# 查找进程
ps aux | grep nginx
```

### pidstat - 进程资源使用

```bash
# CPU 使用
pidstat -p <pid> 1

# 内存使用
pidstat -r -p <pid> 1

# IO 使用
pidstat -d -p <pid> 1
```

### strace - 进程调用追踪

```bash
# 追踪进程系统调用
strace -p <pid>

# 追踪程序启动
strace python script.py
```

## 综合监控工具

### glances - 全景监控

```bash
# 安装
pip install glances

# 使用
glances
```

一站式显示 CPU、内存、磁盘、网络、进程。

### dstat - 多维度统计

```bash
# 安装
sudo apt install dstat

# CPU + 内存 + 网络
dstat -c -m -n
```

### sar - 系统活动报告

```bash
# 安装（sysstat 包）
sudo apt install sysstat

# 启用
sudo systemctl enable sysstat

# 查看历史 CPU 数据
sar -u

# 查看历史内存数据
sar -r
```

## 监控脚本示例

### 一键健康检查

```bash
#!/bin/bash

echo "=== 系统健康检查 ==="
echo ""

echo "【CPU】"
uptime
echo ""

echo "【内存】"
free -h | grep Mem
echo ""

echo "【磁盘】"
df -h | grep -E "^/dev"
echo ""

echo "【网络】"
ping -c 1 8.8.8.8 &>/dev/null && echo "网络正常" || echo "网络异常"
echo ""

echo "【关键服务】"
systemctl is-active nginx mysql redis &>/dev/null
echo ""
```

### 高负载告警

```bash
#!/bin/bash

LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}')
CPU_CORES=$(nproc)
THRESHOLD=$(echo "$CPU_CORES * 0.8" | bc)

if [ $(echo "$LOAD > $THRESHOLD" | bc) -eq 1 ]; then
    echo "警告：系统负载过高！当前负载: $LOAD"
    # 可以添加邮件/短信通知
fi
```

## 监控工具速查表

| 类别 | 工具 | 用途 |
|------|------|------|
| CPU | top/htop | 实时进程监控 |
| CPU | mpstat | 多核统计 |
| 内存 | free | 内存概况 |
| 内存 | vmstat | 内存+swap |
| 磁盘 | df/du | 空间统计 |
| 磁盘 | iotop | IO 进程排名 |
| 网络 | iftop | 流量监控 |
| 网络 | ss | 连接统计 |
| 综合 | glances | 一站式监控 |

## 总结

性能监控三步走：

1. **发现问题**：top/free/df 快速检查
2. **定位瓶颈**：iotop/nethogs 找源头
3. **深入分析**：strace/pidstat 看细节

**日常运维建议：**
- 定期检查（每天一次 glances）
- 设置告警（负载/磁盘超过阈值自动通知）
- 保留历史（sar 收集历史数据）

掌握这些工具，服务器健康一目了然！