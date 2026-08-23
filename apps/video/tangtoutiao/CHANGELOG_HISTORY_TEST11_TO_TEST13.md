# 汤头条 Test11–Test13 历史摘要

## Test13 / Build 10113
- PWA `/api/MvList/smallVideoByTag` 已稳定返回约 20 条，短视频封面正常。
- 短视频仍无法播放：`source_origin` MP4 直放在海阔实机出现 0 kb/s；此前短 HLS 还曾被长视频时长完整性规则误判。
- 推荐/长视频切到 PWA `/api/MvList/recommend` 后实机只返回 3 条，证明该接口不适合作为主长视频大列表。
- 图片链升级为明文 → PWA AES-CBC → App legacy AES-CFB 自适应，封面由“全灰”改善为“部分正常”。
- 收费视频继续按 `isfree/is_pay/coins/preview_video` 区分免费、已购、未解锁，禁止自动消费汤币。

## Test12 / Build 10112
- 用户上传 `汤头条2.hk小程序.zip` 作为参考实现。
- 参考规则使用 PWA API `https://dpi4.tbrapi.org/pwa.php/api/...`，请求合同为 `client=pwa + AES-CFB + SHA256→MD5 sign`，`system_version=3.0.1`。
- PWA 短视频使用 `/api/MvList/smallVideoByTag`；搜索使用 `/api/MvSearch/video`。
- 图片使用 `AES/CBC/PKCS5Padding`，key=`f5d965df75336270`，iv=`97b60394abc2fbe1`。
- 参考规则对 `preview_video` 使用 `url.replace(/\/\/.*play\./,'//long.').replace('&seconds=30','')`。该做法可能改变试看边界，因此正式实现不得无条件用于收费未解锁内容。
- 建立 App + PWA 双 Provider：App 保留详情/收费/漫画/授权，PWA 补短视频/搜索/兼容列表。

## Test11 / Build 10111
- APK 详情模型确认 `isfree / coins / is_pay / preview_tip / preview_video`。
- 原 APP 完整解锁接口为 `/api/user/watchingMvByCoins`，参数 `mvId`，响应可返回完整播放 URL；该接口属于真实汤币消费，禁止自动调用。
- 收费未购买内容只提供官方试看和显式二次确认后的解锁；免费/已购继续走正常播放链。
- 图片 ModelLoader 方向确认需要候选 URL、Header 重试、明文判型和 legacy AES-CFB/AES-CBC 解密。

## 更早历史
- Test8–Test10：[`CHANGELOG_HISTORY_TEST8_TO_TEST10.md`](./CHANGELOG_HISTORY_TEST8_TO_TEST10.md)
- Test7 及以前：[`CHANGELOG_HISTORY_TO_TEST7.md`](./CHANGELOG_HISTORY_TO_TEST7.md)
