// Claude Theme - Main JavaScript

// 导航栏滚动效果
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (window.scrollY > 50) {
    header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  } else {
    header.style.boxShadow = 'none';
  }
});

// 博主头像点击旋转效果
document.querySelectorAll('.author-avatar').forEach(avatar => {
  avatar.addEventListener('click', function() {
    this.classList.add('clicked');
    setTimeout(() => {
      this.classList.remove('clicked');
    }, 500);
  });
});

// 图片轮播功能
const carousel = {
  slides: document.querySelectorAll('.carousel-slide'),
  indicators: document.querySelectorAll('.indicator'),
  current: 0,
  interval: null,

  init() {
    if (this.slides.length === 0) return;

    // 自动轮播
    this.start();

    // 点击指示器切换
    this.indicators.forEach((ind, i) => {
      ind.addEventListener('click', () => {
        this.goTo(i);
      });
    });
  },

  goTo(index) {
    this.slides[this.current].classList.remove('active');
    this.indicators[this.current].classList.remove('active');

    this.current = index;

    this.slides[this.current].classList.add('active');
    this.indicators[this.current].classList.add('active');
  },

  next() {
    const nextIndex = (this.current + 1) % this.slides.length;
    this.goTo(nextIndex);
  },

  start() {
    this.interval = setInterval(() => this.next(), 5000);
  },

  stop() {
    clearInterval(this.interval);
  }
};

// 初始化轮播
document.addEventListener('DOMContentLoaded', () => {
  carousel.init();
  initTagCloud3D();
});

// 3D标签云球体
function initTagCloud3D() {
  const container = document.getElementById('tagCloud3d');
  if (!container) return;

  const tags = container.querySelectorAll('.tag-3d-item');
  const radius = 90; // 球体半径
  const tagCount = tags.length;

  if (tagCount === 0) return;

  // 容器尺寸
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;

  // 与白底反差大的颜色
  const colors = [
    '#D97706', '#059669', '#7C3AED', '#DC2626', '#2563EB',
    '#EA580C', '#0891B2', '#4F46E5', '#16A34A', '#9333EA',
    '#0D9488', '#C2410C', '#5B21B6', '#1D4ED8', '#15803D',
    '#E11D48', '#6D28D9', '#0369A1', '#B91C1C', '#713F12'
  ];

  // 计算每个标签在球体上的位置
  tags.forEach((tag, i) => {
    // 使用螺旋分布算法
    const phi = Math.acos(-1 + (2 * i + 1) / tagCount);
    const theta = Math.sqrt(tagCount * Math.PI) * phi;

    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);

    // 随机颜色
    tag.style.color = colors[i % colors.length];

    // 存储初始坐标
    tag.dataset.x = x;
    tag.dataset.y = y;
    tag.dataset.z = z;
  });

  // 旋转动画
  let angleY = 0;
  let speed = 0.005;

  container.addEventListener('mouseenter', () => {
    speed = 0.002;
  });

  container.addEventListener('mouseleave', () => {
    speed = 0.005;
  });

  function rotate() {
    angleY += speed;

    tags.forEach(tag => {
      const x = parseFloat(tag.dataset.x);
      const y = parseFloat(tag.dataset.y);
      const z = parseFloat(tag.dataset.z);

      // Y轴旋转
      const newX = x * Math.cos(angleY) - z * Math.sin(angleY);
      const newZ = x * Math.sin(angleY) + z * Math.cos(angleY);

      // 居中定位（考虑标签宽度）
      const tagWidth = tag.offsetWidth;
      const tagHeight = tag.offsetHeight;
      const posX = centerX + newX - tagWidth / 2;
      const posY = centerY + y - tagHeight / 2;

      // 更新位置
      tag.style.left = posX + 'px';
      tag.style.top = posY + 'px';
      tag.style.transform = `translateZ(${newZ}px)`;

      // 根据Z值调整透明度（近亮远淡）
      const opacity = (newZ + radius) / (2 * radius) * 0.6 + 0.4;
      tag.style.opacity = opacity;
      tag.style.zIndex = Math.round(newZ);
    });

    requestAnimationFrame(rotate);
  }

  rotate();
}

// 代码块工具栏 - Butterfly风格
function initCodeBlocks() {
  document.querySelectorAll('.post-content figure.highlight').forEach(figure => {
    // 获取语言类型
    const classList = figure.className.split(' ');
    let lang = 'code';
    for (const cls of classList) {
      if (cls !== 'highlight' && cls !== 'plaintext') {
        lang = cls;
        break;
      }
    }

    // 创建工具栏
    const tools = document.createElement('div');
    tools.className = 'highlight-tools';
    tools.innerHTML = `
      <div class="mac-style">
        <div class="mac-close"></div>
        <div class="mac-minimize"></div>
        <div class="mac-maximize"></div>
      </div>
      <div class="code-lang">${lang}</div>
    `;

    // 创建复制按钮
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';

    // 插入工具栏和复制按钮
    figure.insertBefore(tools, figure.firstChild);
    figure.appendChild(copyBtn);

    copyBtn.addEventListener('click', function() {
      // 从每个 .line span 获取文本，跳过纯数字行
      const lines = figure.querySelectorAll('.line');
      let codeArr = [];

      lines.forEach(line => {
        let text = line.textContent.trim();
        // 如果这行只是数字（行号），跳过它
        if (!/^\d+$/.test(text)) {
          codeArr.push(text);
        }
      });

      const code = codeArr.join('\n');

      navigator.clipboard.writeText(code);
      this.innerHTML = '<i class="fas fa-check"></i>';
      this.classList.add('copied');
      setTimeout(() => {
        this.innerHTML = '<i class="fas fa-copy"></i>';
        this.classList.remove('copied');
      }, 2000);
    });
  });
}

