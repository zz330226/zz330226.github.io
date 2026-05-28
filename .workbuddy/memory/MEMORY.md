# 博客项目长期记忆

## 部署流程（重要，务必照做）
- 静态页面部署：`hexo clean && hexo generate && hexo deploy`（推送到 main 分支）
- **前提条件**：`_config.yml` 的 `include` 必须包含 `.nojekyll`，且 `source/.nojekyll` 文件存在
- 部署后确认输出包含 `Generated: .nojekyll` 和 `Deploy done: git`
- sandbox 环境也可以执行 hexo deploy（已验证可行）
- 如遇 `unable to index file 'nul'` 错误，检查项目根目录是否有 Windows 保留文件名 `nul`
- 如 `.deploy_git` 被破坏，执行 `hexo clean` 即可清除重建
- **不要用 `scripts/nojekyll.js` 脚本方案**，`generateAfter` 事件时 public/ 可能不存在导致 ENOENT 崩溃，正确做法是用 `_config.yml` 的 `include` 指令

## GitHub Pages 注意事项
- 缺少 `.nojekyll` 文件时，即使使用 "Deploy from a branch" 模式，GitHub Pages 也会尝试用 Jekyll 构建
- Jekyll 构建会下载 `actions/jekyll-build-pages` action，下载失败会报内部服务器错误
- **解决办法**：确保每次部署都包含 `.nojekyll` 文件

## 博客规范
- 中文撰写，英文文件名
- 封面图放在 `source/img/` 目录
- 分类常用：AI工具箱、Python开发、Linux运维、GitHub精选
- 用户做完封面图后会通知更新

## 跨平台推广经验
- **知乎**：`opencli zhihu answer`，需 COOKIE 策略，可附带博客链接和推广码
- **B站专栏**：`opencli browser` 手动操作，编辑器在 iframe 内需 eval 跨 frame，中文需 base64 编码注入。已有 skill: `bilibili-publish-article`
- **小红书**：`opencli xiaohongshu publish` 直接命令（推荐），自动处理图片上传和表单填写。已有 skill: `xiaohongshu-publish-article`
  - **重要**：`\n` 在小红书不换行，会原样显示！需用 bash `$'...'` 语法传实际换行
  - 标题限 20 字，图片限 jpg/png/webp（不支持 gif），最多 9 张
- **YouTube**：只有读操作，发社区帖需 500+ 粉，暂不可用
- **opencli browser**：`bind` 可复用已有浏览器窗口，`upload` 命令有 markerAttr bug
- 用户推广码：MiMo 邀请码 JFAX7G，链接 https://platform.xiaomimimo.com?ref=JFAX7G

## Butterfly 主题定制
- 侧边栏搜索框：通过 `source/_data/widget.yml`（top 组）+ `card_top_self` 注入
- 搜索脚本：`source/js/sidebar-search.js`，样式：`source/css/sidebar-search.css`
- 配置注入：`_config.butterfly.yml` 的 `inject.head`（CSS）和 `inject.bottom`（JS）
