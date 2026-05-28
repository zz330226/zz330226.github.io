/**
 * Sidebar Search - 侧边栏内联搜索
 * 读取 /search.xml，在侧边栏搜索框内直接展示搜索结果
 */
;(function () {
  'use strict'

  const INPUT_ID = 'sidebar-search-input'
  const BTN_ID = 'sidebar-search-btn'
  const RESULTS_ID = 'sidebar-search-results'
  const MAX_RESULTS = 8

  let searchIndex = null
  let debounceTimer = null

  /**
   * 加载并解析 search.xml
   */
  function loadSearchData() {
    const searchPath = window.GLOBAL_CONFIG?.localSearch?.path || '/search.xml'
    return fetch(searchPath)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load search data')
        return res.text()
      })
      .then(xmlText => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(xmlText, 'text/xml')
        const entries = doc.querySelectorAll('entry')
        const index = []
        entries.forEach(entry => {
          const title = entry.querySelector('title')?.textContent || ''
          const url = entry.querySelector('url')?.textContent || ''
          const content = entry.querySelector('content')?.textContent || ''
          const tags = entry.querySelectorAll('tag')
          const tagList = Array.from(tags).map(t => t.textContent)
          index.push({ title, url, content, tags: tagList })
        })
        return index
      })
      .catch(err => {
        console.warn('[SidebarSearch] 加载搜索数据失败:', err)
        return []
      })
  }

  /**
   * 简单的文本搜索匹配
   */
  function search(query, index) {
    if (!query || !query.trim()) return []
    const keywords = query.toLowerCase().trim().split(/\s+/)
    const results = []

    for (const item of index) {
      const titleLower = (item.title || '').toLowerCase()
      const contentLower = (item.content || '').toLowerCase()
      const tagsLower = (item.tags || []).join(' ').toLowerCase()

      let score = 0
      let matched = false

      for (const kw of keywords) {
        // 标题匹配权重最高
        if (titleLower.includes(kw)) {
          score += 10
          matched = true
        }
        // 标签匹配
        if (tagsLower.includes(kw)) {
          score += 5
          matched = true
        }
        // 内容匹配
        if (contentLower.includes(kw)) {
          score += 1
          matched = true
        }
      }

      if (matched) {
        // 提取摘要：取关键词附近的内容片段
        const excerpt = getExcerpt(item.content, keywords[0], 80)
        results.push({ ...item, score, excerpt })
      }
    }

    // 按分数降序排列
    results.sort((a, b) => b.score - a.score)
    return results.slice(0, MAX_RESULTS)
  }

  /**
   * 提取关键词附近的文本片段作为摘要
   */
  function getExcerpt(text, keyword, maxLen) {
    if (!text) return ''
    const lower = text.toLowerCase()
    const idx = lower.indexOf(keyword.toLowerCase())
    if (idx === -1) {
      return text.length > maxLen ? text.substring(0, maxLen) + '...' : text
    }
    // 去掉 HTML 标签
    const clean = text.replace(/<[^>]+>/g, '')
    const cleanLower = clean.toLowerCase()
    const cleanIdx = cleanLower.indexOf(keyword.toLowerCase())
    if (cleanIdx === -1) {
      return clean.length > maxLen ? clean.substring(0, maxLen) + '...' : clean
    }
    const start = Math.max(0, cleanIdx - 20)
    const end = Math.min(clean.length, cleanIdx + maxLen - 20)
    let excerpt = ''
    if (start > 0) excerpt += '...'
    excerpt += clean.substring(start, end)
    if (end < clean.length) excerpt += '...'
    return excerpt
  }

  /**
   * 高亮匹配文本
   */
  function highlight(text, keywords) {
    if (!text) return ''
    let result = text
    for (const kw of keywords) {
      if (!kw) continue
      const regex = new RegExp(
        kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'gi'
      )
      result = result.replace(regex, '<mark>$&</mark>')
    }
    return result
  }

  /**
   * 渲染搜索结果
   */
  function renderResults(results, keywords) {
    const container = document.getElementById(RESULTS_ID)
    if (!container) return

    if (!results || results.length === 0) {
      const query = document.getElementById(INPUT_ID)?.value?.trim()
      if (query) {
        container.innerHTML = '<div class="sidebar-search-empty">未找到相关文章</div>'
        container.style.display = 'block'
      } else {
        container.innerHTML = ''
        container.style.display = 'none'
      }
      return
    }

    const html = results
      .map(item => {
        const title = highlight(escapeHtml(item.title), keywords)
        const excerpt = highlight(escapeHtml(item.excerpt), keywords)
        return `<a class="sidebar-search-item" href="${item.url}" title="${escapeHtml(item.title)}">
          <div class="sidebar-search-item-title">${title}</div>
          <div class="sidebar-search-item-excerpt">${excerpt}</div>
        </a>`
      })
      .join('')

    container.innerHTML = html
    container.style.display = 'block'
  }

  function escapeHtml(str) {
    if (!str) return ''
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  /**
   * 执行搜索
   */
  function doSearch() {
    const input = document.getElementById(INPUT_ID)
    if (!input || !searchIndex) return

    const query = input.value.trim()
    if (!query) {
      renderResults([], [])
      return
    }

    const keywords = query.split(/\s+/).filter(Boolean)
    const results = search(query, searchIndex)
    renderResults(results, keywords)
  }

  /**
   * 初始化
   */
  function init() {
    const input = document.getElementById(INPUT_ID)
    const btn = document.getElementById(BTN_ID)
    if (!input) return

    // 加载搜索数据
    loadSearchData().then(data => {
      searchIndex = data
    })

    // 输入事件（防抖）
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(doSearch, 300)
    })

    // 回车搜索
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        clearTimeout(debounceTimer)
        doSearch()
      }
    })

    // 点击搜索按钮
    if (btn) {
      btn.addEventListener('click', () => {
        clearTimeout(debounceTimer)
        doSearch()
      })
    }

    // 点击外部关闭结果
    document.addEventListener('click', (e) => {
      const card = document.getElementById('sidebar-search')
      if (card && !card.contains(e.target)) {
        const container = document.getElementById(RESULTS_ID)
        if (container) {
          container.style.display = 'none'
        }
      }
    })

    // 聚焦时如果有数据则显示
    input.addEventListener('focus', () => {
      if (input.value.trim() && searchIndex) {
        doSearch()
      }
    })
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
