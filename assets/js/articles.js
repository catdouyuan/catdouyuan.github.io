/* Articles archive: all posts grouped by year, with tag filtering. */
(function () {
  var list = document.getElementById("archive-list");
  if (!list) return;

  Blog.loadIndex().then(function (data) {
    var articles = data.articles;
    var params = new URLSearchParams(location.search);
    var selectedTag = params.get("tag");

    /* Filter by tag */
    if (selectedTag) {
      articles = articles.filter(function (article) {
        return (article.tags || []).indexOf(selectedTag) !== -1;
      });
    }

    /* Show active filter label */
    var filterLabel = "";
    if (selectedTag) filterLabel = "标签：" + selectedTag;

    if (!articles.length) {
      list.innerHTML = '<p class="empty-state">没有找到匹配的文章。</p>' +
        (filterLabel ? '<p><a href="articles.html" class="clear-filter">← 查看全部文章</a></p>' : '');
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

    var headerHtml = "";
    if (filterLabel) {
      headerHtml = '<div class="filter-active">' +
        '<span class="filter-label">' + Blog.escapeHtml(filterLabel) + '</span>' +
        '<a href="articles.html" class="clear-filter">✕ 清除筛选</a>' +
        '</div>';
    }

    list.innerHTML = headerHtml + years.map(function (year) {
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
