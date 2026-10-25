# GlazeWM + Zebar 使用分享：Windows 上也能有平铺窗口管理

> 本文基于个人实际配置与日常使用体验整理，涵盖安装部署、核心操作哲学、深度配置调优以及真实踩坑与解决方案。

---

## 一、这是什么

对于长期在 Linux 桌面环境（如 i3、bspwm 或 Hyprland）下开发的用户来说，回到 Windows 最痛苦的莫过于窗口漫天飞、每次开新应用都要手动用鼠标拖拽调整窗口大小。而 **GlazeWM + Zebar** 的组合，彻底将这套现代化平铺体验带到了 Windows 生态中：

- **GlazeWM**：Windows 平台的动态平铺式窗口管理器（Tiling Window Manager）。其核心逻辑类似 Linux 上的 i3/sway，完全由纯文本 YAML 配置文件驱动。当新窗口打开时，系统会自动计算剩余屏幕空间并精准排列，告别传统层叠窗口与繁琐的鼠标分屏操作。
- **Zebar**：专为 GlazeWM 设计的配套轻量级状态栏，相当于 Linux 下的 Polybar 或 Waybar。它能够实时监控并展示工作区编号、时间日期、CPU/内存/网络使用率等系统关键指标，且界面样式支持使用通用的 HTML、CSS 以及 JavaScript 进行自由定制。
- 两者均由社区团队 [glzr.io](https://glzr.io/) 开源孵化，配合使用时能提供极致平滑、极度接近 Linux 平铺桌面的极简键盘流体验。

---

## 二、核心优势

- ⚡ **平铺布局，空间物尽其用**：新建窗口自动分割并均匀铺开屏幕空间，彻底告别鼠标反复拖拽。
- ⌨️ **纯正 Vim 风格导航**：支持标准的 `Alt + H / J / K / L` 焦点移动，双手无需频繁脱离键盘核心区。
- 🖥️ **虚拟多工作区（Virtual Workspaces）**：默认开箱提供 9 个隔离的虚拟桌面，任务分组、跨区调度毫秒级响应，桌面常年保持清爽。
- 🚀 **原生性能与极低资源开销**：GlazeWM 是采用原生技术构建的独立可执行程序（非臃肿的 Electron 架构），常驻后台内存占用极少，CPU 占用趋近于 0。
- 🛠️ **全声明式配置与热重载**：所有的热键绑定、窗口边框间距（Gaps）、焦点高亮色、应用规则均在单一 YAML 集中管理，保存即刻热生效。
- 🎨 **高度可控的高颜值外观**：支持精细微调窗口内/外间隙与边框高亮；Zebar 状态栏更是支持通过现代 CSS Flex 弹性盒完全自绘。

---

## 三、安装与快速上手

推荐使用 Windows 官方包管理器 `winget` 极速安装，开箱即用：

```shell
# 一键安装 GlazeWM 与配套状态栏 Zebar
winget install glzr-io.glazewm
winget install glzr-io.zebar
```

### 启动与自启
安装完成后，直接从开始菜单中搜索并启动 **GlazeWM**。
GlazeWM 的默认配置中已内置了启动链（`startup_commands: ['shell-exec zebar']`），因此它在启动的同时会自动将配套的 Zebar 状态栏一同拉起。

### 核心配置文件路径
- **GlazeWM 核心配置**：`C:\Users\<用户名>\.glzr\glazewm\config.yaml`
- **Zebar 状态栏配置**：`C:\Users\<用户名>\.glzr\zebar\settings.json`

> **提示**：建议将 `.glzr` 目录纳入你的个人 dotfiles 仓库管理，换机或重装时一键拉取即可恢复专属工作流。

---

## 四、核心操作概念与常用快捷键

### 1. 核心运行概念
- **工作区（Workspace）**：系统默认提供 1~9 号独立虚拟工作区，不同任务（如编码、调试、文档、即时通讯）可严格分流在不同工作区。
- **三种窗口运行状态**：
  - **Tiling（平铺）**：默认状态，自动与其他窗口平分屏幕空间；
  - **Floating（浮动）**：传统悬浮窗口模式，适合计算器、调色板等临时小工具；
  - **Fullscreen（全屏）**：占满整个屏幕，专注于深度沉浸式工作。

### 2. 常用操作快捷键一览（默认配置速查）

#### 🗂️ 工作区调度
| 快捷键 | 功能说明 |
|:---|:---|
| <kbd>Alt</kbd> + <kbd>1 ~ 9</kbd> | 瞬间切至对应工作区 1 ~ 9 |
| <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>1 ~ 9</kbd> | 将当前活动窗口移动至目标工作区并自动跟随 |
| <kbd>Alt</kbd> + <kbd>A</kbd> / <kbd>Alt</kbd> + <kbd>S</kbd> | 快速跳转至上一个 / 下一个有窗口的活跃工作区 |
| <kbd>Alt</kbd> + <kbd>D</kbd> | 跳回最近一次使用过的工作区（类似交替切屏） |

#### 🧭 焦点移动与窗口管理
| 快捷键 | 功能说明 |
|:---|:---|
| <kbd>Alt</kbd> + <kbd>H</kbd> / <kbd>J</kbd> / <kbd>K</kbd> / <kbd>L</kbd> | Vim 方向键：将窗口焦点移向 **左 / 下 / 上 / 右** |
| <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>H / J / K / L</kbd> | 将当前活动窗口在平铺树中向 **左 / 下 / 上 / 右** 调换位置 |
| <kbd>Alt</kbd> + <kbd>Space</kbd> | 在平铺、浮动与全屏窗口间循环切换焦点 |
| <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>Space</kbd> | 快速切换当前窗口的模式：**平铺 ↔ 浮动** |
| <kbd>Alt</kbd> + <kbd>F</kbd> | 窗口全屏模式开/关 |
| <kbd>Alt</kbd> + <kbd>M</kbd> | 最小化当前活动窗口 |
| <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>Q</kbd> | 优雅关闭当前窗口 |

#### 📐 布局与尺寸微调
| 快捷键 | 功能说明 |
|:---|:---|
| <kbd>Alt</kbd> + <kbd>V</kbd> | 切换分割方向：控制新开窗口是横向还是竖向切割 |
| <kbd>Alt</kbd> + <kbd>U</kbd> / <kbd>Alt</kbd> + <kbd>P</kbd> | 窗口宽度 减小 / 增大 2% |
| <kbd>Alt</kbd> + <kbd>I</kbd> / <kbd>Alt</kbd> + <kbd>O</kbd> | 窗口高度 减小 / 增大 2% |
| <kbd>Alt</kbd> + <kbd>R</kbd> | 进入交互式 Resize 微调模式（可用方向键微调，按 <kbd>Esc</kbd> 退出） |

#### ⚙️ 工具与系统控制
| 快捷键 | 功能说明 |
|:---|:---|
| <kbd>Alt</kbd> + <kbd>Enter</kbd> | 唤醒主终端（默认 CMD，可配置为 Git Bash 或 Windows Terminal） |
| <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> | **热重载配置文件**（修改 YAML 后必按） |
| <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>W</kbd> | 重新强制重绘所有窗口（界面布局发生偶发抖动时使用） |
| <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> | **临时全局暂停/恢复快捷键**（全屏玩游戏或特定软件热键冲突时神器） |
| <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>E</kbd> | 安全退出 GlazeWM 并恢复系统原装窗口管理 |

> **高效典型工作流示例**：
> - 工作区 1 放浏览器查资料；
> - 工作区 2 放 VS Code / IDE 与集成开发终端；
> - 工作区 3 放微信/飞书/Slack 等协同工具；
> - 工作区 4 放音乐播放器或监控仪表盘；
> 通过 `Alt + 数字键` 毫秒级跳转，再也不需要将视线在拥挤的任务栏上来回搜索。

---

## 五、深度配置与踩坑实战

### 1. 状态栏与顶层窗口之间存在巨大空隙？

- **症状**：开机后发现 Zebar 状态栏和其下方的平铺窗口之间有一大段奇怪的空白带。
- **根因分析**：GlazeWM 默认配置中的顶外边距 `gaps.outer_gap.top` 预设是 `60px`，而现代大部分 Zebar 状态栏主题高度实际仅为 `30px ~ 32px`，差额部分就成了多余的虚无空间。
- **解决方案**：编辑 `~/.glzr/glazewm/config.yaml`，将 `outer_gap.top` 修改为与状态栏高度一致即可：

```yaml
gaps:
  inner_gap: '6px'       # 窗口彼此之间的微缝隙
  outer_gap:
    top: '32px'          # 严格匹配 Zebar 状态栏高度（若想要微小留白可设为 34px）
    right: '6px'
    bottom: '6px'
    left: '6px'
```

### 2. 觉得四周边距（Gaps）太大，浪费高分屏面积？

默认的内外边距相对宽松（均为 20px 左右），若你的显示器偏小或追求更极致的显示面积利用率：
- 极致紧凑铺满：将 `inner_gap` 设为 `0px`，`outer_gap` 的左/右/下设为 `0px`。
- 极简微缝风格（推荐）：将 `inner_gap` 设为 `4px ~ 8px`，既保留视觉层次感，又完全不浪费屏幕空间。

### 3. 状态栏上的小图标点击没反应？为 Wi-Fi 与蓝牙添加系统快捷面板

- **痛点场景**：在使用平铺窗口管理器时，通常会选择将 Windows 任务栏自动隐藏。但多数 Zebar 主题（如经典的 `notth4tcold.mei`）中的 Wi-Fi 图标仅用于静态展示 SSID，甚至默认没有蓝牙图标。每次想要切换 Wi-Fi 或连接蓝牙耳机，都得频繁呼出任务栏，非常割裂。
- **根因与技术调研**：
  1. **缺少蓝牙 Provider**：Zebar 官方目前仅提供 `network`、`cpu`、`memory` 等 Provider，并没有内置的蓝牙数据源；
  2. **Shell 命令调用能力**：早期 Zebar 3.0 不支持执行系统命令，而 **Zebar 3.3.1+ 新增了 `zebar.shellExec` API**，配合白名单机制可安全调用外部命令；
  3. **Windows 11 快速设置深链**：Windows 11 支持通过 Action Center URI 直达控制面板：
     - 网络面板：`explorer.exe ms-actioncenter:controlcenter/network`
     - 蓝牙面板：`explorer.exe ms-actioncenter:controlcenter/bluetooth`
- **实战改造步骤**（以 `~/.glzr/zebar/<主题目录>/` 为例）：
  1. **升级 SDK 引用**：编辑 `index.html`，确保引入的 Zebar CDN 库版本升级至 `3.3.1` 或以上；
  2. **绑定点击事件与补充蓝牙图标**：在 `index.html` 中为 Wi-Fi 容器添加点击事件，并追加蓝牙图标按钮：
     ```html
     <!-- Wi-Fi 区域：点击唤起快速设置网络面板 -->
     <div class="wifi" onClick="zebar.shellExec('explorer.exe', ['ms-actioncenter:controlcenter/network'])">
       ...
     </div>

     <!-- 蓝牙区域：点击唤起快速设置蓝牙面板 -->
     <i class="nf nf-md-bluetooth bluetooth"
        onClick="zebar.shellExec('explorer.exe', ['ms-actioncenter:controlcenter/bluetooth'])"></i>
     ```
  3. **声明权限白名单（关键）**：
     编辑主题下的 `zpack.json`，在 `privileges.shellCommands` 中声明 `explorer.exe` 并用正则严格限定参数，防止权限滥用：
     ```json
     {
       "privileges": {
         "shellCommands": [
           {
             "program": "explorer.exe",
             "argsRegex": "^ms-actioncenter:controlcenter/(network|bluetooth)$"
           }
         ]
       }
     }
     ```
  4. **调整样式**：在 `styles.css` 中将 `.bluetooth` 加入统一样式规则，确保与原有图标间距和悬浮效果对齐。
- **使用体验与细节说明**：
  - **首次授权**：在托盘右键 Zebar 选择重新加载主题（Reload），首次点击图标时会弹出权限确认窗口，允许一次即可；
  - **点击层级与已知限制**：该深链会打开快速设置主面板（对应模块处于折叠状态），点击面板内的 `>` 箭头即可展开网络/设备列表。虽需两次点击（与从任务栏操作次数相同），但完全无需唤出任务栏；
  - **为何不读取已连接蓝牙设备名**：受限于没有官方 Provider，若要实时读取设备名称需要通过 PowerShell 轮询设备状态，开销与复杂度过高，作为快速唤起入口是当下最清爽实用的折中方案。

### 4. <kbd>Alt</kbd> + <kbd>Enter</kbd> 默认启动 CMD，如何换成 Windows Terminal 或 Git Bash？

在 `config.yaml` 的快捷键映射区找到启动终端的配置，将 `shell-exec` 后续命令改为你偏好的终端路径：

```yaml
# 方案 1：无缝调用 Windows Terminal
- commands: ['shell-exec wt.exe']
  bindings: ['alt+enter']

# 方案 2：直接唤起 Git Bash（使用实际绝对路径）
- commands: ['shell-exec "D:/Git/git-bash.exe"']
  bindings: ['alt+enter']
```

> **小技巧**：在 PowerShell 中执行 `where.exe git` 即可迅速获取你的 Git 安装真实根路径。


### 5. 修改了 YAML 配置，页面没有立即发生变化？

切记：每次编辑保存配置文件后，都需要在键盘上按下 **<kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd>** 进行热重载，控制台才会无缝重新读取最新生效规则。

---

## 六、总结与使用建议

**GlazeWM + Zebar** 是目前 Windows 生态中将“纯键盘工作流”与“自动化平铺分屏”结合得最为纯粹、轻量的解决方案之一。

它没有复杂难以驾驭的底层 C++ 编译门槛，也没有 Electron 带来的臃肿内存包袱。唯一的门槛仅在于花 10 分钟熟悉一组符合直觉的 Vim 方向键，以及根据自己的显示器尺寸调整出舒适的窗口 Gap 间距。一旦习惯了这套工作流，你会发现不仅桌面井然有序，而且日常编码与多任务并行的专注度得到了显著提升。
