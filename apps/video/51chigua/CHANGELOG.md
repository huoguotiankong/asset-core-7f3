# 51吃瓜 CHANGELOG

## 当前基线

- App ID：`51chigua`
- 当前通道：Test only
- 当前版本：`0.1.0-test.2`
- Build：`10102`
- Shell：`1.0.0-test.2` / rule version `2026082302`
- 正式运行仓库：`huoguotiankong/asset-core-7f3@main`
- 源站入口：`https://51cg1.com/`
- Stable：尚未建立，禁止在未实机验证前晋级。

## 0.1.0-test.2 / Build 10102 — 2026-08-23

### 实机问题

Test1 实机截图确认：

- 首页文章标题可解析，但封面全部缺失。
- 程序使用了项目自制临时 SVG，不是源站图标。
- 点击详情/分类等内部页面直接提示：`找不到“51%E5%90%83%E7%93%9C”这个小程序`。

### 根因与修复

1. **内部路由规则名错误编码**
   - Test1 的 `Cg51Core.page()` 以及搜索输入回调对整个中文规则名执行 `encodeURIComponent`。
   - 当前海阔设备要求 `rule=51吃瓜` 保留原始中文规则名；百分号编码后的字符串会被当成另一个不存在的小程序。
   - Test2 将内部路由统一改为原始规则名，业务参数仍继续 URL 编码。

2. **51CG 图片并非普通静态图片链**
   - 当前列表封面可来自 `loadBannerDirect(...)`、`data-xkrkllgl`、`data-src`、`data-original`、`src`。
   - `/xiao/` 与 `/upload/upload/` 类图片实测属于 AES 加密资源。
   - 已确认协议：AES/CBC/PKCS7，key=`f5d965df75336270`，iv=`97b60394abc2fbe1`。
   - 海阔实现使用 `hiker://assets/crypto-java.js`：`InputStream → AES decrypt → toInputStream()`，不把大图转成规则 KV/Base64 常驻状态。
   - 正文图同时新增 `loadImage(...)` 提取。

3. **源站图标**
   - Test2 Shell/渠道元数据改用 `https://51cg1.com/favicon.ico`，不再使用首版临时 SVG。

4. **分类与媒体**
   - 固定分类补齐到当前已确认的 21 类。
   - 首页过滤“原创招募 / 百万现金扶持 / 往期活动”等非主 Feed 活动卡。
   - 新增 DPlayer `data-config` 中 `video.url` 的结构化 m3u8/mp4 提取；无法静态取得时仍保留 `video://` 兜底。
   - 公共请求加入 `user-choose=true` Cookie，用于源站公开内容确认，不涉及账号登录。

### Test2 静态门禁

- `core_patch.js`：`node --check` 通过。
- `runtime_patch.js`：`node --check` 通过。
- Test1 Release 保持不可变；Test2 仅新增 Patch + 新 Bootstrap + 新 Shell。
- Runtime 继续使用动态 `R.module=function(){return R;}`，新增版本不引入固定导出白名单。

### 待实机确认

1. 首页封面是否已全部恢复，尤其 `/xiao/`、`/upload/upload/` 加密图片。
2. 点击任意文章、分类、收藏、历史、设置是否不再出现百分号编码规则名报错。
3. 源站 favicon 在海阔规则卡/页面是否正常显示。
4. 详情正文图能否正常解密，是否仍混入广告/二维码。
5. DPlayer/HLS 实际播放是否可直接获取；失败时记录 `video://` 兜底表现。
6. 评论是否需要继续定位 AJAX/JS 接口。

## 0.1.0-test.1 / Build 10101 — 2026-08-23

### 产品与页面

首版采用海阔原生 UI，提供首页文章流与分页、官网分类、WordPress 风格搜索、图文详情、视频入口、静态评论、本地收藏、历史、设置与诊断。

### Domain / Request

首版建立独立 Domain Adapter：最后成功域名 → `51cg1.com` → `cg51.com` → `chigua.com` → 当前已知 `51cgo*` → 首页结构验证 → 抽取同族官方域名 → 缓存最后有效 Host。只信任 `51cg*.com / cg51.com / chigua.com` 同族域名。

### Parser

首版按 `/archives/<id>/`、`/category/<slug>/`、`/page/<n>/`、`/?s=<keyword>` 构建结构 Parser；列表以文章永久链接为实体主键。

### Playback

首版路线：`source/video 直链 → JS/JSON m3u8/mp4 → iframe 一层 → 单/多线路 → video://`，不引入第三方解析服务。

### 已知失败结论

- **禁止再把中文规则名整体 `encodeURIComponent` 后放进 `rule=`。**
- **禁止把 51CG `/xiao/`、`/upload/upload/` 图片当普通明文图片直出。**
- 首版临时 SVG 图标不再使用。

## 恢复规则

Test1、Test2 都是不可变 Release。Test2 若仍有图片/播放/UI 问题，继续新建更高 Test build；禁止原地覆盖。Stable 只能从用户实机验证通过的 Test 晋级。
