# 色花堂海阔小程序 CHANGELOG

状态：**0.1.0-test.7 / Build 10107 / 待实机验证**  
首次建立：2026-09-23

## 当前恢复基线

- App ID：`sehuatang`
- 规则名：`色花堂`
- 类型：自用远程 Test
- 正式运行仓：`huoguotiankong/asset-core-7f3@main`
- 当前无 Stable / Latest。
- Test Shell：`apps/aggregate/sehuatang/sehuatang_remote_test_v7_b10107.txt`
- Bootstrap：`apps/aggregate/sehuatang/bootstrap_test_v7_b10107.js`
- Release：`apps/aggregate/sehuatang/releases/0.1.0-test.7/release.json`
- Test7 直接继承 Test1~Test6 已验证/待验证模块，并叠加 `releases/0.1.0-test.7/patch_stability_polish.js`。

## 0.1.0-test.7 / Build 10107 — 访问状态、主题列表、正文媒体与 UI 收敛

### Test6 后续实机反馈

1. 首页六大类方向正确，但页面信息仍偏重复，分类视觉需要进一步收敛；
2. “最新发表 / 最新热门 / 最新精华”进入后出现空列表；
3. 站点实际已能取得论坛数据时，首页仍可能显示“自动年龄确认尚未成功”，属于访问状态假阴性；
4. 六大类不能简单按前六个 `.bm_c` 顺序绑定，需要按真实根 `fid` 定位对应论坛块；
5. 帖子正文已能进入真实 `#postlist`，但部分正文图片仍显示占位图/加载图；
6. 同一个 magnet 在正文与云播区重复出现，视觉噪声较大；
7. 回复编号受被过滤节点影响，可能出现从“回复 2/3”开始；
8. 在线视频类帖子正文只出现“视频加载中”等占位文字，没有可直接播放入口。

### Test7 根因与修复

1. **主题列表请求链统一到 Test7 Cookie-aware Runtime**
   - Test6 只覆盖了 `home/thread`，普通板块与 guide 仍可能落回 Test4 的旧 `forum()`；
   - Test4 的旧请求只读 WebView 容器 Cookie，未复用 Test5/Test6 保存到 `sht_web_cookie_v5` 的 Cookie；
   - Test7 自己接管普通板块和 `latest/hot/digest` 的论坛列表请求，统一使用当前 Cookie、PC fetch、WebView fallback 与 `mobile=no` 变体；
   - 同一 `tid` 继续聚合标题/缩略图候选，过滤时间、纯数字和导航噪声。

2. **最新 / 热门 / 精华入口重新动态发现**
   - 先从当前真实 `forum.php` 中按“最新发表/最新主题/最新帖子、热门、精华”等文本匹配真实 href；
   - 文本匹配不到时继续识别 `mod=guide&view=newthread/hot/digest` 链接；
   - 最后才回退到标准 Discuz guide URL，不再只依赖历史入口。

3. **访问状态与 Cookie 状态彻底拆分**
   - 新增 `sht_access_ok_v7` 表示“已经越过 18+ 首访页并取得真实论坛结构”；
   - `sht_web_cookie_v5` 仍只表示 Cookie 容器已经同步；
   - 首页不再把“没有 Cookie”误判成“年龄确认失败”；
   - 设置页同时显示站点可访问状态与 Cookie 状态，并保留重新建立访问状态入口。

4. **六大类按真实根 fid 定位论坛块**

```text
原创BT电影 fid=2
在线视频区 fid=41
原档收藏   fid=145
色花图片   fid=155
色花文学   fid=154
综合讨论区 fid=95
```

- 在 `.bm / .bm_c` 块中查找包含对应根 fid 的真实块，再提取其 `dt/a` 子板块；
- 某一组解析失败时只回退到该大类自身入口，不伪造其它板块；
- 分类缓存升级为 `sht_forum_groups_v7`，避免 Test6 错误分组缓存污染。

