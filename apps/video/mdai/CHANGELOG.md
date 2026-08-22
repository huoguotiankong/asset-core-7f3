# 麻豆AI Changelog

> 程序级长期技术记忆。后续开发/优化本程序前，先读三份全局文档，再读本文件、registry 和当前运行入口。只记录已验证事实；未完成实机验证的内容必须明确标记。

## 当前基线
- App ID：`mdai`
- Remote Stable：`2.6.3 / Build 26301 / Shell 1.0.0`（已实机验证，继续冻结）
- Remote Test：`2.7.0-test.3 / Build 27003 / Shell 1.1.2-test`
- Local：`2.6.3-local.1`
- Stable 入口：`apps/video/mdai/mdai_remote_v1.txt`
- Test 入口：`apps/video/mdai/mdai_remote_test_v4.txt`
- Local：`mdai.txt`，导入名 `麻豆AI 本地版`

## 当前 Test 运行链
```text
mdai_remote_test_v4.txt / rule version 2026082218
→ bootstrap_test_v4.js / state id=mdai-test / minBuild=27003
→ Remote Manager v2.0.1
→ releases/2.7.0-test.3/release.json
→ core.js          复用 Stable 2.6.3 协议数据桥
→ playback.js      复用 2.7 Test1 PlaybackAdapter
→ ui_base.js       复用 2.7 Test1 Native Design System
→ pages_content.js 复用 Test2 CatalogAdapter / 原页筛选
→ pages_detail.js  复用 Test1 Detail
→ settings_icon.js Test3：官网原图标实机检测/复制
→ runtime.js       Test3 组合导出
```

## 2.7 UI / Catalog 现状
Test1 首轮实机确认片库存在：分类缺项/乱序、`scroll_button` 溢出 `>`、分类点击持续打开新页面。

Test2 已修复：
- 视频/短剧同页切换。
- 原创/国产/字幕固定等宽三栏。
- CatalogAdapter 以已验证分类骨架为稳定基线，再合并动态接口；接口少项不再让已知分类消失，新增真实分类仍可追加。
- 分类/排序/筛选全部使用 `lazyRule → 状态 → refreshPage(false)`，禁止连续压入新 `hiker://page`。
- 高级筛选压成固定四栏，选中态只保留单一浅色背景。

待实机确认：
- [ ] 片库不再出现 `>` 溢出。
- [ ] 连续切换分类后返回一次即可退出片库。
- [ ] 分类骨架完整且动态新增可追加。

## 官网图标：2.7.0-test.3
用户确认此前手动尝试 `https://mdcmai4.xyz/favicon.ico` 无效，而且当前服务端环境无法可靠解析官网域名，因此禁止继续猜 `/favicon.png`、`/logo.png` 或依赖第三方 favicon API。

Test3 新增“设置 → 官网图标检测”：
1. 在用户手机当前可访问的 `mdai_host` 环境请求官网首页。
2. 解析页面所有 `<link>`，筛选 `rel=icon / shortcut icon / apple-touch-icon`。
3. 相对地址转为当前 Host 的绝对地址；忽略 data URI。
4. `apple-touch-icon`、shortcut icon、带较大 `sizes` 的站点声明提高优先级。
5. 检测成功写入 `mdai_official_icon_detected`，并立即返回 `copy://<真实地址>`，方便用户手动填写海阔程序图标。
6. 设置页再次打开会显示缓存地址，并提供“复制已检测图标地址”。

固定原则：**第三方 favicon 服务只做发现器，不作为正式图标事实源；站点真实 icon 以用户可访问环境中的 HTML 声明为准。**

待实机确认：
- [ ] 点击“官网图标检测”能拿到并复制地址。
- [ ] 复制地址在浏览器/海阔图标字段可直接显示真实站点图标。
- [ ] 若页面未声明 icon，应明确提示“官网首页没有声明可用 icon”，不继续猜地址。

## PlaybackAdapter 2.7
当前仍沿用 Test1，未在 Test3 修改：
- `smart`：稳定代理 + 原始直链。
- `direct`：原始直链优先。
- `proxy`：只走站点稳定代理。
- `compat`：显式启用时才 `cacheM3u8()`。
- 播放诊断：`mdai_play_diag_v2`。

当前站点事实继续沿用 Stable 2.6.3：
- 默认 Host：`https://mdcmai4.xyz`。
- 主要接口：`/api/v1/`。
- 稳定 M3U8 代理：`/api/v1/m3u8/proxy?path=`。
- 播放请求使用当前站点 Referer/UA。

## 本地状态
- 历史：`mdai_watch_history_v1`
- 收藏：`mdai_favorites_v1`
- 搜索历史：`mdai_search_history_v1`
- Core 快照：`mdai_core_snapshot_263_v270`
- 播放策略：`mdai_play_strategy_v2`
- 播放诊断：`mdai_play_diag_v2`
- Test3 官网图标：`mdai_official_icon_detected`

## 回归 / 恢复
- 2.7 UI 与播放没有完成实机闭环前不得晋级 Stable。
- Test 异常时覆盖 Stable 2.6.3 或导入 `麻豆AI 本地版`。

---
## 版本记录
### 2.7.0-test.3 / 2026-08-22
- 在 Test2 片库 UI 基线上新增官网原图标实机检测/复制。
- 新增独立 `settings_icon.js`，不修改 Content/Detail/Playback 主业务模块。
- Build27003 / Shell v4 / Bootstrap v4 强制越过 Test2 active state。

### 2.7.0-test.2 / 2026-08-22
- 根据实机截图修复片库分类完整性、溢出 `>` 和分类连续开新页面问题。
- 新增 CatalogAdapter，所有片库筛选原页刷新。

### 2.7.0-test.1 / 2026-08-22
- 基于 Stable 2.6.3 开始 Core / Playback / UI / Content / Detail / Runtime 模块化重构。

### 2.6.3 Stable / 2026-08-22
- 用户实机确认 `2.6.3-test.1 / Build26301` 正常后原样晋级。
