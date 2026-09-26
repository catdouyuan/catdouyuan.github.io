# catyuan · 技术博客

纯静态个人技术博客，托管在 GitHub Pages，无需构建步骤。文章用 Markdown 编写，浏览器端用 [marked](https://github.com/markedjs/marked) 渲染，代码高亮用 [highlight.js](https://highlightjs.org/)。

## 目录结构

```
.
├── index.html          # 首页（最新文章）
├── articles.html       # 文章归档（按年份 + 分类侧栏）
├── article.html        # 单篇阅读器（代码高亮 + 上/下一篇）
├── about.html          # 关于页
├── 404.html            # 找不到页面
├── feed.xml            # RSS
├── sitemap.xml         # 站点地图
├── robots.txt
├── .nojekyll           # 跳过 GitHub Pages 的 Jekyll 处理
├── articles/
│   ├── index.json      # 文章清单（元数据 + 分类）
│   └── *.md            # 文章正文
└── assets/
    ├── css/style.css
    ├── js/{main,home,articles,article}.js
    └── img/favicon.svg
```

## 新增一篇文章

1. 在 `articles/` 下新建 `your-slug.md`。
2. 在 `articles/index.json` 的 `articles` 数组顶部添加一条：

   ```json
   {
     "slug": "your-slug",
     "title": "文章标题",
     "date": "2026-01-01",
     "summary": "一句话摘要，用于站内搜索和 RSS。",
     "category": "前端",
     "tags": ["标签1", "标签2"]
   }
   ```

3. （可选）把新文章同步进 `feed.xml` 与 `sitemap.xml`。
4. 提交并推送到 `main`，GitHub Pages 自动发布。

> 列表按 `date` 降序排序，`slug` 必须与 Markdown 文件名一致。

## 本地预览

任意静态服务器即可（必须走 HTTP，`file://` 下 `fetch` 会被拦截）：

```bash
python -m http.server 8080
# 打开 http://localhost:8080
```

## 部署到 GitHub Pages

1. 推送到 GitHub 仓库。
2. Settings → Pages → Source 选择 `main` 分支根目录。
3. 若使用自定义域名，在根目录添加 `CNAME` 文件。

站点根 URL 在 `articles/index.json` 的 `site.url` 中配置，用于生成 RSS / sitemap 链接。
