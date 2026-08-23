# 汤头条 CHANGELOG

## 0.1.0-test.14 / Build 10114 — 2026-08-23

状态：**Test13 实机后的播放兼容实验版，仍为 Test；禁止晋级 Stable。**

### Test13 实机事实
- 短视频 PWA 列表正常、封面正常，但 `source_origin` MP4 直放仍为 `0 kb/s / 00:00`，说明 Test13 的短视频直放入口并不适配当前海阔播放器。
- 推荐/长视频改用 PWA `/api/MvList/recommend` 后仅显示 3 条，证明该接口适合小规模推荐，不适合作为主长视频大列表。
- 用户再次要求参考上传的 `汤头条2.hk小程序.zip`，验证其中播放写法是否能解决截断/完整播放。
- 参考规则的关键兼容改写已确认：`preview_video` 将 `//...play.` 主机改成 `//long.`，并删除 `seconds=30`。
- 该改写可能改变试看边界，因此正式实现只能在 **App Provider 已确认免费或已购买** 时尝试；收费未解锁内容不得使用该改写绕过官方试看/汤币授权。

### Test14 修改
- **推荐/长视频恢复大列表**：重新使用 App `/api/MvList/featuredAv` 精确模型；推荐和长视频各最多展示 36 条，避免 PWA recommend 只有 3 条。
- **短视频参考规则播放实验**：PWA 继续提供约 20 条短视频列表；点击后先回 App 详情确认 `free/purchased/locked`。仅在免费/已购买状态下优先使用参考规则的 `preview_video → long host → remove seconds=30` 兼容 URL。
- **收费短视频保持边界**：若 App 详情判定 locked，只允许官方 preview 或正常汤币解锁，不执行参考 URL 改写。
- **长视频兼容线路按钮**：免费/已购买详情新增“兼容线路”，用于实机比较参考规则改写与当前 App `source_*` 播放链；locked 详情不显示该完整兼容线路。
- **新增诊断**：`ttt_last_reference_rewrite` 记录原 URL、改写后 URL、access 状态和使用场景；`ttt_last_short_play` 记录短视频实际采用参考改写还是其它回退。
- Test13 的自适应图片链继续保留，不在本轮重新推倒。
- Release / Bootstrap / Shell 派生为不可变 Test14 / Build10114；Shell rule version `2026082315`。

### Test14 实机验收
1. 推荐/长视频应从 3 条恢复为多条列表，目标首屏最多 36 条。
2. 短视频点卡片继续直接播放；若参考规则兼容写法成立，播放器不应再停在 `0 kb/s / 00:00`。
3. 免费或已购买长视频详情测试“兼容线路”，观察是否能得到与标称时长一致的完整播放。
4. 收费未解锁视频仍只测试官方试看，不确认真实汤币消费。
5. 若短视频仍失败，提供 `ttt_last_short_play + ttt_last_reference_rewrite`。
6. 若长视频兼容线路失败，提供 `ttt_last_reference_rewrite + 播放器截图`，继续判断 `long.` CDN 是否需要额外 Header/路径修正。

## 历史版本
- Test11–Test13：[`CHANGELOG_HISTORY_TEST11_TO_TEST13.md`](./CHANGELOG_HISTORY_TEST11_TO_TEST13.md)
- Test8–Test10：[`CHANGELOG_HISTORY_TEST8_TO_TEST10.md`](./CHANGELOG_HISTORY_TEST8_TO_TEST10.md)
- Test7 及以前：[`CHANGELOG_HISTORY_TO_TEST7.md`](./CHANGELOG_HISTORY_TO_TEST7.md)
