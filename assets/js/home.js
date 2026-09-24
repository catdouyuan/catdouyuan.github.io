/* Home page: render the most recent posts. */
(function () {
  var grid = document.getElementById("recent-grid");
  if (!grid) return;

  function cardHtml(a) {
    var tags = (a.tags || []).slice(0, 3).map(function (t) {
      return '<a class="tag" href="articles.html?tag=' + encodeURIComponent(t) + '">' +
        Blog.escapeHtml(t) + "</a>";
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

  Blog.loadIndex().then(function (data) {
    var recent = data.articles.slice(0, 6);
    if (!recent.length) {
      grid.innerHTML = '<div class="empty-state">还没有文章，敬请期待。</div>';
      return;
    }
    grid.innerHTML = recent.map(cardHtml).join("");
  }).catch(function (err) {
    grid.innerHTML = '<div class="empty-state">加载失败：' +
      Blog.escapeHtml(err.message) + "</div>";
  });
})();
