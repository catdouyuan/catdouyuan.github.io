/* Shared behavior and helpers for the blog. */
(function () {
  var lightCodeTheme = document.getElementById("hljs-light");
  var darkCodeTheme = document.getElementById("hljs-dark");
  if (lightCodeTheme) lightCodeTheme.disabled = true;
  if (darkCodeTheme) darkCodeTheme.disabled = false;

  function bind() {
    var navToggle = document.querySelector(".nav-toggle");
    var navMenu = document.querySelector(".nav-menu");

    if (navToggle && navMenu) {
      navToggle.addEventListener("click", function () {
        var open = navMenu.classList.toggle("is-open");
        navToggle.classList.toggle("is-active", open);
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
        navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
      });

      navMenu.addEventListener("click", function (event) {
        if (!event.target.closest("a")) return;
        navMenu.classList.remove("is-open");
        navToggle.classList.remove("is-active");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "打开菜单");
      });

      document.addEventListener("click", function (event) {
        if (event.target.closest(".nav")) return;
        navMenu.classList.remove("is-open");
        navToggle.classList.remove("is-active");
        navToggle.setAttribute("aria-expanded", "false");
      });
    }

    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();

window.Blog = {
  INDEX_URL: "articles/index.json",
  ARTICLE_DIR: "articles/",

  async loadIndex() {
    var res = await fetch(this.INDEX_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error("文章索引加载失败 (" + res.status + ")");
    var data = await res.json();
    data.articles = (data.articles || []).slice().sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    });
    return data;
  },

  articleUrl(article) {
    return "article.html?slug=" + encodeURIComponent(article.slug);
  },

  formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
  },

  shortDate(iso) {
    var m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? m[1] + "-" + m[2] + "-" + m[3] : "—";
  },

  archiveDate(iso) {
    var m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? m[2] + "-" + m[3] : "—";
  },

  readingTime(text) {
    var cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    var words = (text.replace(/[\u4e00-\u9fa5]/g, " ").match(/\b\w+\b/g) || []).length;
    return Math.max(1, Math.round(cjk / 400 + words / 220)) + " 分钟阅读";
  },

  escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  },

  postListItemHtml(article) {
    return (
      '<li class="post-list-item">' +
        '<a class="post-link" href="' + this.articleUrl(article) + '">' +
          this.escapeHtml(article.title) +
        "</a>" +
        '<time class="post-date" datetime="' + this.escapeHtml(article.date) + '">' +
          this.shortDate(article.date) +
        "</time>" +
      "</li>"
    );
  },

  archiveItemHtml(article) {
    return (
      '<li class="archive-post-item">' +
        '<time class="archive-post-date" datetime="' + this.escapeHtml(article.date) + '">' +
          this.archiveDate(article.date) +
        "</time>" +
        '<a class="archive-post-link" href="' + this.articleUrl(article) + '">' +
          this.escapeHtml(article.title) +
        "</a>" +
      "</li>"
    );
  },

  renderSidebar(data) {
    var articles = data.articles || [];
    document.querySelectorAll("[data-total-posts]").forEach(function (el) {
      el.textContent = articles.length;
    });
  },

  renderTagCloud(data) {
    var counts = {};
    (data.articles || []).forEach(function (article) {
      (article.tags || []).forEach(function (tag) { counts[tag] = (counts[tag] || 0) + 1; });
    });
    var html = Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a] || a.localeCompare(b, "zh-CN");
    }).map(function (tag) {
      return '<a class="tag" href="articles.html?tag=' + encodeURIComponent(tag) + '">' +
        Blog.escapeHtml(tag) + "</a>";
    }).join("");
    document.querySelectorAll("#tag-cloud").forEach(function (el) { el.innerHTML = html; });
  }
};
