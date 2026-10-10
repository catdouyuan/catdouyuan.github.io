/* Main Application Script for Nexmoe Style Blog */

// Global Blog State
window.BlogData = null;

// Load Index Data
async function loadBlogData() {
  if (window.BlogData) return window.BlogData;
  try {
    const res = await fetch('/articles/index.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to load articles/index.json');
    window.BlogData = await res.json();
    return window.BlogData;
  } catch (err) {
    console.error('loadBlogData error:', err);
    return null;
  }
}

// Format Date
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

// Calculate Reading Time & Word Count
function getWordCountAndReadingTime(text) {
  const clean = text.replace(/```[\s\S]*?```/g, '').replace(/#+\s/g, '');
  const cjk = (clean.match(/[\u4e00-\u9fa5]/g) || []).length;
  const words = (clean.replace(/[\u4e00-\u9fa5]/g, ' ').match(/\b\w+\b/g) || []).length;
  const total = cjk + words;
  const minutes = Math.max(1, Math.round(cjk / 400 + words / 220));
  return {
    count: total > 1000 ? (total / 1000).toFixed(1) + 'k' : total,
    minutes: minutes
  };
}

// Hitokoto (一言)
function initHitokoto() {
  const hitokotoText = document.getElementById('hitokoto_text');
  if (!hitokotoText) return;

  fetch('https://v1.hitokoto.cn?c=i&c=k&c=d')
    .then(res => res.json())
    .then(data => {
      hitokotoText.innerHTML = `「${data.hitokoto}」<br><span style="font-size: 11px; color: #888; display: block; text-align: right; margin-top: 4px;">—— ${data.from_who ? data.from_who + ' ' : ''}《${data.from}》</span>`;
      hitokotoText.href = `https://hitokoto.cn/?uuid=${data.uuid}`;
      hitokotoText.target = '_blank';
    })
    .catch(() => {
      hitokotoText.innerText = '保持好奇，持续记录。';
    });
}

// Site Running Duration Timer
function initSiteTime(startTimeStr) {
  const sitetimeEl = document.getElementById('sitetime');
  if (!sitetimeEl) return;

  function update() {
    const days = 1000 * 60 * 60 * 24;
    const t1 = new Date(startTimeStr || '2026-01-01T00:00:00').getTime();
    const t2 = Date.now();
    const diffDays = Math.floor((t2 - t1) / days);
    sitetimeEl.innerHTML = `${diffDays} days traveling`;
  }
  update();
  setInterval(update, 60000);
}

// Initialize Sidebar Widgets (Counts, Tag Cloud, Categories, Archives, Recent)
async function initSidebar() {
  const data = await loadBlogData();
  if (!data) return;

  const articles = data.articles || [];
  const statArticles = document.getElementById('stat-articles');
  const statTags = document.getElementById('stat-tags');
  const statCategories = document.getElementById('stat-categories');

  // Tags collection
  const tagMap = {};
  const categoryMap = {};

  articles.forEach(art => {
    (art.tags || []).forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; });
    if (art.category) categoryMap[art.category] = (categoryMap[art.category] || 0) + 1;
  });

  const uniqueTags = Object.keys(tagMap);
  const uniqueCategories = Object.keys(categoryMap);

  if (statArticles) statArticles.innerText = articles.length;
  if (statTags) statTags.innerText = uniqueTags.length;
  if (statCategories) statCategories.innerText = uniqueCategories.length;

  // Tag Cloud
  const tagcloudEl = document.getElementById('randomtagcloud');
  if (tagcloudEl) {
    let tagHtml = '';
    uniqueTags.forEach(tag => {
      tagHtml += `<a href="/archive.html?tag=${encodeURIComponent(tag)}" style="font-size: 13px;">${tag}</a> `;
    });
    tagcloudEl.innerHTML = tagHtml;
  }

  // Categories list
  const categoryListEl = document.getElementById('sidebar-categories');
  if (categoryListEl) {
    let catHtml = '';
    uniqueCategories.forEach(cat => {
      catHtml += `<li class="category-list-item">
        <a class="category-list-link" href="/archive.html?cat=${encodeURIComponent(cat)}">${cat}</a>
        <span class="category-list-count">${categoryMap[cat]}</span>
      </li>`;
    });
    categoryListEl.innerHTML = catHtml;
  }


  // Recent posts list
  const recentListEl = document.getElementById('sidebar-recent');
  if (recentListEl) {
    let recHtml = '';
    articles.slice(0, 5).forEach(art => {
      recHtml += `<li><a href="/article.html?slug=${encodeURIComponent(art.slug)}">${art.title}</a></li>`;
    });
    recentListEl.innerHTML = recHtml;
  }

  // Social icons
  const socialEl = document.getElementById('sidebar-social');
  if (socialEl && data.social) {
    let socHtml = '';
    data.social.forEach(s => {
      socHtml += `<a class="mdui-ripple" href="${s.url}" target="_blank" rel="noopener" mdui-tooltip="{content: '${s.name}'}" style="color: ${s.color}; background-color: ${s.bg};">
        <i class="nexmoefont ${s.icon}"></i>
      </a>`;
    });
    socialEl.innerHTML = socHtml;
  }
}

