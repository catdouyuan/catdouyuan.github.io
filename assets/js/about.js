/* About page: fill article count and tag cloud from the shared index. */
(function () {
  if (!document.getElementById("tag-cloud")) return;
  Blog.loadIndex().then(function (data) {
    Blog.renderSidebar(data);
  }).catch(function () {});
})();
