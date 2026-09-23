# 色花堂海阔小程序 CHANGELOG

状态：**0.1.0-test.5 / Build 10105 / 待实机验证**  
首次建立：2026-09-23

## 当前恢复基线

- App ID：`sehuatang`
- 规则名：`色花堂`
- 类型：自用远程 Test
- 正式运行仓：`huoguotiankong/asset-core-7f3@main`
- 当前无 Stable / Latest。
- Test Shell：`apps/aggregate/sehuatang/sehuatang_remote_test_v5_b10105.txt`
- Bootstrap：`apps/aggregate/sehuatang/bootstrap_test_v5_b10105.js`
- Release：`apps/aggregate/sehuatang/releases/0.1.0-test.5/release.json`

## 0.1.0-test.5 / Build 10105 — 年龄确认 Cookie 持久化

### 用户提供的成熟旧规则结论

用户提供 dy2020 的色花堂旧规则后确认，其验证流程并不是自动点击验证按钮，而是：

```text
X5 WebView 打开站点
→ 用户完成网页上的确认/验证
→ 注入 JS 循环检测真实页面节点
→ fba.getCookie(host)
→ fba.putVar(host + 'ck', cookie)
→ 后续 fetchPC/fetch 主动携带该 Cookie
```

这说明当前程序应该把“年龄确认动作”和“确认后的 Cookie 捕获/复用”分开，而不是把首次 18+ 页面误当成登录失败。

### Test5 实现

1. 新增 `shtVerify` 页面，使用 `x5_webview_single`。
2. 首次出现 `满18岁，请点此进入 / If you are over 18` 时由用户手动确认一次；程序不替用户点击年龄确认。
3. 注入 JS 每隔约 600~900ms 检测页面：
   - 年龄确认文本仍存在：继续等待；
   - 已出现真实论坛结构（如 `#threadlisttableid / .bm_c / #waterfall / forum-` 链接等）：判定年龄确认完成；
   - 通过 `fba.getCookie(location.origin)` / `fba.getCookie(host)` 捕获 WebView Cookie；
   - 通过 `fba.putVar` 保存 Cookie、确认状态和时间。
4. 年龄确认完成后自动继续跳转：
   - 登录模式 → 官方登录页；
   - 签到模式 → `dd_sign` 官方签到页；
   - 刷新模式 → 论坛首页。
5. 设置页改为：
   - `① 年龄确认后登录`；
   - `② 网页登录`；
   - `③ 每日签到`；
   - 年龄/Cookie 状态；
   - 重新确认并刷新 Cookie；
   - Test4 的线路/缓存/最近诊断保留在原设置子页。
6. 登录验证码、人机验证、账号密码仍完全由官网页面处理，不在规则里保存真实账号密码。
7. Test4 的论坛板块/主题标题/缩略图 Parser 和 Test1 的 115 / 迅雷 / PikPak 磁链合同保持不动。

### Test5 实机验收

1. 设置 → `① 年龄确认后登录`；
2. 第一次出现年龄页时手动点一次“满18岁，请点此进入”；
3. 确认后应自动进入登录页，而不是停在论坛首页；
4. 返回设置页后应显示“年龄确认状态：已记录”，尽量同时显示“已保存 WebView Cookie”；
5. 再点 `② 网页登录`，若 Cookie 有效，应不再重复出现年龄确认页；
6. 登录后测试 `③ 每日签到`；
7. 如果仍反复弹年龄页，下一步重点核对 `sehuatang.org` 与 `www.sehuatang.org` Cookie 域及 X5 Cookie 共享边界。

## 0.1.0-test.4 / Build 10104 — 论坛产品结构与 Parser 收敛

### 第三轮实机事实

用户 2026-09-23 连续实机截图确认：

1. Test3 的原生首页已能识别出 5 个 forum 链接，说明论坛入口链路已经工作；
2. 点击“国产”后，WebView 源码能解析到 **30 条主题**，说明数据并非抓不到；
3. 主题标题却被解析成 `00:24:34 / 00:24:55 / 00:26:26` 等视频时长；
4. 同一列表右侧出现默认空白图片占位，说明此前强制 `movie_1` 但没有真实缩略图；
5. 官网真实论坛 UI 显示 `最新发表 / 最新热门 / 最新精华 / 我的话题`，此前硬编码标准 Discuz `guide&view=hot` 不可靠；
6. 官网完整论坛页包含更多板块层级，而原生首页只显示 `国产 / 无码 / 字幕 / 有码 / 三级`，表明 Portal 快捷入口被误当成完整板块目录；
7. “网页登录”首次打开时实际出现站点 18+ 年龄确认页，因此账号流程必须先完成年龄确认，再进入登录。