5. **首页 UI 再收敛**
   - 最新/热门/精华改为紧凑三列 `text_3`；
   - 六个一级大类改为两行三列；
   - 当前大类以下继续使用两列子板块；
   - 不把诊断/build 等工程信息塞进首屏。

6. **帖子图片兼容增强**
   - 图片地址按 `zoomfile → file → data-original → data-src → data-echo → data-lazy-src → src` 依次挑选真实地址；
   - 跳过 `none.gif / loading / blank.gif / avatar / smiley` 等占位资源；
   - 相对地址转绝对地址，并补 Cookie + Referer + `#originalSize#`；
   - 清理旧 `src/zoomfile/file/data-*` 属性后只保留一个真实 `src`，避免占位属性重新抢占加载。

7. **磁链按 BTIH 全帖去重**
   - 不再只按完整 magnet 字符串去重，而是优先按 BTIH hash 去重；
   - 同一磁链即使 tracker/query 不同也只保留一个云播动作组；
   - 正文中的 raw magnet 文本/磁链链接移除，仅保留“磁链已识别，云播入口见正文下方”提示；
   - 115 / 迅雷 / PikPak / 复制四个动作保持不变。

8. **楼层编号修正**
   - 只对成功提取到有效 `.t_fsz/.t_f` 正文的楼层递增计数；
   - 第一条有效正文固定为“楼主”，之后连续显示“回复 1 / 回复 2 …”。

9. **在线视频播放入口**
   - 正文内直接发现 `.m3u8/.mp4` 时提供“直接播放”，并使用 `#isVideo=true#` 强制按视频处理；
   - 检测到 `<video>`、`<iframe>`、`视频加载中`、`在线播放`、播放器特征但没有直链时，提供海阔 `video://` 自动嗅探入口；
   - iframe 有实际 src 时优先嗅探 iframe，否则嗅探当前帖子；
   - 嗅探只过滤图片/字体类无关资源，不预先阻断 `.m3u8/.mp4`。

10. **保持不动**
   - 搜索功能本轮不扩大修改面；
   - 登录/验证码/真人验证仍交给官网页面；
   - 不直接 POST 签到或回复；
   - Stable / Latest / 根 `registry.json` 继续不建立，Test7 实机通过后再决定下一步。

### Test7 静态门禁

- `patch_stability_polish.js`：`node --check` 通过；上传后 Git blob SHA 与本地已检查文件一致；
- `bootstrap_test_v7_b10107.js`：`node --check` 通过；上传后 Git blob SHA 与本地已检查文件一致；
- `release.json`：JSON 解析通过；
- Test7 Shell：外层规则 JSON 与内层 `pages` JSON 解析通过；
- Shell 数值 `version=2026092307`，低于 32 位有符号整数上限；
- Bootstrap、Release、Shell 全部明确使用 `asset-core-7f3@main`，没有新增 `hiker-cloud` 正式运行依赖。

### Test7 实机优先验收

1. 覆盖导入 Test7 后首页应直接显示六大类两行布局，切换大类后只刷新当前类子板块；
2. “最新发表 / 最新热门 / 最新精华”三项至少能恢复真实主题列表，标题与缩略图不应退化；
3. 已能正常看到论坛数据时，首页不应继续显示“年龄确认失败”；设置页应分别显示“站点可访问”和“Cookie”；
4. 打开带正文图片的帖子，确认图片不再停留在占位图；
5. 打开带 magnet 的帖子，同一 BTIH 只出现一组 115 / 迅雷 / PikPak / 复制，正文不重复铺 magnet；
6. 打开多回复帖子，确认顺序为楼主 → 回复1 → 回复2；
7. 打开在线视频帖子：有直链时测试“直接播放”；只有网页播放器时测试“嗅探播放”，并重点验证拖动/起播是否正常；
8. 若某一项失败，优先提供对应页面截图和“设置 → 最近诊断”内容，不扩大其它已正常模块的修改面。

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
- 下一阶段优先：Test7 实机闭环 → 修复仍失败的单点模块 → 确认分类/主题列表/正文图片/magnet云播/在线视频播放 → 再处理原生登录状态、签到、回复和 UI 精修。
