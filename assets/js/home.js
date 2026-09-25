/* Home page: render recent posts and sidebar statistics. */
(function () {
  var grid = document.getElementById("recent-grid");
  if (!grid) return;

  Blog.loadIndex().then(function (data) {
    Blog.renderSidebar(data);
    var recent = data.articles.slice(0, 6);
    if (!recent.length) {
      grid.innerHTML = '<div class="empty-state">还没有文章，敬请期待。</div>';
      return;
    }
    grid.innerHTML = recent.map(function (article) {
      return Blog.postCardHtml(article);
    }).join("");
  }).catch(function (err) {
    grid.innerHTML = '<div class="empty-state">加载失败：' + Blog.escapeHtml(err.message) + "</div>";
  });
})();
