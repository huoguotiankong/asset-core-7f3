# 规则仓库 Channel Metadata 热路径白屏事故（2026-09-15）

## 现象

向根 `manifest.json` 新增一个 `entryType=channel-group` 且带 `channelsPath` 的新程序后，用户实机进入“我的规则仓库”出现整页白屏/持续刷新，原有目录无法正常显示。将根 `manifest.json + manifest_meta.json` 回退到新增前 20 项目录后，实机立即恢复正常。

## 已确认实现边界

Stable 3.5.5 的 Single Workspace 在构造首页程序数据时，`hybridProgramData()` 会把 `entryType==='channel-group'` 或存在 `channelsPath` 的项目判定为版本组，并在首页数据构造阶段直接调用 `channelMeta(item)` 读取版本元数据。

因此，新增一个 channel-group 不只是增加一张静态卡片，而是给首页热路径增加一次新的远程 metadata 读取。若新 `channelsPath` 访问慢、失败或触发多镜像串行回退，整个 Workspace 首屏可能长时间无法完成构造，看起来就是白屏/卡刷新。

## 本次恢复与隔离

1. 首先原子回退根 `manifest.json + manifest_meta.json` 到最后已知正常 revision，用户实机确认规则仓库恢复。
2. 小黄书 Test6 Runtime / Bootstrap / Shell 保持不变，不回退业务版本。
3. 再次接入时改为 `entryType=single`，直接指向 Test6 Shell，不提供 `channelsPath`，从而避免首页调用该程序的 `channelMeta()`。
4. 云仓卡片图标暂时使用仓库内已有静态图标，避免额外引入目标站 favicon 网络请求。
5. `apps/video/xchina/channels.json` 继续保留作为程序内部版本元数据；待规则仓库将 channel metadata 改为详情页惰性加载或专项实机验证通过后，再恢复多版本卡。

## 以后固定规则

- 新程序第一次进入根云仓目录时，优先用单版本静态卡做 canary；确认首页、分类、搜索、导入均正常后，再升级为 `channel-group`。
- 不得把新增 `channelsPath` 当成纯展示字段；在当前 Stable 3.5.5 中它属于首页同步热路径依赖。
- 新 channel-group 发布前应验证：metadata 主通道耗时、失败回退耗时、无缓存冷启动、弱网/不可达时首页是否仍能先渲染。
- 规则仓库后续架构优化方向：首页只展示 manifest 中已有的版本摘要；`channelsPath` 在进入详情/版本中心时再惰性读取，并给单个程序 metadata 设置短超时与独立失败态，禁止一个程序阻塞整个目录。

## 状态

- 根目录单版本 canary 已发布，等待实机确认“仓库仍正常 + 小黄书卡片可见/可导入”。
- 在该确认前，不恢复小黄书 channel-group，也不修改规则仓库 Stable 3.5.5 Runtime。
