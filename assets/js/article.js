/* Article reader: Markdown rendering, navigation and code tools. */
(function () {
  var bodyEl = document.getElementById("article-body");
  var headerEl = document.getElementById("article-header");
  var footerEl = document.getElementById("article-footer");
  var navEl = document.getElementById("article-nav");
  if (!bodyEl || !headerEl) return;

  var slug = new URLSearchParams(location.search).get("slug");

  function shortDate(iso) {
    var m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? m[1] + "-" + m[2] + "-" + m[3] : "—";
  }

  function articleUrl(article) {
    return "article.html?slug=" + encodeURIComponent(article.slug);
  }


  function fail(message) {
    headerEl.innerHTML = '<h1 class="post-title">文章加载失败</h1>';
    bodyEl.innerHTML = '<p class="empty-state article-error">' + Blog.escapeHtml(message) + "</p>";
    if (footerEl) footerEl.innerHTML = "";
    if (navEl) navEl.innerHTML = "";
  }

  function setupCodeTools() {
    bodyEl.querySelectorAll("pre").forEach(function (pre) {
      var code = pre.querySelector("code");
      if (!code || pre.querySelector(".copy-code")) return;
      var button = document.createElement("button");
      button.className = "copy-code";
      button.type = "button";
      button.textContent = "复制";
      button.addEventListener("click", function () {
        var text = code.textContent || "";
        function done() {
          button.textContent = "已复制";
          setTimeout(function () { button.textContent = "复制"; }, 1400);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () {});
        } else {
          var area = document.createElement("textarea");
          area.value = text;
          document.body.appendChild(area);
          area.select();
          document.execCommand("copy");
          area.remove();
          done();
        }
      });
      pre.appendChild(button);
    });
  }

  function highlightCode() {
    if (!window.hljs) return;
    bodyEl.querySelectorAll("pre code").forEach(function (block) {
      window.hljs.highlightElement(block);
    });
  }

  function renderNav(articles, index) {
    if (!navEl) return;
    var newer = articles[index - 1];
    var older = articles[index + 1];
    var html = "";

    if (newer) {
      html += '<div class="post-nav-item next">' +
        '<span class="post-nav-label">下一篇 &rarr;</span>' +
        '<a class="post-nav-title" href="' + articleUrl(newer) + '">' +
          Blog.escapeHtml(newer.title) +
        "</a></div>";
    }

    if (older) {
      html += '<div class="post-nav-item prev">' +
        '<span class="post-nav-label">&larr; 上一篇</span>' +
        '<a class="post-nav-title" href="' + articleUrl(older) + '">' +
          Blog.escapeHtml(older.title) +
        "</a></div>";
    }

    navEl.innerHTML = html;
  }

  if (!slug) {
    fail("缺少文章参数。");
    return;
  }

  Blog.loadIndex().then(function (data) {
    var index = data.articles.findIndex(function (article) { return article.slug === slug; });
    if (index === -1) throw new Error("找不到该文章。");
    var meta = data.articles[index];

    document.title = meta.title + " · " + ((data.site && data.site.title) || "catdouyuan");
    return fetch(Blog.ARTICLE_DIR + slug + ".md", { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error("无法加载文章内容 (" + res.status + ")");
      return res.text();
    }).then(function (markdown) {
      headerEl.innerHTML =
        '<h1 class="post-title">' + Blog.escapeHtml(meta.title) + "</h1>" +
        '<div class="post-meta">' +
          '<span class="meta-item">' +
            '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>' +
            '<time datetime="' + Blog.escapeHtml(meta.date) + '">' + shortDate(meta.date) + "</time>" +
          "</span>" +
          '<span class="meta-item">' + Blog.escapeHtml(Blog.readingTime(markdown)) + "</span>" +
        "</div>";

      if (footerEl) {
        var tags = (meta.tags || []).map(function (tag) {
          return '<a class="tag" href="articles.html?tag=' + encodeURIComponent(tag) + '">' +
            Blog.escapeHtml(tag) + "</a>";
        }).join("");
        footerEl.innerHTML = tags ? '<div class="post-tags"><span class="meta-label">标签: </span>' + tags + "</div>" : "";
      }

      marked.setOptions({ gfm: true, breaks: false });
      bodyEl.innerHTML = marked.parse(markdown);
      highlightCode();
      setupCodeTools();
      renderNav(data.articles, index);
    });
  }).catch(function (err) {
    fail(err.message);
  });
})();
