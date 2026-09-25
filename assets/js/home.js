/* Home page: render recent posts and filter them with the compact search box. */
(function () {
  var list = document.getElementById("recent-grid");
  var search = document.getElementById("search-input");
  var result = document.getElementById("search-result");
  if (!list) return;

  var articles = [];

  function render() {
    var query = (search && search.value ? search.value : "").trim().toLowerCase();
    var visible = articles.filter(function (article) {
      if (!query) return true;
      return [article.title, article.summary || "", (article.tags || []).join(" ")]
        .join(" ")
        .toLowerCase()
        .indexOf(query) !== -1;
    });

    if (!query) visible = visible.slice(0, 8);

    if (!visible.length) {
      list.innerHTML = '<li class="empty-state">没有找到匹配的文章。</li>';
      if (result) result.textContent = "";
      return;
    }

    list.innerHTML = visible.map(function (article) {
      return Blog.postListItemHtml(article);
    }).join("");

    if (result) {
      result.textContent = query ? "找到 " + visible.length + " 篇文章" : "";
    }
  }

  Blog.loadIndex().then(function (data) {
    articles = data.articles;
    Blog.renderSidebar(data);
    render();
  }).catch(function (err) {
    list.innerHTML = '<li class="empty-state">加载失败：' + Blog.escapeHtml(err.message) + "</li>";
  });

  if (search) search.addEventListener("input", render);
})();
