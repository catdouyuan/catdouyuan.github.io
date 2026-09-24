/* Articles list page: render, tag filter, search. */
(function () {
  var grid = document.getElementById("post-grid");
  var searchInput = document.getElementById("search");
  var tagFilter = document.getElementById("tag-filter");
  var countEl = document.getElementById("result-count");
  if (!grid) return;

  var all = [];
  var activeTag = null;

  function cardHtml(a) {
    var tags = (a.tags || []).map(function (t) {
      return '<span class="tag" data-tag="' + Blog.escapeHtml(t) + '">' +
        Blog.escapeHtml(t) + "</span>";
    }).join("");
    var url = "article.html?slug=" + encodeURIComponent(a.slug);
    return (
      '<article class="post-card">' +
        '<div class="meta"><time>' + Blog.formatDate(a.date) + "</time></div>" +
        '<h3><a href="' + url + '">' + Blog.escapeHtml(a.title) + "</a></h3>" +
        "<p>" + Blog.escapeHtml(a.summary || "") + "</p>" +
        '<div class="tags">' + tags + "</div>" +
      "</article>"
    );
  }

  function render() {
    var q = (searchInput.value || "").trim().toLowerCase();
    var list = all.filter(function (a) {
      var matchTag = !activeTag || (a.tags || []).indexOf(activeTag) !== -1;
      var hay = (a.title + " " + (a.summary || "") + " " + (a.tags || []).join(" ")).toLowerCase();
      var matchQ = !q || hay.indexOf(q) !== -1;
      return matchTag && matchQ;
    });
    if (countEl) countEl.textContent = list.length + " 篇文章";
    if (!list.length) {
      grid.classList.remove("card-grid");
      grid.innerHTML = '<div class="empty-state">没有匹配的文章。</div>';
      return;
    }
    grid.classList.add("card-grid");
    grid.innerHTML = list.map(cardHtml).join("");
  }

  function renderTags() {
    var counts = {};
    all.forEach(function (a) {
      (a.tags || []).forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
    });
    var tags = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
    tagFilter.innerHTML = tags.map(function (t) {
      return '<span class="tag" data-tag="' + Blog.escapeHtml(t) + '">' +
        Blog.escapeHtml(t) + "</span>";
    }).join("");
  }

  function onTagClick(tag, el) {
    if (activeTag === tag) {
      activeTag = null;
    } else {
      activeTag = tag;
    }
    document.querySelectorAll("#tag-filter .tag").forEach(function (n) {
      n.classList.toggle("active", n.dataset.tag === activeTag);
    });
    render();
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest(".tag");
    if (t && t.dataset.tag) onTagClick(t.dataset.tag, t);
  });
  searchInput.addEventListener("input", render);

  // Preselect tag from URL (?tag=xxx)
  var urlTag = new URLSearchParams(location.search).get("tag");

  Blog.loadIndex().then(function (data) {
    all = data.articles;
    renderTags();
    if (urlTag) {
      activeTag = urlTag;
      document.querySelectorAll("#tag-filter .tag").forEach(function (n) {
        n.classList.toggle("active", n.dataset.tag === activeTag);
      });
    }
    render();
  }).catch(function (err) {
    grid.innerHTML = '<div class="empty-state">加载失败：' +
      Blog.escapeHtml(err.message) + "</div>";
  });
})();
