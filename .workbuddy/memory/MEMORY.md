# 博客项目长期记忆

## 部署流程（重要）
- 源码推送：`git push origin source`
- 静态页面部署：`hexo deploy`（推送到 main 分支）
- **两者缺一不可**，否则 GitHub Pages 不会更新
- sandbox 环境无法执行 hexo deploy（git credential manager 无法弹出 UI），需在用户终端手动执行
- 如遇 `unable to index file 'nul'` 错误，检查项目根目录是否有 Windows 保留文件名 `nul`
- 如 `.deploy_git` 被破坏，需 `rmdir /s /q .deploy_git` 后重建

## 博客规范
- 中文撰写，英文文件名
- 封面图放在 `source/img/` 目录
- 分类常用：AI工具箱、Python开发、Linux运维、GitHub精选
- 用户做完封面图后会通知更新

## Butterfly 主题定制
- 侧边栏搜索框：通过 `source/_data/widget.yml`（top 组）+ `card_top_self` 注入
- 搜索脚本：`source/js/sidebar-search.js`，样式：`source/css/sidebar-search.css`
- 配置注入：`_config.butterfly.yml` 的 `inject.head`（CSS）和 `inject.bottom`（JS）
