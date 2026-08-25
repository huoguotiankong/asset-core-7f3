# Incident：规则仓测试版可变目录被长生命周期内存快照遮蔽

日期：2026-08-25
程序：我的规则仓库·测试版
影响版本：RC33 / Build423
修复版本：RC34 / Build424

## 1. 实机症状

同一时刻：

- 正式版规则仓已经显示 JavDB v3 新测试版 `3.9.44-test.1`。
- 测试版规则仓仍显示旧测试版 `3.9.42-test.5`。
- 云端 `channel_catalog_snapshot.json` 已经更新，因此不是发布端未生成新目录。
- ACFun 连续升级后测试仓仍可能导入旧 Shell，导致对 Test50001/50002 的失败判断被旧目录污染。

## 2. 根因

RC33 Control Plane 会正确下载并写入新的本地 `channel_catalog_v2.json`，但 Runtime 的 `flat_final_patch.js` 使用：

```text
var _catalog = null;
catalog() {
  if (_catalog) return _catalog;
  _catalog = read local file once;
  return _catalog;
}
```

版本目录属于可变控制面。文件刷新后，当前长生命周期 Runtime 仍返回旧 `_catalog`，因此 `refreshPage(false)` 并不能让版本详情读到新目录。

这类错误本质是：**把 mutable control-plane 当成 immutable runtime asset 缓存。**

## 3. 修复

RC34：

- 新本地目录文件：`channel_catalog_v3.json`。
- `channelMeta / fastChannelCache / loadChannelMetaLive` 每次从当前本地文件读取，不再持有 `_catalog`。
- “检查版本 / 同步程序目录”仍由用户主动触发联网；正常启动不主动访问 GitHub。
- Control 先读取 GitHub `main` HEAD，再按 immutable SHA 下载控制面。
- 更新后当前页立即重新读取本地 revision。
- `flat_entry_v2.js / flat_control_v2.js` 会覆盖旧 v1 本地别名，降低旧页面模块缓存重入 RC33 的概率。

## 4. 通用规则

以下数据默认视为 mutable control-plane，不得用不会失效的进程级内存快照遮蔽最新本地文件：

- 版本目录 / channels。
- domains / API host table。
- Provider 配置与线路表。
- feature flags。
- parser route table。
- 远程镜像列表。
- 任何能改变程序版本选择或执行路径的配置。

推荐模型：

```text
普通启动
→ 读取本地 last-known-good 文件

用户主动检查/同步
→ 获取远程最新控制面
→ schema/build/revision 校验
→ 原子写本地文件
→ 当前页面重新读取本地文件
```

可做短生命周期函数内 memo，但刷新完成后必须显式失效；不得使用跨页面/跨刷新仍常驻的 `_catalog` 一类缓存。

## 5. 发布与测试约束

版本目录修复必须用新 Test build，不原地覆盖旧 Runtime。

实机至少验证：

1. 旧 Test 发现新规则仓 Test。
2. 更新后在同一进程内刷新某个程序目录，当前页立即显示新 Test。
3. 退出重进后 revision 不回退。
4. 正常启动断 GitHub 后仍可读取最后成功目录。
5. 下一个新程序 Test 发布后再次验证，避免只对单一 snapshot 偶然通过。