// Search Modal functionality
function sopen() {
  const modal = document.getElementById('nexmoe-search-space');
  if (modal) {
    modal.style.display = 'flex';
    const input = document.getElementById('search_input_modal');
    if (input) {
      input.focus();
      sinput();
    }
  }
}

function sclose() {
  const modal = document.getElementById('nexmoe-search-space');
  if (modal) modal.style.display = 'none';
}

async function sinput() {
  const input = document.getElementById('search_input_modal');
  const resultsContainer = document.getElementById('search_results_modal');
  if (!input || !resultsContainer) return;

  const kw = input.value.trim().toLowerCase();
  if (!kw) {
    resultsContainer.innerHTML = '<p style="color: #999; text-align: center; margin-top: 20px;">请输入关键词搜索文章…</p>';
    return;
  }

  const data = await loadBlogData();
  if (!data || !data.articles) return;

  const hits = data.articles.filter(art => {
    const titleMatch = (art.title || '').toLowerCase().includes(kw);
    const summaryMatch = (art.summary || '').toLowerCase().includes(kw);
    const tagMatch = (art.tags || []).some(t => t.toLowerCase().includes(kw));
    const catMatch = (art.category || '').toLowerCase().includes(kw);
    return titleMatch || summaryMatch || tagMatch || catMatch;
  });

  if (!hits.length) {
    resultsContainer.innerHTML = '<p style="color: #999; text-align: center; margin-top: 20px;">没有找到匹配的文章</p>';
    return;
  }

  let html = '';
  hits.forEach(art => {
    const regex = new RegExp(`(${kw})`, 'gi');
    const highlightedTitle = art.title.replace(regex, '<span class="search-keyword">$1</span>');
    const highlightedSummary = (art.summary || '').replace(regex, '<span class="search-keyword">$1</span>');
    html += `<div class="search-result">
      <a href="/article.html?slug=${encodeURIComponent(art.slug)}">
        <h3>${highlightedTitle}</h3>
        <p>${highlightedSummary}</p>
      </a>
    </div>`;
  });
  resultsContainer.innerHTML = html;
}

// Image fallback
function imgOnError(img) {
  img.src = '/images/post/markerdown.jpg';
  img.onerror = null;
}

// Smooth scrolling for catalog links
document.addEventListener('click', function(e) {
  const link = e.target.closest('a.toc-link');
  if (link) {
    const targetId = link.getAttribute('href');
    if (targetId && targetId.startsWith('#')) {
      e.preventDefault();
      const targetEl = document.querySelector(decodeURI(targetId));
      if (targetEl) {
        window.scroll({
          top: targetEl.offsetTop - 24,
          behavior: 'smooth'
        });
      }
    }
  }
});

// Setup copy buttons on code blocks
function setupCodeTools(container) {
  if (!container) return;
  container.querySelectorAll('pre').forEach(pre => {
    if (pre.querySelector('.copy-code-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'copy-code-btn';
    btn.type = 'button';
    btn.textContent = '复制';
    btn.addEventListener('click', () => {
      const code = pre.querySelector('code');
      const text = code ? code.innerText : pre.innerText;
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '已复制!';
        setTimeout(() => { btn.textContent = '复制'; }, 1500);
      });
    });
    pre.style.position = 'relative';
    pre.appendChild(btn);
  });
}

// Init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initHitokoto();
  loadBlogData().then(data => {
    const startTime = (data && data.site && data.site.startTime) || '2026-01-01T00:00:00';
    initSiteTime(startTime);
    initSidebar();
  });
});
