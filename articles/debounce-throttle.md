# 防抖与节流：一次把两者讲清楚

防抖（debounce）和节流（throttle）几乎是前端面试的必考题，但很多人只会背定义。这篇从**场景**出发，把它们讲透。

## 一句话区别

- **防抖**：事件停止触发后，等待一段时间再执行。适合「只关心最终状态」的场景。
- **节流**：在一段时间内最多执行一次，无视触发频率。适合「需要持续反馈」的场景。

## 防抖：搜索框输入

用户还在打字时不发请求，停下来 300ms 后才发：

```js
function debounce(fn, wait) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

const search = debounce((q) => fetchResults(q), 300);
input.addEventListener("input", (e) => search(e.target.value));
```

## 节流：滚动监听

滚动时每 100ms 才更新一次进度条，避免 handler 被打爆：

```js
function throttle(fn, wait) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn.apply(this, args);
    }
  };
}

window.addEventListener("scroll", throttle(updateProgress, 100));
```

## 容易忽略的边界

| 问题 | 说明 |
| --- | --- |
| 首次是否立即执行 | 节流常见 leading/trailing 两种变体 |
| 最后一次是否补发 | 上面的节流实现不会补发 trailing |
| `this` 与参数 | 一定要用 `apply` 透传 |

## 怎么选

- 输入联想、窗口 resize 后重算布局 → **防抖**。
- 滚动、拖拽、高频上报 → **节流**。

记住判断标准：**你要的是「最终一次」还是「稳定的频率」。**
