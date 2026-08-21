# ACFun 0.5.0-rc1 Test Changelog

## 通道

- Stable 保持 `0.4.9 / Build 149 / Shell 5.11.3`，正式 `latest.json` 不变。
- Test/Candidate 为 `0.5.0-rc1 / Build 150 / Test Shell 5.12.0`。
- Stable/Test 海阔规则标题都为 `ACFun`，通过同名覆盖切换。
- Test Remote Manager 使用独立应用 ID `acfun-test`，不污染 Stable 的 activeRelease/rollback 状态。

## RC1 UI/UX

- 首页重新建立清晰层级：搜索 → 五大主栏目 → 高频快捷入口 → 当前栏目分类/标签 → 排序 → 内容。
- 五大主栏目固定为：精选 / 漫画 / 动漫 / 视频 / 里番。
- 短视频保留为高频快捷入口，Feed 仍使用 APP 已确认的 `video/list`。
- 精选/里番继续使用 APP `station/stations` 动态小分类，不以截图作为完整分类表。
- 动漫/视频二级分类继续使用 APP `video/classTypeList?type=2/4`。
- 视频/动漫标签改为严格的当前 APK 1.9.7 `video/tags/getTagsZ → video/tagTitleList`；标签必须绑定当前父 `classifyId/videoTypeId`，RC1 不再用旧 Zone/全局 queryVideoByTag 回退填充无关内容。
- 漫画分类继续以 `comics/station/getComicsStations` 返回为准，UI 改成三列竖封面；视频/动漫/精选/里番/短视频使用两列横封面。
- 排序、收藏、历史、设置从分类按钮体系中拆开，避免再次混入分类弹窗。
- 卡片信息降噪，只保留最有用的播放量/时长等信息。

## 保持稳定的底座

- 不重写 0.4.9 已验证的播放链。
- 不重写封面 `_480 + XOR 前100字节 + 本地持久缓存`。
- 不重写漫画 `base/info → chapterInfo` 阅读主链。
- Cache-First 与页面数据缓存继续保留。

## 晋级要求

RC1 只进入 Test/Candidate。需要实机确认首页层级、各主栏目、精选/里番小分类、视频/动漫父分类与标签对应关系、漫画列表/详情/阅读、短视频、播放与页面速度后，才能继续 RC2 或晋级 Stable。
