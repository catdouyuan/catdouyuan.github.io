/* Articles archive: all posts grouped by year. */
(function () {
  var list = document.getElementById("archive-list");
  if (!list) return;

  Blog.loadIndex().then(function (data) {
    var articles = data.articles;
    var selectedTag = new URLSearchParams(location.search).get("tag");
    if (selectedTag) {
      articles = articles.filter(function (article) {
        return (article.tags || []).indexOf(selectedTag) !== -1;
      });
    }
    if (!articles.length) {
      list.innerHTML = '<p class="empty-state">还没有文章，敬请期待。</p>';
      return;
    }

    var years = [];
    var groups = {};
    articles.forEach(function (article) {
      var year = String(article.date || "").slice(0, 4) || "未分类";
      if (!groups[year]) {
        groups[year] = [];
        years.push(year);
      }
      groups[year].push(article);
    });

    list.innerHTML = years.map(function (year) {
      return '<section class="archive-year">' +
        '<h2 class="archive-year-title">' + Blog.escapeHtml(year) + "</h2>" +
        '<ul class="archive-posts">' +
          groups[year].map(function (article) {
            return Blog.archiveItemHtml(article);
          }).join("") +
        "</ul>" +
      "</section>";
    }).join("");
  }).catch(function (err) {
    list.innerHTML = '<p class="empty-state">加载失败：' + Blog.escapeHtml(err.message) + "</p>";
  });
})();