### Test4 修复

1. **主题标题按 tid 聚合，而不是先到先得**
   - 同一个帖子可能同时存在“时长链接 / 缩略图链接 / 标题链接”；
   - 先按 `tid` 聚合全部候选；
   - 明确过滤纯时长、纯日期、纯数字、`查看帖子/回复/详情` 等通用文本；
   - 再按中文/字母长度与信息量选择最佳标题。

2. **缩略图提取**
   - 从同一 tid 的 `<img>` 中尝试读取 `data-original / data-src / zoomfile / file / src`；
   - 过滤 avatar、smiley、loading、logo；
   - 有真实缩略图才使用 `movie_1`；
   - 无图自动降级 `text_1`，不再显示默认空占位图。

3. **论坛分区入口改为 forum 优先**

```text
forum.php?mobile=2
→ forum.php?mobile=no
→ portal.php?mod=index&mobile=2
```

每级仍支持普通请求 + WebView 渲染源码。新建 `sht_forum_cache_v4`，不会继续复用 Test2/Test3 那个只缓存 5 个快捷入口的旧缓存。

4. **真实话题导航动态发现**
   - 不再假设 `最新/热门/精华` 必须是标准 `guide&view=`；
   - 先从当前论坛页按文字动态寻找 `最新发表 / 最新热门 / 最新精华` 的真实 href；
   - 找不到才使用标准 Discuz fallback。

5. **账号入口顺序修正**
   - 设置页拆为：首次访问/年龄确认 → 网页登录 → 每日签到；
   - 验证码/安全验证继续由官方网页完成；
   - Cookie 共享状态继续以海阔实机为准。

6. **保持不动**
   - Test1 的帖子详情 Parser 暂不重写；
   - 115 / 迅雷 / PikPak 磁链调用合同不动；
   - 搜索逻辑暂不扩大修改面；
   - Stable / Latest / 根 registry 仍不建立。

### Test4 实机优先验收

1. 首页论坛板块数量/名称是否更接近官网完整论坛页；
2. 进入“国产”等板块，标题不再是纯时长；
3. 有缩略图主题显示真实图片，无图主题不出现默认占位图；
4. 最新发表 / 最新热门 / 最新精华至少两项能得到原生主题列表。

## 0.1.0-test.3 / Build 10103 — 主题列表渲染源码恢复

- 原生页面壳已工作，但普通 HTTP 取不到可识别主题。
- 主题列表数据链升级为：`mobile fetch → mobile WebView HTML → PC fetch → PC WebView HTML`。
- 支持 `tid / ptid / thread-<tid>`。
- 失败页直接显示 HTML 字符数、anchor 数、识别主题数、页面 title 和命中阶段。

## 0.1.0-test.2 / Build 10102 — 原生入口恢复

- Test1 首页只能看到网页兜底；Test2 改为 `portal → mobile forum → PC forum → WebView HTML`。
- 放宽 forum/thread 链接参数顺序、伪静态 URL、无引号 href。
- 首页最新/热门/精华改为紧凑原生文本入口。

## 0.1.0-test.1 / Build 10101 — 基础论坛 + 磁链云播

- 原生搜索框、登录/签到/搜索/设置入口；
- Discuz 论坛分区、主题、帖子 Parser 初版；
- 帖子正文/图片提取；
- 自动识别 `magnet:?xt=urn:btih:`；
- 每条磁链提供 115 / 迅雷 / PikPak / 复制；
- 115：`hiker://page/115Offline?rule=115.简&page=fypage&add=<encoded magnet>`；
- 迅雷：`hiker://page/diaoyong?rule=迅雷&page=fypage#<magnet>`；
- PikPak：`pikpakapp://mypikpak.com/xpan/main_tab?tab=1&add_url=<magnet>`；
- 登录/签到/回复首版走同域 WebView。

## 当前禁用 / 待确认

- 未实机确认前，不直接 POST 签到或回帖。
- 不保存真实账号、密码、Cookie、formhash 到仓库；运行态 Cookie 仅保存在海阔本地变量/WebView Cookie 容器。
- 不把 `.net/.com` 做成每次首屏并发探活固定税。
- Test 阶段不晋级 Stable，不登记根 `registry.json`。
- 下一阶段优先完成：Test5 年龄确认 Cookie 闭环 → Test4 论坛列表回归 → 帖子详情 → 磁链云播实机闭环。
