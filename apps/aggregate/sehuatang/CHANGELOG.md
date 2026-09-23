# 色花堂海阔小程序 CHANGELOG

状态：**0.1.0-test.6 / Build 10106 / 待实机验证**  
首次建立：2026-09-23

## 当前恢复基线

- App ID：`sehuatang`
- 规则名：`色花堂`
- 类型：自用远程 Test
- 正式运行仓：`huoguotiankong/asset-core-7f3@main`
- 当前无 Stable / Latest。
- Test Shell：`apps/aggregate/sehuatang/sehuatang_remote_test_v6_b10106.txt`
- Bootstrap：`apps/aggregate/sehuatang/bootstrap_test_v6_b10106.js`
- Release：`apps/aggregate/sehuatang/releases/0.1.0-test.6/release.json`

## 0.1.0-test.6 / Build 10106 — 自动年龄确认、分组分类、帖子详情重写

### 第四轮实机事实

用户实机确认 Test5 后：

1. 原生首页已经可以识别约 45 个真实论坛板块；
2. 主题列表标题和缩略图明显比 Test3 正常，说明 Test4 的 `tid` 聚合与图片提取方向有效；
3. 45 个板块全部纵向一列，查找下方分类成本过高；
4. Test5 仍需要用户手动点击 18+ 年龄确认，因为 Test5 只负责“确认后的 Cookie 捕获/持久化”，并没有主动点击年龄按钮；
5. 帖子详情仍沿用 Test1 粗 Parser，实机出现“本帖最后由…编辑”、签名/楼主资料被误当正文，而真实帖子主体缺失；
6. 用户提供的 dy2020 成熟旧规则明确给出了当前站点 PC DOM：`#postlist > div`，正文优先 `.t_fsz`，其次 `.t_f`；论坛大类顺序为原创BT电影、在线视频区、原档收藏、色花图片、色花文学、综合讨论区。

### Test6 修复

1. **年龄确认改为自动点击**
   - 首页首次加载时，如果没有已记录确认状态，使用隐藏 `fetchCodeByWebView()` 打开站点；
   - 检测页面文本包含 `满18岁 / over 18 / please click here` 时，自动在 `a/button/input/[onclick]/[role=button]` 中寻找匹配按钮并 `click()`；
   - 跳转到真实论坛结构后保存 Cookie 和年龄确认状态；
   - `shtVerify` 可视验证页也使用同样自动点击逻辑，然后继续跳登录/签到；
   - 若未来站点加入验证码或真人挑战，不尝试绕过，只处理当前的声明式 18+ 首访页。

2. **Cookie 复用增强**
   - 同时尝试 `sehuatang.org` 与 `www.sehuatang.org` Cookie；
   - 优先复用 Test5 已保存的 `sht_web_cookie_v5`；
   - PC `fetchPC` 请求显式带 Cookie，用于论坛分组和帖子正文解析。

3. **论坛分类改为 Product-first 分组导航**

固定六个一级大类，与用户提供成熟旧规则保持一致：

```text
原创BT电影 → forum-2-1.html
在线视频区 → forum-41-1.html
原档收藏   → forum-145-1.html
色花图片   → forum-155-1.html
色花文学   → forum-154-1.html
综合讨论区 → forum-95-1.html
```

- 首页一级分类使用 `scroll_button` 横向切换；
- 只显示当前一级分类下的子板块；
- 子板块使用 `text_2` 两列布局；
- PC `forum.php` 继续按旧规则已验证的 `.bm_c → dt → a` 结构解析；
- 分组结果缓存 6 小时；
- 解析失败时至少回退到该一级大类自身，不重新显示 45 个板块长列表。

4. **帖子详情重写**
   - 不再使用 Test1 的 `postmessage_*` 粗分块作为主要链路；
   - 改用 PC 页面：

```text
#postlist > div
→ div.t_fsz Html
→ div.t_f Html fallback
```

- 作者优先 `.authi a` / `.xw1`；
- 正文使用 `rich_text` 保留原始图片和基础排版；
- 过滤 script/style/iframe、签名、`xs0`、`mbn`、`tip tip_4`、`本帖最后由…编辑` 等噪声；
- `file=` 图片属性改写为 `src=` 并补 Cookie；
- 相对图片/论坛链接改为绝对地址；
- 继续从每层正文扫描 magnet；
- 每条 magnet 保持 `115 / 迅雷 / PikPak / 复制` 四个动作；
- PC 请求拿不到正文时，再用 WebView 获取渲染后 `#postlist .t_fsz/.t_f`。

