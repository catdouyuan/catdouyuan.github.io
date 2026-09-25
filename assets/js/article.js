/* Article reader: Markdown rendering, TOC, navigation and code tools. */
(function () {
  var bodyEl = document.getElementById("article-body");
  var headerEl = document.getElementById("article-header");
  var navEl = document.getElementById("article-nav");
  var tocEl = document.getElementById("toc");
  var layoutEl = document.querySelector(".article-page-grid");
  if (!bodyEl || !headerEl) return;

  var slug = new URLSearchParams(location.search).get("slug");

  function fail(message) {
    bodyEl.innerHTML = '<div class="empty-state">' + Blog.escapeHtml(message) + "</div>";
  }

  function slugifyHeading(text, used) {
    var base = text.toLowerCase().trim()
      .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";
    var id = base;
    var i = 2;
    while (used[id]) id = base + "-" + i++;
    used[id] = true;
    return id;
  }

  function buildToc(container) {
    var headings = container.querySelectorAll("h2, h3");
    if (headings.length < 2) return null;
    var used = {};
    var items = [];
    headings.forEach(function (heading) {
      var id = slugifyHeading(heading.textContent, used);
      heading.id = id;
      items.push(
        '<a class="' + heading.tagName.toLowerCase() + '" href="#' + id + '">' +
        Blog.escapeHtml(heading.textContent) + "</a>"
      );
    });
    return '<div class="toc-title">目录</div>' + items.join("");
  }

  function setupScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
    if (!links.length || !("IntersectionObserver" in window)) return;
    var targets = links.map(function (link) {
      return document.getElementById(link.getAttribute("href").slice(1));
    }).filter(Boolean);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) { link.classList.remove("active"); });
        var index = targets.indexOf(entry.target);
        if (links[index]) links[index].classList.add("active");
      });
    }, { rootMargin: "-90px 0px -68% 0px", threshold: 0 });
    targets.forEach(function (target) { observer.observe(target); });
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
    var older = articles[index + 1];
    var newer = articles[index - 1];
    var html = "";
    if (older) {
      html += '<a class="prev" href="article.html?slug=' + encodeURIComponent(older.slug) +
        '"><span class="label">← 上一篇</span><span class="title">' +
        Blog.escapeHtml(older.title) + "</span></a>";
    } else {
      html += "<span></span>";
    }
    if (newer) {
      html += '<a class="next" href="article.html?slug=' + encodeURIComponent(newer.slug) +
        '"><span class="label">下一篇 →</span><span class="title">' +
        Blog.escapeHtml(newer.title) + "</span></a>";
    } else {
      html += "<span></span>";
    }
    navEl.innerHTML = html;
  }

  if (!slug) {
    fail("缺少文章参数。");
    return;
  }

  Blog.loadIndex().then(function (data) {
    Blog.renderSidebar(data);
    var index = data.articles.findIndex(function (article) { return article.slug === slug; });
    if (index === -1) throw new Error("找不到该文章。");
    var meta = data.articles[index];

    document.title = meta.title + " · " + ((data.site && data.site.title) || "catdouyuan");
    return fetch(Blog.ARTICLE_DIR + slug + ".md", { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error("无法加载文章内容 (" + res.status + ")");
      return res.text();
    }).then(function (markdown) {
      var tags = (meta.tags || []).map(function (tag) {
        return '<a class="tag" href="articles.html?tag=' + encodeURIComponent(tag) + '">' +
          Blog.escapeHtml(tag) + "</a>";
      }).join("");

      headerEl.innerHTML =
        '<a class="back-link" href="articles.html">← 返回文章列表</a>' +
        "<h1>" + Blog.escapeHtml(meta.title) + "</h1>" +
        '<div class="article-meta"><time datetime="' + Blog.escapeHtml(meta.date) + '">' +
          Blog.formatDate(meta.date) + "</time><span class=\"dot\"></span><span>" +
          Blog.readingTime(markdown) + "</span></div>" +
        '<div class="tags" style="margin-top:15px">' + tags + "</div>";

      marked.setOptions({ gfm: true, breaks: false });
      bodyEl.innerHTML = marked.parse(markdown);
      highlightCode();
      setupCodeTools();

      var tocHtml = buildToc(bodyEl);
      if (tocHtml && tocEl) {
        tocEl.innerHTML = tocHtml;
        setupScrollSpy();
      } else {
        if (tocEl) tocEl.remove();
        if (layoutEl) layoutEl.classList.add("no-toc");
      }
      renderNav(data.articles, index);
    });
  }).catch(function (err) {
    fail(err.message);
  });
})();
