/* Article Reader & Enhancements for Nexmoe Style */

(async function () {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  const titleEl = document.getElementById('post-title');
  const coverImg = document.getElementById('post-cover-img');
  const dateEl = document.getElementById('post-date');
  const categoryEl = document.getElementById('post-category');
  const wordsEl = document.getElementById('post-words');
  const timeEl = document.getElementById('post-time');
  const bodyEl = document.getElementById('article-body');
  const copyrightLink = document.getElementById('copyright-link');
  const tagsListEl = document.getElementById('post-tags-list');
  const tocList = document.getElementById('toc-list');
  const tocBtn = document.querySelector('.catalog');

  if (!slug) {
    if (titleEl) titleEl.innerText = '缺少文章参数';
    if (bodyEl) bodyEl.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">请指定正确的文章链接。</p>';
    return;
  }

  const data = await loadBlogData();
  if (!data || !data.articles) {
    if (titleEl) titleEl.innerText = '加载文章失败';
    return;
  }

  const artIndex = data.articles.findIndex(a => a.slug === slug);
  if (artIndex === -1) {
    if (titleEl) titleEl.innerText = '文章不存在';
    if (bodyEl) bodyEl.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">找不到该文章，请检查链接。</p>';
    return;
  }

  const article = data.articles[artIndex];
  document.title = `${article.title} - ${data.site.title || 'catyuan · 技术博客'}`;

  // Set Post Header & Metadata
  if (titleEl) titleEl.innerText = article.title;
  if (coverImg) {
    coverImg.src = article.cover || '/images/background/back.jpg';
    coverImg.alt = article.title;
  }
  if (dateEl) dateEl.innerText = formatDate(article.date);
  if (categoryEl) {
    categoryEl.innerText = article.category || '随笔';
    categoryEl.href = `/archive.html?cat=${encodeURIComponent(article.category || '随笔')}`;
  }
  if (copyrightLink) {
    copyrightLink.href = window.location.href;
    copyrightLink.innerText = window.location.href;
  }

  // Tags
  if (tagsListEl && article.tags) {
    let tagHtml = '';
    article.tags.forEach(t => {
      tagHtml += `<a class="nexmoefont icon-tag-fill -none-link" href="/archive.html?tag=${encodeURIComponent(t)}">${t}</a> `;
    });
    tagsListEl.innerHTML = tagHtml;
  }

  // Fetch Markdown content (supports category subfolder, custom path, or root articles/ directory)
  try {
    const candidatePaths = [];

    // 1. Explicit path in index.json if provided
    if (article.path) {
      const cleanPath = article.path.startsWith('/') ? article.path.slice(1) : article.path;
      candidatePaths.push(`/articles/${cleanPath.split('/').map(encodeURIComponent).join('/')}`);
    }

    // 2. Category subfolder: /articles/{category}/{slug}.md
    if (article.category) {
      candidatePaths.push(`/articles/${encodeURIComponent(article.category)}/${encodeURIComponent(slug)}.md`);
    }

    // 3. Fallback to root articles directory: /articles/{slug}.md
    candidatePaths.push(`/articles/${encodeURIComponent(slug)}.md`);

    let mdRes = null;
    let lastStatus = 404;

    for (const path of candidatePaths) {
      try {
        const res = await fetch(path);
        if (res.ok) {
          mdRes = res;
          break;
        } else {
          lastStatus = res.status;
        }
      } catch (err) {
        console.warn(`Failed to fetch article from ${path}:`, err);
      }
    }

    if (!mdRes) {
      throw new Error(`HTTP ${lastStatus} (未能从候选路径加载文章正文)`);
    }

    const mdText = await mdRes.text();

    // Word count & Reading time
    const stats = getWordCountAndReadingTime(mdText);
    if (wordsEl) wordsEl.innerText = `约${stats.count}字`;
    if (timeEl) timeEl.innerText = `预计需${stats.minutes}分钟`;

    // Render Markdown via marked
    if (window.marked) {
      bodyEl.innerHTML = marked.parse(mdText);
    } else {
      bodyEl.innerText = mdText;
    }

    // Render GitHub-style Markdown Alerts: [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION]
    const alertMeta = {
      note: { title: 'Note', icon: 'ℹ️' },
      tip: { title: 'Tip', icon: '💡' },
      important: { title: 'Important', icon: '📌' },
      warning: { title: 'Warning', icon: '⚠️' },
      caution: { title: 'Caution', icon: '🛑' }
    };

    bodyEl.querySelectorAll('blockquote').forEach(bq => {
      const firstP = bq.querySelector('p');
      if (!firstP) return;
      const rawText = firstP.innerHTML.trim();
      const match = rawText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
      if (match) {
        const type = match[1].toLowerCase();
        const meta = alertMeta[type] || { title: match[1], icon: 'ℹ️' };
        bq.classList.add('markdown-alert', `markdown-alert-${type}`);

        const remaining = rawText.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(<br\s*\/?>)?/i, '').trim();
        if (remaining) {
          firstP.innerHTML = remaining;
        } else {
          firstP.remove();
        }

        const titleDiv = document.createElement('div');
        titleDiv.className = 'markdown-alert-title';
        titleDiv.innerHTML = `<span class="alert-icon">${meta.icon}</span><span class="alert-text">${meta.title}</span>`;
        bq.insertBefore(titleDiv, bq.firstChild);
      }
    });

    // Render Mermaid Diagrams
    if (window.mermaid) {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'loose'
        });
        const mermaidBlocks = bodyEl.querySelectorAll('pre code.language-mermaid');
        if (mermaidBlocks.length > 0) {
          mermaidBlocks.forEach(block => {
            const pre = block.parentElement;
            const code = block.textContent;
            const div = document.createElement('div');
            div.className = 'mermaid';
            div.textContent = code;
            pre.parentElement.replaceChild(div, pre);
          });
          await mermaid.run({
            nodes: bodyEl.querySelectorAll('.mermaid')
          });
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
      }
    }

    // Code Highlighting
    if (window.hljs) {
      // Fallback aliases for powershell if the external language module failed to load
      try {
        if (!window.hljs.getLanguage('powershell') && window.hljs.getLanguage('shell')) {
          window.hljs.registerAliases(['powershell', 'ps1', 'pwsh'], { languageName: 'shell' });
        }
      } catch (err) {
        console.warn('Language alias registration skipped:', err);
      }

      bodyEl.querySelectorAll('pre code').forEach(block => {
        block.classList.add('hljs');
        try {
          window.hljs.highlightElement(block);
        } catch (e) {
          console.warn('highlight.js error:', e);
        }
      });
    }

    // Setup Code Copy Buttons
    setupCodeTools(bodyEl);

    // Auto-wrap tables in .table-wrapper for smooth responsive horizontal scrolling
    bodyEl.querySelectorAll('table').forEach(table => {
      if (!table.parentElement.classList.contains('table-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });

    // Image Fancybox Lightbox Wrap
    bodyEl.querySelectorAll('img').forEach((img, idx) => {
      img.setAttribute('loading', 'lazy');
      const parent = img.parentNode;
      if (parent.tagName.toLowerCase() !== 'a') {
        const a = document.createElement('a');
        a.href = img.src;
        a.setAttribute('data-fancybox', 'gallery');
        a.setAttribute('data-caption', img.alt || `图 ${idx + 1}`);
        parent.insertBefore(a, img);
        a.appendChild(img);
      }
    });

    // Generate Dynamic TOC
    if (tocList) {
      const headings = bodyEl.querySelectorAll('h1, h2, h3, h4');
      if (headings.length > 0) {
        let tocHtml = '';
        headings.forEach((h, idx) => {
          const id = `heading-${idx}`;
          h.id = id;
          const level = h.tagName.toLowerCase().replace('h', '');
          tocHtml += `<li class="toc-item toc-level-${level}">
            <a class="toc-link" href="#${id}">
              <span class="toc-number">${level}. </span>
              <span class="toc-text">${h.textContent}</span>
            </a>
          </li>`;
        });
        tocList.innerHTML = tocHtml;
        if (tocBtn) tocBtn.style.display = 'block';
      } else {
        if (tocBtn) tocBtn.style.display = 'none';
      }
    }

    // Prev / Next Navigation
    const navEl = document.getElementById('article-nav');
    if (navEl) {
      const prevArt = data.articles[artIndex + 1];
      const nextArt = data.articles[artIndex - 1];
      let navHtml = '';
      if (prevArt) {
        navHtml += `<a class="mdui-btn mdui-ripple" href="/article.html?slug=${encodeURIComponent(prevArt.slug)}" style="border-radius: 8px; text-transform: none; max-width: 48%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><i class="nexmoefont icon-caret-left"></i> 上一篇: ${prevArt.title}</a>`;
      } else {
        navHtml += '<div></div>';
      }
      if (nextArt) {
        navHtml += `<a class="mdui-btn mdui-ripple" href="/article.html?slug=${encodeURIComponent(nextArt.slug)}" style="border-radius: 8px; text-transform: none; max-width: 48%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">下一篇: ${nextArt.title} <i class="nexmoefont icon-caret-right"></i></a>`;
      }
      navEl.innerHTML = navHtml;
    }

    // Init Waline Comments if available
    if (window.Waline && typeof window.Waline.init === 'function') {
      window.Waline.init({
        el: '#waline',
        serverURL: 'https://waline-comment-dusky.vercel.app/',
        path: `/article.html?slug=${slug}`
      });
    }

  } catch (err) {
    console.error('Failed to load markdown:', err);
    bodyEl.innerHTML = `<p style="text-align: center; color: #ff4e6a; padding: 40px;">文章正文读取失败：${err.message}</p>`;
  }
})();
