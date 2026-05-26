// Hexo generate 后自动复制 .nojekyll 到 public 目录
// 防止 GitHub Pages 用 Jekyll 构建
hexo.on('generateAfter', function () {
  const fs = require('fs');
  const path = require('path');
  const publicDir = hexo.public_dir;
  fs.writeFileSync(path.join(publicDir, '.nojekyll'), '');
});
