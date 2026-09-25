/* Articles archive: render, search and tag filtering. */
(function () {
  var grid = document.getElementById("post-grid");
  var searchInput = document.getElementById("search");
  var tagFilter = document.getElementById("tag-filter");
  var countEl = document.getElementById("result-count");
  if (!grid || !searchInput) return;

  var all = [];
  var activeTag = null;

  function render() {
    var q = (searchInput.value || "").trim().toLowerCase();
    var list = all.filter(function (article) {
      var tags = article.tags || [];
      var matchTag = !activeTag || tags.indexOf(activeTag) !== -1;
      var haystack = [article.title, article.summary || "", tags.join(" ")].join(" ").toLowerCase();
      return matchTag && (!q || haystack.indexOf(q) !== -1);
    });

    if (countEl) countEl.textContent = list.length + " 篇文章";
    if (!list.length) {
      grid.innerHTML = '<div class="empty-state">没有匹配的文章，换个关键词试试。</div>';
      return;
    }
    grid.innerHTML = list.map(function (article) {
      return Blog.postCardHtml(article);
    }).join("");
  }

  function renderTags() {
    var counts = {};
    all.forEach(function (article) {
      (article.tags || []).forEach(function (tag) { counts[tag] = (counts[tag] || 0) + 1; });
    });
    var tags = Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a] || a.localeCompare(b, "zh-CN");
    });
    tagFilter.innerHTML = tags.map(function (tag) {
      return '<span class="tag" data-tag="' + Blog.escapeHtml(tag) + '">' +
        Blog.escapeHtml(tag) + " <small>" + counts[tag] + "</small></span>";
    }).join("");
  }

  function selectTag(tag) {
    activeTag = activeTag === tag ? null : tag;
    document.querySelectorAll("#tag-filter .tag").forEach(function (node) {
      node.classList.toggle("active", node.dataset.tag === activeTag);
    });
    render();
  }

  document.addEventListener("click", function (event) {
    var tag = event.target.closest(".tag[data-tag]");
    if (!tag || !grid.contains(tag) && !tagFilter.contains(tag)) return;
    event.preventDefault();
    selectTag(tag.dataset.tag);
  });

  searchInput.addEventListener("input", render);

  Blog.loadIndex().then(function (data) {
    all = data.articles;
    renderTags();
    Blog.renderSidebar(data);

    var urlTag = new URLSearchParams(location.search).get("tag");
    if (urlTag) {
      activeTag = urlTag;
      document.querySelectorAll("#tag-filter .tag").forEach(function (node) {
        node.classList.toggle("active", node.dataset.tag === activeTag);
      });
    }
    render();
  }).catch(function (err) {
    grid.innerHTML = '<div class="empty-state">加载失败：' + Blog.escapeHtml(err.message) + "</div>";
  });
})();
