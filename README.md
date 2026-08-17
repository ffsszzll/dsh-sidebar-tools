# DSH 右侧工具箱边栏（天气 · 待办 · 日历）

一个为 **DeepSeek Harness Web GUI** 编写的动态 Cordis 插件：在页面右缘添加可折叠的工具边栏，包含三个按钮 —— 🌤️ 天气、✅ 待办、📅 日历。

> 动态 Cordis 插件：通过 `cordis_define` / `cordis_run` 在当前会话中定义并激活，不修改任何部署配置文件，停止或卸载时自动清理所有副作用。

## 功能

| 按钮 | 功能 | 数据来源 |
|---|---|---|
| 🌤️ 天气 | 当前温度 / 体感 / 湿度 / 风速 + 未来 5 天预报；支持输入城市（留空自动定位） | Host 端获取 [wttr.in](https://wttr.in)（免密钥），Client 经 `host.call('weather.get')` 读取 |
| ✅ 待办 | 添加、勾选完成、删除，统计总数 / 未完成数 | Host 端持久化到工作区文件 `<workspaceRoot>\dsh-sidebar-todos.json`（RPC：`todo.list/add/toggle/remove`），重启 / 更新自动恢复 |
| 📅 日历 | 月历网格（周一开头）、翻月、今天高亮、点击选日 | 纯 Client 渲染 |

## 截图

_（待补充：`docs/screenshot.png`，浅色 / 深色模式各一张）_

## 架构

- **挂载点**：`shell.overlay` 插槽（框架级浮层，纯增量 `list` 插槽，不替换任何出厂 UI），侧边栏固定停靠页面右缘垂直居中。
- **Host 半段**（`plugin/host.js`）：
  - `weather.get`：双通道获取天气 —— 优先 `ctx.web.fetch`（若部署注册了 fetch provider），否则回退 `ctx.subprocess` 调用系统自带 `curl.exe` 请求 `https://wttr.in/<city>?format=j1`，解析当前天气与 5 天预报。
  - `todo.list / todo.add / todo.toggle / todo.remove`：待办事项的增删改；启动时通过 `fs` 服务从 `<workspaceRoot>\dsh-sidebar-todos.json` 自动加载，每次变更原子写入，`fs` 不可用时降级为纯内存。
- **Client 半段**（`plugin/client.js`）：
  - 注册 `shell.overlay` 列表插槽（`id: 'dsh-tools-sidebar'`）。
  - 三个面板组件：天气、待办、日历（全部使用 `React.createElement`，无 JSX）。
  - **完全自包含配色**：本地 `--dsx-*` 变量 + `body[data-ds-dark-theme]` 深色硬覆盖，不依赖主题变量的解析结果，深 / 浅色模式均保证可读。

### 设计要点

- **网络**：Host 沙箱禁用了全局 `fetch` / `require` / `process`，所有网络与进程操作都通过 cordis 服务（`web` / `subprocess`）完成，无任何外部依赖。
- **数据安全**：所有 Host → Client 的 RPC 返回值均为纯 JSON；数值字段经安全转换（缺失返回 `null`，杜绝 `NaN` / `undefined` 破坏序列化）。
- **生命周期**：插槽注册、样式、RPC handler 全部归入插件 Fiber，`cordis_stop` / `cordis_undefine` 后自动清理。

## 安装

1. 打开 DSH Web GUI 的一个会话。
2. 使用 `cordis_define`（`kind: "new"`，idPrefix 任取 3–6 个小写字母）：
   - `code.host` ← `plugin/host.js` 的完整内容
   - `code.client` ← `plugin/client.js` 的完整内容
3. 使用 `cordis_run` 激活返回的 `pluginId` / `packageId`。
4. 在界面批准授权后，右侧边栏即出现。

## 常见问题

- **刷新页面后侧边栏消失？** 动态插件的 Client 半段绑定在浏览器页面连接上，页面刷新后需要重新激活一次（对会话内的 Agent 说「重新加载插件」即可，或重新执行一次 `cordis_run`）。Host 半段在进程内保持运行。
- **侧边栏不可见但插件显示 running？** 同上 —— 先重新激活；若仍不可见，检查是否在连接该会话的那个页面/标签页中查看。

## 已知限制

- **待办持久化文件**：保存在工作区根目录 `dsh-sidebar-todos.json`（UTF-8 JSON 数组）。删除该文件即清空待办；文件损坏时插件会从空列表重新开始。
- **天气网络**：数据来自 wttr.in；要求本机可用 `curl.exe`（Windows 10+ 自带，位于 `System32`）或部署已注册 web fetch provider。

## 版本历史

- **v1** (`pkg-1`)：初始版本。
- **v2** (`pkg-2`)：天气通道修复 —— 部署未注册 web fetch provider，增加 `subprocess` + `curl.exe` 回退通道。
- **v3** (`pkg-3`)：修复预报天气代码解析 —— wttr.in 每日条目无顶层 `weatherCode`，改从 `hourly`（正午优先）提取；数值字段安全转换。
- **v4** (`pkg-4`)：修复按钮白底白字 —— 完全自包含配色 + 深色硬覆盖，按钮文字加大加粗，新增 ⓘ 诊断按钮。
- **v5** (`pkg-5`)：移除 ⓘ 诊断按钮，干净发布版。
- **v6** (`pkg-6`)：待办持久化 —— 通过 `fs` 服务读写工作区 `dsh-sidebar-todos.json`，重启 / 更新不丢。

## 许可证

[MIT](LICENSE)
