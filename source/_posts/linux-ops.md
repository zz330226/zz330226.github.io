---
title: Linux服务器运维笔记
date: 2026-05-21 14:00:00
cover: /img/linux.jpg
categories:
  - Linux运维
tags:
  - Linux
  - Ubuntu
  - 运维
  - 监控
  - Shell
  - 自动化
---

## 系统监控工具

### CPU监控

```bash
# 实时CPU使用率
top -bn1 | grep "Cpu(s)"

# 使用 htop（更友好）
htop

# 查看CPU核心数
nproc
lscpu
```

### 内存监控

```bash
# 内存使用情况
free -h

# 详细内存信息
cat /proc/meminfo

# 按进程排序内存使用
ps aux --sort=-%mem | head -10
```

### 磁盘监控

```bash
# 磁盘使用情况
df -h

# 目录大小统计
du -sh /var/log/*

# 磁盘IO监控
iostat -x 1
```

## 自动化运维脚本

### 系统健康检查脚本

```bash
#!/bin/bash
# system_health.sh - 系统健康检查

ALERT_THRESHOLD=90

# CPU检查
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d% -f1)
if [ $CPU_USAGE -gt $ALERT_THRESHOLD ]; then
    echo "警告: CPU使用率 ${CPU_USAGE}%"
fi

# 内存检查
MEM_USAGE=$(free | grep Mem | awk '{print ($3/$2)*100}')
if [ $MEM_USAGE -gt $ALERT_THRESHOLD ]; then
    echo "警告: 内存使用率 ${MEM_USAGE}%"
fi

# 磁盘检查
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | cut -d% -f1)
if [ $DISK_USAGE -gt $ALERT_THRESHOLD ]; then
    echo "警告: 磁盘使用率 ${DISK_USAGE}%"
fi
```

### 自动备份脚本

```bash
#!/bin/bash
# auto_backup.sh - 自动备份

BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d)

# 备份网站数据
tar -czf $BACKUP_DIR/web_$DATE.tar.gz /var/www/html

# 备份数据库
mysqldump -u root -p'password' --all-databases > $BACKUP_DIR/db_$DATE.sql

# 备份配置文件
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /etc/nginx /etc/mysql

# 删除7天前的备份
find $BACKUP_DIR -mtime +7 -delete

echo "备份完成: $DATE"
```

## 日志管理

### 日志轮转配置

```bash
# /etc/logrotate.d/app
/var/log/app/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
}
```

### 日志分析脚本

```bash
# 分析Nginx访问日志
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10

# 查找错误日志
grep -i error /var/log/nginx/error.log | tail -20

# 实时监控日志
tail -f /var/log/nginx/access.log | grep --line-buffered "404"
```

## 定时任务配置

```bash
# 编辑crontab
crontab -e

# 每小时健康检查
0 * * * * /opt/scripts/system_health.sh >> /var/log/health.log

# 每天凌晨2点备份
0 2 * * * /opt/scripts/auto_backup.sh >> /var/log/backup.log

# 每周清理日志
0 3 * * 0 find /var/log -name "*.log" -mtime +30 -delete
```