5. **保持不动**
   - Test4 的主题列表 `tid` 聚合、标题评分、缩略图解析继续使用；
   - 最新发表 / 最新热门 / 最新精华动态发现继续使用；
   - 搜索功能暂不在 Test6 扩大修改面；
   - Stable / Latest / 根 registry 继续不建立。

### Test6 静态门禁

- `patch_ux_thread_access.js`：`node --check` 通过；
- `bootstrap_test_v6_b10106.js`：`node --check` 通过；
- Test6 `release.json`：JSON 解析通过；
- Test6 Shell 外层规则及内层 `pages` JSON：解析通过。

### Test6 实机优先验收

1. 覆盖导入后直接打开首页，看首次 18+ 页面是否无需手动点击即可进入真实论坛数据；
2. 首页六个大类能否横向切换；
3. 每次只显示当前大类子板块，且为两列；
4. 打开之前截图里的 `[综合讨论区]` 任意帖子，确认正文是否真正出现，而不是只显示最后编辑/签名；
5. 带图片帖子是否在正文内正确显示；
6. 带 magnet 帖子是否显示 115 / 迅雷 / PikPak / 复制；
7. 自动登录入口若仍停在年龄页，记录当前按钮 DOM/文字，继续针对性适配。

## 0.1.0-test.5 / Build 10105 — 年龄确认 Cookie 持久化

- 参考用户提供的 dy2020 旧规则，新增 `shtVerify` X5 页面；
- 首次年龄确认仍要求人工点击；
- 确认完成后使用 `fba.getCookie()` / `fba.putVar()` 保存 Cookie 和确认状态；
- 自动继续跳转登录/签到；
- 实机结果：Cookie 持久化方向正确，但“年龄确认动作本身”仍是手动，因此 Test6 改为自动点击。

## 0.1.0-test.4 / Build 10104 — 论坛产品结构与 Parser 收敛

- 同一 `tid` 聚合候选链接，过滤 `00:24:34` 等时长并选择真实标题；
- 从同一主题链接提取真实缩略图；无图时降级 `text_1`；
- 论坛首页改为 `forum.php` 优先，避免只拿 Portal 5 个快捷入口；
- 最新发表 / 最新热门 / 最新精华从真实导航动态发现；
- 首次确认年龄后再登录。

## 0.1.0-test.3 / Build 10103 — 主题列表渲染源码恢复

- 主题列表数据链：`mobile fetch → mobile WebView → PC fetch → PC WebView`；
- 支持 `tid / ptid / thread-<tid>`；
- 失败页显示 HTML 字符数、anchor 数、主题数和页面 title。

## 0.1.0-test.2 / Build 10102 — 原生入口恢复

- 首页数据链改为 `portal → mobile forum → PC forum → WebView HTML`；
- 放宽 Discuz forum/thread 参数顺序、伪静态 URL、无引号 href；
- 首页最新/热门/精华改为紧凑原生入口。

## 0.1.0-test.1 / Build 10101 — 基础论坛 + 磁链云播

- 原生搜索、论坛分区、主题、帖子 Parser 初版；
- 帖子图片与 magnet 提取；
- magnet 提供 115 / 迅雷 / PikPak / 复制；
- 115：`hiker://page/115Offline?rule=115.简&page=fypage&add=<encoded magnet>`；
- 迅雷：`hiker://page/diaoyong?rule=迅雷&page=fypage#<magnet>`；
- PikPak：`pikpakapp://mypikpak.com/xpan/main_tab?tab=1&add_url=<magnet>`。

## 当前禁用 / 待确认

- 未实机确认前，不直接 POST 签到或回帖；登录、验证码、人机验证继续由官方页面处理。
- 不保存真实账号、密码、Cookie、formhash 到仓库；运行态 Cookie 仅保存在海阔本地变量/WebView Cookie 容器。
- 不把 `.net/.com` 做成每次首屏并发探活固定税。
- Test 阶段不晋级 Stable，不登记根 `registry.json`。
- 下一阶段优先：Test6 自动年龄确认闭环 → 分类分组回归 → 帖子正文/图片 → magnet 云播实机闭环 → 再处理原生登录状态、签到、回复和 UI 精修。
