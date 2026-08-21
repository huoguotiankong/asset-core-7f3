# apps

正式小程序统一放在这里，并按业务类别分类。

推荐结构：

```text
apps/<category>/<app-id>/
├─ manifest.json
├─ bootstrap.js
├─ core/
├─ pages/
├─ providers/
├─ assets/
└─ CHANGELOG.md
```

`app-id` 使用稳定的英文/数字/短横线标识；显示名称写在 `manifest.json`，不要把显示名称当作内部 ID。

当前根目录旧项目暂不移动，后续逐个迁移。
