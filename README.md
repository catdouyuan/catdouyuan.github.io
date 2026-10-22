# catyuan · 技术博客 (Nexmoe Style)


文章采用 Markdown 编写，浏览器端通过 [marked](https://github.com/markedjs/marked) 动态解析，[highlight.js](https://highlightjs.org/) 实现代码高亮。

---

## 🎨 核心特性

- 🌟 **沉浸式视觉美学**：顶部动漫壁纸横幅背景 + MDUI 抽屉侧边栏 + 大圆角高浮雕卡片。
- 🌈 **彩虹标签与元信息**：日期、分类、字数预估、阅读耗时等胶囊标签均采用糖果渐变色（`nexmoe-rainbow`）。
- 📑 **浮动目录树（TOC）**：阅读文章时自动提取 `h1~h4` 标题生成目录，支持平滑滚动定位与一键回到顶部。
- 🔍 **全屏即时搜索**：支持标题、摘要、标签与分类的高亮即时过滤。
- 🖼️ **Fancybox 画廊灯箱**：正文图片自动包裹画廊灯箱，支持点击放大缩放。
- 💬 **Waline 现代化评论区**：轻量无后端负担的互动留言系统。
- 📜 **一言（Hitokoto）与建站计时**：侧栏动态拉取每日一句，实时计算建站运行天数。
- 📊 **不蒜子（Busuanzi）统计**：全站 PV / UV 访问计数。
- ⚡ **零构建流**：无需安装 Node.js/Hexo 环境，直接推送 Markdown 即刻发布！

---

## 📁 目录结构

```
.
├── index.html          # 首页（大图封面文章流）
├── archive.html        # 归档页（彩虹标签云 + 分类图卡 + 年份时间轴）
├── article.html        # 文章阅读器（大封面 + 彩虹元数据 + 悬浮TOC + 灯箱 + 评论）
├── about.html          # 关于博主（简历与技术栈）
├── 404.html            # 404 页面
├── feed.xml            # RSS 订阅源
├── sitemap.xml         # SEO 站点地图
├── robots.txt
├── .nojekyll           # 跳过 GitHub Pages Jekyll 处理
├── articles/
│   ├── index.json      # 文章清单（标题、日期、分类、封面、摘要、标签）
│   ├── 踩坑指南/        # 按分类命名的文件夹，便于归类与查找文章
│   │   └── *.md
│   └── [其它分类]/     # 如 前端开发/、学习笔记/ 等（支持子目录归类）
├── css/
│   ├── style.css       # Nexmoe 核心样式
│   └── custom.css      # 个性化定制与增强样式
├── js/
│   ├── app.js          # 核心交互（一言、建站计时、侧栏联动、搜索、平滑滚动）
│   └── article.js      # 文章阅读器逻辑（Markdown解析、TOC生成、灯箱绑定）
├── lib/
│   ├── mdui_043tiny/   # MDUI 框架
│   ├── fancybox/       # Fancybox 图片灯箱库
│   └── iconfont/       # Nexmoe 图标与社交图标库
├── images/
│   ├── avatar.png      # 博客头像
│   ├── background/     # 背景横幅
│   └── post/           # 文章封面
```

---

## ✍️ 新增一篇文章

1. 在 `articles/<分类名称>/` 目录下新建 `your-slug.md`（若对应分类文件夹不存在，直接新建即可；也兼容直接放在 `articles/` 根目录）。
2. 在 `articles/index.json` 的 `articles` 数组顶部添加元数据：

```json
{
  "slug": "your-slug",
  "path": "踩坑指南/your-slug.md",
  "title": "文章标题",
  "date": "2026-10-10",
  "category": "踩坑指南",
  "cover": "/images/post/development_tool.jpg",
  "summary": "一句话核心摘要，用于首页卡片和站内即时搜索。",
  "tags": ["踩坑指南"]
}
```

> **分类路径说明**：
> - 系统已支持智能定位：如果设置了 `category: "踩坑指南"`，系统会自动优先读取 `articles/踩坑指南/your-slug.md`。
> - 也可通过 `path` 字段显式指定相对 `articles/` 的路径（如 `"path": "踩坑指南/your-slug.md"`）。
> - 自动兼容回退：若在分类目录下未找到，系统会自动回退到 `articles/your-slug.md` 尝试加载。
> - **封面图说明**：可使用 `images/post/` 下的封面（如 `development_tool.jpg`, `markerdown.jpg`），也可以填写任意外部图片 URL。若未填写，将自动使用默认封面。

3. （可选）将新文章同步添加到 `feed.xml` 与 `sitemap.xml`。
4. 提交并推送到 `main` 分支，GitHub Pages 自动完成发布！

---

## 💻 本地预览

任意本地 HTTP 静态服务器即可（由于浏览器安全机制，`file://` 下直接访问可能限制 `fetch` 本地 JSON）：

```bash
python -m http.server 8080
# 浏览器访问 http://localhost:8080
```

---

## 🚀 部署到 GitHub Pages

1. 推送代码至 GitHub 仓库根目录。
2. 进入仓库 **Settings → Pages**，`Source` 选择 `Deploy from a branch`，Branch 选择 `main` 分支的 `/ (root)`。
3. 若绑定自定义域名，在根目录添加 `CNAME` 文件即可。