document.addEventListener('DOMContentLoaded', initCodeBlocks);

// 本地搜索功能
const localSearch = {
  data: null,

  async init() {
    try {
      const response = await fetch('/search.xml');
      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      const entries = xml.querySelectorAll('entry');

      this.data = [];
      entries.forEach(entry => {
        this.data.push({
          title: entry.querySelector('title').textContent,
          url: entry.querySelector('url').textContent,
          content: entry.querySelector('content').textContent.replace(/<[^>]+>/g, '').trim(),
          categories: entry.querySelector('categories')?.textContent || ''
        });
      });
    } catch (e) {
      console.error('搜索数据加载失败:', e);
    }
  },

  search(keyword) {
    if (!this.data || !keyword.trim()) return [];

    const kw = keyword.toLowerCase();
    return this.data.filter(item =>
      item.title.toLowerCase().includes(kw) ||
      item.content.toLowerCase().includes(kw) ||
      item.categories.toLowerCase().includes(kw)
    );
  }
};

// 搜索UI
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  if (!searchInput || !searchBtn) return;

  // 创建搜索结果弹窗
  let searchModal = null;

  function createModal() {
    if (searchModal) return;

    searchModal = document.createElement('div');
    searchModal.id = 'searchModal';
    searchModal.innerHTML = `
      <div class="search-modal-content">
        <div class="search-modal-header">
          <input type="text" id="modalSearchInput" placeholder="输入关键词搜索...">
          <button id="modalSearchClose"><i class="fas fa-times"></i></button>
        </div>
        <div class="search-results"></div>
      </div>
    `;
    searchModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
      display: none;
      justify-content: center;
      align-items: flex-start;
      padding-top: 80px;
    `;

    const content = searchModal.querySelector('.search-modal-content');
    content.style.cssText = `
      background: var(--card);
      width: 600px;
      max-height: 70vh;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    `;

    const header = searchModal.querySelector('.search-modal-header');
    header.style.cssText = `
      display: flex;
      gap: 12px;
      padding: 16px;
      border-bottom: 1px solid var(--border);
    `;

    const modalInput = searchModal.querySelector('#modalSearchInput');
    modalInput.style.cssText = `
      flex: 1;
      padding: 12px 16px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg-secondary);
      color: var(--text);
      font-size: 1rem;
    `;

    const closeBtn = searchModal.querySelector('#modalSearchClose');
    closeBtn.style.cssText = `
      width: 44px;
      height: 44px;
      background: var(--bg-secondary);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    document.body.appendChild(searchModal);

    // 关闭按钮
    closeBtn.addEventListener('click', () => {
      searchModal.style.display = 'none';
    });

    // 点击背景关闭
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) {
        searchModal.style.display = 'none';
      }
    });

    // 模态框输入搜索
    modalInput.addEventListener('input', () => {
      performSearch(modalInput.value);
    });

    modalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchModal.style.display = 'none';
      }
    });
  }

  function performSearch(keyword) {
    const resultsDiv = searchModal.querySelector('.search-results');
    resultsDiv.style.cssText = `
      padding: 16px;
      max-height: 50vh;
      overflow-y: auto;
    `;

    if (!keyword.trim()) {
      resultsDiv.innerHTML = '<p style="color: var(--text-muted); text-align: center;">请输入搜索关键词</p>';
      return;
    }

    const results = localSearch.search(keyword);

    if (results.length === 0) {
      resultsDiv.innerHTML = '<p style="color: var(--text-muted); text-align: center;">未找到相关文章</p>';
      return;
    }

    resultsDiv.innerHTML = results.map(item => `
      <a href="${item.url}" class="search-result-item" style="
        display: block;
        padding: 12px;
        margin-bottom: 8px;
        background: var(--bg-secondary);
        border-radius: 8px;
        color: var(--text);
        transition: all 0.2s;
      ">
        <div style="font-weight: 600; margin-bottom: 6px; color: var(--accent);">${item.title}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${item.content.substring(0, 100)}...
        </div>
      </a>
    `).join('');

    // 悬停效果
    resultsDiv.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        item.style.background = 'rgba(217,119,6,0.1)';
        item.style.transform = 'translateX(4px)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.background = 'var(--bg-secondary)';
        item.style.transform = 'translateX(0)';
      });
    });
  }

  // 点击搜索按钮
  searchBtn.addEventListener('click', async () => {
    createModal();

    if (!localSearch.data) {
      await localSearch.init();
    }

    searchModal.style.display = 'flex';
    const modalInput = searchModal.querySelector('#modalSearchInput');
    modalInput.value = searchInput.value;
    modalInput.focus();
    performSearch(modalInput.value);
  });

  // 回车搜索
  searchInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });
}

// 初始化搜索
document.addEventListener('DOMContentLoaded', () => {
  localSearch.init();
  initSearch();
});