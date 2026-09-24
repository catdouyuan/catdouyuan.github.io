/* Shared site behavior: theme toggle, mobile nav, footer year. */
(function () {
  var root = document.documentElement;
  var KEY = "blog-theme";

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
  }

  function initTheme() {
    var saved;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved) {
      apply(saved);
    } else {
      var prefersDark = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      apply(prefersDark ? "dark" : "light");
    }
  }

  function bind() {
    var toggle = document.querySelector(".theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        apply(next);
      });
    }

    var navToggle = document.querySelector(".nav-toggle");
    var navLinks = document.querySelector(".nav-links");
    if (navToggle && navLinks) {
      navToggle.addEventListener("click", function () {
        navLinks.classList.toggle("open");
      });
    }

    var year = document.querySelector("[data-year]");
    if (year) year.textContent = new Date().getFullYear();

    // Mark active nav link by pathname.
    var path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        a.classList.add("active");
      }
    });
  }

  initTheme();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();

/* Shared helpers used by list + reader pages. */
window.Blog = {
  INDEX_URL: "articles/index.json",
  ARTICLE_DIR: "articles/",

  async loadIndex() {
    var res = await fetch(this.INDEX_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error("Cannot load article index (" + res.status + ")");
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
    return d.toLocaleDateString("zh-CN", {
      year: "numeric", month: "long", day: "numeric"
    });
  },

  readingTime(text) {
    var cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    var words = (text.replace(/[\u4e00-\u9fa5]/g, " ").match(/\b\w+\b/g) || []).length;
    var minutes = Math.max(1, Math.round(cjk / 400 + words / 220));
    return minutes + " 分钟阅读";
  },

  escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
};
