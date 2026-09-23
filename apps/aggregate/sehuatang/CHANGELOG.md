# 色花堂海阔小程序 CHANGELOG

状态：**0.1.0-test.2 / Build 10102 / 待实机验证**  
首次建立：2026-09-23

## 当前恢复基线

- App ID：`sehuatang`
- 规则名：`色花堂`
- 类型：自用远程 Test
- 正式运行仓：`huoguotiankong/asset-core-7f3@main`
- 当前无 Stable / Latest。
- Test Shell：`apps/aggregate/sehuatang/sehuatang_remote_test_v2_b10102.txt`
- Bootstrap：`apps/aggregate/sehuatang/bootstrap_test_v2_b10102.js`
- Release：`apps/aggregate/sehuatang/releases/0.1.0-test.2/release.json`


## 0.1.0-test.2 / Build 10102 — 首次实机原生入口修复

### 实机事实

用户 2026-09-23 首次实机截图确认 Test1 可以启动，但首页“论坛分区”显示“未识别到板块”，只能看到网页版兜底入口；同时“最新主题”使用 `movie_1 + logo` 导致右侧 logo 过大。判定 Test1 原生数据入口未完成，不可晋级。

### 根因与修复

1. Test1 论坛列表 fallback 使用 `forum.php?forumlist=1&mobile=2`，并不属于当前模板可靠入口。Test2 改为四级链：

```text
portal.php?mod=index&mobile=2
→ forum.php?mobile=2
→ forum.php?mobile=no
→ fetchCodeByWebView(forum.php?mobile=2) 只取渲染后 HTML
→ 原生 Parser / Renderer
```

最后一级只用 WebView 获取源码，最终仍渲染海阔原生页面，不把网页当 UI。

2. `addMobile()` 修正：URL 已存在任意 `mobile=2/no/yes` 时不再追加第二个 mobile 参数，保证 PC forum index 能真正请求 `mobile=no`。

3. Forum/Thread 链接识别放宽：
   - `fid` 与 `mod=forumdisplay` 不再要求固定 query 顺序；
   - `tid` 与 `mod=viewthread` 不再要求固定 query 顺序；
   - 继续支持 `forum-<fid>-<page>.html` / `thread-<tid>-...html`；
   - anchor parser 同时支持双引号、单引号、无引号 href；
   - anchor 文本为空时尝试 `title/aria-label`。

4. 板块成功后缓存 6 小时，避免每次首页都触发 WebView fallback。

5. 首页视觉修复：
   - 删除 Test1 巨大 logo 的“最新主题” `movie_1`；
   - 改成轻量 `text_1` 的 最新 / 热门 / 精华 三个原生主题入口；
   - 真实论坛板块也先使用紧凑文本行，待数据结构稳定后再做更精美卡片 UI。

### 交付结构

Test2 采用 overlay：冻结 Test1 `runtime.js`，只新增 `patch_native_index.js` 覆盖首页与主题列表入口，避免磁链/帖子/账号模块在同一轮被无必要重写。

### 保持不动

- 登录 / 签到 / 回复仍先走同域 WebView；
- 115 `115Offline?add=` 合同不变；
- 迅雷 `diaoyong#magnet` 合同不变；
- PikPak deep link 不变；
- Stable/Latest/根 registry 仍不建立。

### 静态门禁

- `patch_native_index.js` 与 Bootstrap：`node --check` 通过；
- Test2 fixture 新增验证：`fid` 在 `mod` 前、无引号 href、伪静态论坛/主题 URL 均能识别；
- Test1 的正文图片过滤与 2 条带参数 magnet 完整提取继续回归通过。

### Test2 实机优先验收

1. 覆盖导入后首页“论坛分区”是否直接出现真实板块；
2. 首页最新/热门/精华不再出现巨大 logo；
3. 任意板块是否进入原生主题列表；
4. 任意主题是否进入原生帖子详情；
5. 如果仍未识别板块，直接截图首页和设置页最底部“最近阶段”，下一版按真实返回层继续收敛。

## 0.1.0-test.1 / Build 10101 — Phase 1 基础论坛 + 磁链云播

### 站点与产品边界

当前按 Discuz! 移动站合同实现，首选入口：

```text
https://sehuatang.org/portal.php?mod=index&mobile=2
```

公开页面/索引可确认当前仍存在 Discuz `forumdisplay / viewthread` 路由及 `dd_sign` 签到插件，但本开发环境未能稳定抓到用户当前入口的完整实时 HTML，因此 **Test1 的 DOM/HTML Parser 必须以手机实机结果继续校正**，不得标记为 Stable。

### 已实现

