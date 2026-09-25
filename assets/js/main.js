/* Shared behavior and helpers for the blog. */
(function () {
  var root = document.documentElement;
  var KEY = "blog-theme";

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    var light = document.getElementById("hljs-light");
    var dark = document.getElementById("hljs-dark");
    if (light) light.disabled = theme === "dark";
    if (dark) dark.disabled = theme !== "dark";
    try { localStorage.setItem(KEY, theme); } catch (e) {}
  }

  function initTheme() {
    var saved;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved) {
      apply(saved);
      return;
    }
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    apply(prefersDark ? "dark" : "light");
  }

  function bind() {
    document.querySelectorAll(".theme-toggle").forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        apply(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
      });
    });

    var navToggle = document.querySelector(".nav-toggle");
    var navLinks = document.querySelector(".nav-links");
    if (navToggle && navLinks) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.addEventListener("click", function () {
        var open = navLinks.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      navLinks.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
          navLinks.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
        }
      });
      document.addEventListener("click", function (event) {
        if (!event.target.closest(".site-header")) {
          navLinks.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    var path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path) a.classList.add("active");
    });
  }

  initTheme();
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

  formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
  },

  dateParts(iso) {
    var m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return { day: "—", month: "—" };
    return { day: m[3], month: m[1] + "." + m[2] };
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

  postCardHtml(article) {
    var parts = this.dateParts(article.date);
    var url = "article.html?slug=" + encodeURIComponent(article.slug);
    var tags = (article.tags || []).slice(0, 3).map(function (tag) {
      return '<a class="tag" data-tag="' + this.escapeHtml(tag) + '" href="articles.html?tag=' +
        encodeURIComponent(tag) + '">' + this.escapeHtml(tag) + "</a>";
    }, this).join("");
    return (
      '<article class="post-card">' +
        '<time class="post-date" datetime="' + this.escapeHtml(article.date) + '">' +
          "<strong>" + parts.day + "</strong><span>" + parts.month + "</span>" +
        "</time>" +
        '<div class="post-info">' +
          '<h3 class="post-title"><a href="' + url + '">' + this.escapeHtml(article.title) + "</a></h3>" +
          '<p class="post-summary">' + this.escapeHtml(article.summary || "") + "</p>" +
          '<div class="post-footer"><div class="tags">' + tags + "</div>" +
          '<a class="read-more" href="' + url + '">阅读全文 →</a></div>' +
        "</div>" +
      "</article>"
    );
  },

  renderSidebar(data) {
    var articles = data.articles || [];
    document.querySelectorAll("[data-total-posts]").forEach(function (el) {
      el.textContent = articles.length;
    });
    var latest = articles[0] && articles[0].date;
    document.querySelectorAll("[data-latest-date]").forEach(function (el) {
      el.textContent = latest ? latest.slice(5).replace("-", ".") : "—";
    });
    document.querySelectorAll("[data-latest-month]").forEach(function (el) {
      el.textContent = latest ? latest.slice(0, 7).replace("-", ".") : "—";
    });

    var counts = {};
    articles.forEach(function (article) {
      (article.tags || []).forEach(function (tag) { counts[tag] = (counts[tag] || 0) + 1; });
    });
    var tags = Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a] || a.localeCompare(b, "zh-CN");
    }).slice(0, 12);
    var html = tags.map(function (tag) {
      return '<a class="tag" href="articles.html?tag=' + encodeURIComponent(tag) + '">' +
        Blog.escapeHtml(tag) + "</a>";
    }).join("");
    document.querySelectorAll("#tag-cloud").forEach(function (el) { el.innerHTML = html; });
  }
};
