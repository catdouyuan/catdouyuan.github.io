/* Single-article reader: fetch markdown, render, build TOC + prev/next. */
(function () {
  var bodyEl = document.getElementById("article-body");
  var headerEl = document.getElementById("article-header");
  if (!bodyEl) return;

  var slug = new URLSearchParams(location.search).get("slug");

  function fail(msg) {
    bodyEl.innerHTML = '<div class="empty-state">' + Blog.escapeHtml(msg) + "</div>";
  }

  function slugifyHeading(text, used) {
    var base = text.toLowerCase().trim()
      .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";
    var id = base, i = 1;
    while (used[id]) { id = base + "-" + (++i); }
    used[id] = true;
    return id;
  }

  function buildToc(container) {
    var heads = container.querySelectorAll("h2, h3");
    if (heads.length < 3) return null;
    var used = {};
    var items = [];
    heads.forEach(function (h) {
      var id = slugifyHeading(h.textContent, used);
      h.id = id;
      items.push(
        '<a class="' + h.tagName.toLowerCase() + '" href="#' + id + '">' +
        Blog.escapeHtml(h.textContent) + "</a>"
      );
    });
    return '<div class="toc-title">目录</div>' + items.join("");
  }

  function setupScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
    if (!links.length) return;
    var targets = links.map(function (l) {
      return document.getElementById(l.getAttribute("href").slice(1));
    });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("active"); });
          var i = targets.indexOf(e.target);
          if (links[i]) links[i].classList.add("active");
        }
      });
    }, { rootMargin: "-80px 0px -70% 0px" });
    targets.forEach(function (t) { if (t) obs.observe(t); });
  }

  function renderNav(articles, idx) {
    var wrap = document.getElementById("article-nav");
    if (!wrap) return;
    // articles sorted newest first; "previous" = older = idx+1
    var older = articles[idx + 1];
    var newer = articles[idx - 1];
    var html = "";
    if (older) {
      html += '<a class="prev" href="article.html?slug=' + encodeURIComponent(older.slug) +
        '"><span class="label">← 上一篇</span><span class="title">' +
        Blog.escapeHtml(older.title) + "</span></a>";
    } else { html += "<span></span>"; }
    if (newer) {
      html += '<a class="next" href="article.html?slug=' + encodeURIComponent(newer.slug) +
        '"><span class="label">下一篇 →</span><span class="title">' +
        Blog.escapeHtml(newer.title) + "</span></a>";
    } else { html += "<span></span>"; }
    wrap.innerHTML = html;
  }

  if (!slug) { fail("缺少文章参数。"); return; }

  Blog.loadIndex().then(function (data) {
    var idx = data.articles.findIndex(function (a) { return a.slug === slug; });
    if (idx === -1) throw new Error("找不到该文章。");
    var meta = data.articles[idx];

    document.title = meta.title + " · " + (data.site && data.site.title || "博客");

    return fetch(Blog.ARTICLE_DIR + slug + ".md", { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("无法加载文章内容 (" + res.status + ")");
        return res.text();
      })
      .then(function (md) {
        // Render header
        var tags = (meta.tags || []).map(function (t) {
          return '<a class="tag" href="articles.html?tag=' + encodeURIComponent(t) + '">' +
            Blog.escapeHtml(t) + "</a>";
        }).join("");
        headerEl.innerHTML =
          '<a class="back-link" href="articles.html">← 返回文章列表</a>' +
          "<h1>" + Blog.escapeHtml(meta.title) + "</h1>" +
          '<div class="article-meta">' +
            "<time>" + Blog.formatDate(meta.date) + "</time>" +
            '<span class="dot"></span><span>' + Blog.readingTime(md) + "</span>" +
          "</div>" +
          '<div class="tags" style="margin-top:14px">' + tags + "</div>";

        // Render markdown
        marked.setOptions({
          gfm: true,
          breaks: false,
          highlight: function (code, lang) {
            if (window.hljs) {
              try {
                if (lang && hljs.getLanguage(lang)) {
                  return hljs.highlight(code, { language: lang }).value;
                }
                return hljs.highlightAuto(code).value;
              } catch (e) {}
            }
            return code;
          }
        });
        bodyEl.innerHTML = marked.parse(md);

        var tocHtml = buildToc(bodyEl);
        var layout = document.getElementById("article-layout");
        var tocEl = document.getElementById("toc");
        if (tocHtml && tocEl && layout) {
          tocEl.innerHTML = tocHtml;
          layout.classList.add("has-toc");
          setupScrollSpy();
        } else if (tocEl) {
          tocEl.remove();
        }

        renderNav(data.articles, idx);
      });
  }).catch(function (err) {
    fail(err.message);
  });
})();
