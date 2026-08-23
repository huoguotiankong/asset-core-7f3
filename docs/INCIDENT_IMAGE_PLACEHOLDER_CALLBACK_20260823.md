# 海阔图片占位回调事故：`$().image()` 不等于卡片最终图片交付

日期：2026-08-23

## 事故背景
汤头条 Test15 为解决 App/PWA 多候选封面与图片 Header/解密差异，将原先已在设备上出现过正常封面的：

```text
真实图片 URL @js=字节解密/转换
```

改造成：

```text
1×1 本地 placeholder
→ $().image(callback)
→ callback 内自行 fetch 候选图片
→ 返回 ByteArrayInputStream
```

代码层面自取流、明文/AES-CBC/legacy-CFB 判型均完整，但设备实机结果是：推荐、长视频、短视频等所有封面全部只显示灰色占位区域。

同一 Test15 中播放链全部恢复，说明这不是全局网络/运行时失效；故障集中在图片组件的最终交付方式。

## 实机结论
- `$().image()` 能构造出规则字符串，不代表 `movie_2 / pic_1_card / movie_1_vertical_pic_blur` 等卡片一定会在当前海阔版本中把 placeholder 替换成 callback 返回流。
- 对已经验证有效的图片解密链，优先继续使用：

```text
真实远程图片 URL + `@js=` 字节转换
```

- 多候选问题应优先在“选哪一个真实 URL”阶段解决，而不是为了候选重试把整个图片交付模型改成 placeholder 自取流。
- 图片运行时能力必须看海阔实机截图；仅凭 JS 可执行、fetch 可返回字节、解密算法正确不能判定图片链完成。

## 汤头条恢复策略
Test16：
- 播放核心冻结 Test15，不做任何播放重构。
- 保留 Test15 的 `thumb_cover_str` 优先选图策略。
- 最终图片交付回退到 Test13 已验证的 `真实URL@js=` 内联转换。
- 内联转换继续按 plain → AES-CBC(PWA) → legacy AES-CFB(App) 自动判型。

## 通用禁用做法
当某种卡片组件已经通过 `URL@js=` 正常显示远程加密图片时，不要仅为了“更灵活”就切成 placeholder `$().image()` 自取流，除非目标海阔版本和目标卡片类型已经实机验证回调替换行为稳定。
