# Incident：多版本程序详情已更新，但首页“可更新”固定为 0（2026-08-25）

## 症状
- 统一版本目录已经刷新成功，程序详情能看到更高 Test Build。
- 首页统计仍显示 `0 可更新`。
- 更新中心可能同样为空。

## 根因
早期单版本状态逻辑被继续沿用到 `channel-group`：

```text
actualStatus(channel-group) => 版本中心
stats(channel-group) => 只统计 installed 后 continue
updatesPage => 明确排除 entryType === channel-group
```

因此“版本目录正确”和“更新状态正确”是两套不同合同；修好目录刷新不能自动修好首页更新统计。

## 正确模型
1. 多版本程序先判断手机实际安装的是哪一条安装线。
2. Stable / Test / Candidate 属于同一远程覆盖安装线，可相互比较。
3. Local / Web 若为独立命名安装，不得与远程线混为更新关系。
4. 比较优先使用 Build；Build 缺失才使用版本字符串。
5. Stable Build 已高于旧 Test 时不得误报更新；同 Build 的 Stable/Test 标签差异也不得误报。
6. Verified Index 版本待识别时，可使用规则仓自身已记录的 channel 导入历史作为本地补充证据，但不能凭“存在 Test”直接宣称可更新。
7. 首页统计、卡片状态、可更新筛选、更新中心必须统一消费同一个 update-state 结果，禁止各自再写一套过滤条件。

## 本次修复
RC27 / Build417 新增 `channel_update_state_patch.js`，覆盖 `fastItemState / actualStatus / nativeStatusMeta / stats / updatesPage`，并保持 RC26 版本目录刷新链不变。

## 回归门禁
至少构造四类样本：
- Stable Build < Test Build：应更新。
- 已安装最新 Test：不更新。
- Stable Build > 旧 Test：不更新。
- Local 独立版存在，同时 Remote 版本变化：不能把 Local 自身误判成 Remote 更新。

该事故说明：**channel-group 的“版本展示”“安装识别”“更新判断”必须是三个明确层次，但最终更新 UI 必须共享同一个状态模型。**