1. 首页
   - 原生搜索输入；
   - 登录 / 签到 / 搜索 / 设置四个紧凑入口；
   - `portal.php` 优先解析论坛分区，失败后尝试 `forum.php?forumlist=1&mobile=2`；
   - 最新主题入口。

2. 论坛/主题
   - 自动识别 `forum.php?mod=forumdisplay&fid=` 与 `forum-<fid>-<page>.html`；
   - 自动识别 `forum.php?mod=viewthread&tid=` 与 `thread-<tid>-...html`；
   - 使用 `MY_PAGE` 对板块列表分页，不用同级页面堆栈模拟分页/筛选。

3. 帖子详情
   - 优先解析 `postmessage_<pid>`；兼容 `message / pct / pcb` 类结构；
   - 正文先转纯文本，避免不可信 HTML 直接污染原生组件；
   - 提取附件/正文图片，并过滤常见头像、表情、loading/logo；
   - 自动扫描帖子内 `magnet:?xt=urn:btih:`，兼容常见百分号编码形式。

4. 云播调用

115 使用已在 `115.简` 项目实机验证的外部合同：

```text
hiker://page/115Offline?rule=115.简&page=fypage&add=<encoded magnet>
```

迅雷沿用当前 `迅雷` 小程序源码合同：

```text
hiker://page/diaoyong?rule=迅雷&page=fypage#<magnet>
```

PikPak 沿用成熟磁力工具样本的 App Deep Link：

```text
pikpakapp://mypikpak.com/xpan/main_tab?tab=1&add_url=<magnet>
```

首版每条磁链显示：`115 / 迅雷 / PikPak / 复制`。

5. 登录 / 签到 / 回复
   - 登录：`member.php?mod=logging&action=login&mobile=2`；
   - 签到：`plugin.php?id=dd_sign:index&mobile=2`；
   - 回复：优先从帖子 HTML 提取官方 `mod=post&action=reply` 链接，否则回退帖子原页；
   - Test1 全部交给同域 X5 WebView，避免未验证前自行伪造 formhash / POST 参数。
   - Native Request 读取 `getCookie(origin)`，等待实机确认浏览器 Cookie 与请求容器是否共享。

6. 搜索
   - 首版尝试 `search.php?mod=forum&searchsubmit=yes&srchtxt=...&mobile=2`；
   - 若没有结构化主题结果，显示网页搜索兜底；
   - 待实机捕获真实搜索 formhash/权限行为后，再决定是否原生强化。

7. 域名与诊断
   - 默认 `https://sehuatang.org`；
   - 设置页可手动切换 `.org / .net / .com`；
   - Test1 不在每次首屏进行全量域名探活；
   - 只记录最近 stage / origin / 脱敏错误，不显示 Cookie 原值。

### 静态门禁

- `runtime.js`：`node --check` 通过。
- `bootstrap_test_v1_b10101.js`：`node --check` 通过。
- `release.json / manifest.json / test.json / channels.json`：JSON 解析通过。
- 自建 Discuz fixture 已验证：论坛链接去重、主题链接识别、图片噪声过滤、2 条带参数 magnet 完整提取。

### Test1 实机验收清单

1. 导入后首页能打开，不白屏；
2. 首页能识别真实论坛分区；
3. 任意板块能显示主题并正常翻页；
4. 任意帖子正文与主要图片可读；
5. 带磁链帖子能显示完整 magnet 操作区；
6. 115 能进入 `115Offline`；
7. 迅雷能进入 `diaoyong` 并显示资源；
8. PikPak 能被系统调起并接收 magnet；
9. 网页登录成功后返回小程序，再开受限帖子检查 Cookie 是否共享；
10. 签到页可打开并完成站点自己的签到；
11. 回复入口能进入正确帖子回复页；
12. 搜索至少网页兜底可用，原生结果以实机为准。

### 后续顺序

```text
Test1 模板/Cookie/云播闭环
→ Test2 原生账号状态 + 原生签到
→ Test3 原生回复/楼层/只看楼主
→ Test4 收藏/历史/关注板块/消息
→ Test5 自动域名 last-good + 性能缓存 + UI 精修
→ Candidate
→ Stable
```

## 当前禁用/待确认

- 未实机确认前，不直接 POST 签到或回帖。
- 不保存真实账号、密码、Cookie、formhash。
- 不把 `.net/.com` 当每次首屏并发探活固定税。
- 不把 Test1 直接晋级 Stable。
- 暂不登记根 `registry.json` / 云仓库正式目录，避免未验证新程序污染稳定分发；Test1 先使用固定 Raw 导入口令，实机通过后再登记。
