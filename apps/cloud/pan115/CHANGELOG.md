# 115.简 / Pan115 开发记录

状态：**Test only / 待海阔实机验证**  
首次纳入：2026-09-21

## 基线与已确认事实

- 基线来自用户上传的 `115.简.hk小程序.zip`，原规则为单文件 `rule.json`。
- 原实现已经具备：115 Cookie/扫码登录、文件列表、全盘搜索、115 分享、离线任务、`magnet/ed2k/http(s)` 离线添加、个人网盘文件直链解析与播放。
- `addOfflineTaskURIs()` 使用 `https://lixian.115.com/lixianssp/?ac=add_task_urls`，支持 HTTP / ED2K / magnet。
- `listOfflineTask()` 返回的 `file_id` 是离线完成后生成的文件或文件夹 ID；`wp_path_id` 在当前 JS 中映射为 `dirId`。
- 原 `player.resolve()` 已能通过 `pickcode` → `proapi.115.com/app/chrome/downurl` 获取个人网盘直链并带 UA/Header 播放。
- 本轮只增强“外部磁链 → 115 离线 → 定位结果 → 播放/选集”，不改原版 m115 加解密、登录和直链算法。

## 2026-09-21 · Test1 本地完整增强

新增 `115Open`：

```text
magnet / ed2k / HTTP(S)
→ 查已有任务避免重复提交
→ addOfflineTaskURIs
→ 保存/跟踪 info_hash
→ listOfflineTask
→ 完成后优先 task.file_id 精确定位
→ 失败时才从 task.dirId 父目录兜底
→ 单视频播放 / 多视频选集
```

同时修正原“复制调用”把 magnet 传给 `115Search?kw=` 的设计问题，统一目标为 `115Open?url=`。

本地 `rule.json` / `pages` JSON 可解析，首页和页面脚本通过 `node --check`；mock 通过无链接、下载中、单视频完成、多视频完成四种状态。

用户反馈：本地 `.hk小程序.zip` 导入存在问题，因此后续测试主交付改为云口令。

## 2026-09-21 · Test1b 云端轻量增强壳

- 标题：`115.简·测试`。
- version：`2026092102`。
- 目标：保留原版 `115.简`，测试壳仅复用原版登录/协议/播放器并新增磁链链路。
- 远程工件：`apps/cloud/pan115/test/115_enhance_overlay_test1_rule.json`。

用户实机反馈：直接 `home_rule_url` 导入时出现 `规则有误: syntax error, unexpected token error`，因此判定导入/解析兼容失败，未进入 115 业务逻辑。

## 2026-09-21 · Test1c 导入兼容修订

- 工件：`apps/cloud/pan115/test/115_enhance_overlay_test1c_rule.json`。
- version：`2026092103`。
- 页面缩为首页 + `115Open`，高风险写法回退为 `var` / 普通函数 / IIFE。
- 云口令改为官方 `@import=js:`：先下载规则到 `hiker://files/cache/...`，再返回本地 `home_rule_url`。
- 用户实机确认：**Test1c 已能成功导入并打开首页**，说明云口令/本地缓存导入链可用。

### Test1c 新暴露问题

进入“磁链播放”后弹出：

```text
ArticleListModel-HttpRequestError-msg:
java.lang.IllegalArgumentException:
Expected URL scheme 'http' or 'https' but no colon was found
```

根因已定位：Test1c 使用 `$.require('hiker://page/115Api?rule=115.简')` 跨规则加载原版模块；当前海阔将该参数进入 HTTP require/request 路径，要求 `http/https`，因此失败。**跨规则 `hiker://page/...` 不能作为 `$.require()` 的模块源使用。**

另外用户指出 Test1c 首页输入框右侧提示 `粘贴 magnet / ed2k / HTTP下载链接` 过长，挤压输入区，影响体验。

## 2026-09-21 · Test1d 本地页桥接修复

- 工件：`apps/cloud/pan115/test/115_enhance_overlay_test1d_rule.json`。
- version：`2026092104`。
- 保持 Test only，不覆盖 Stable/原版。

### 关键修复：不再跨规则 require hiker URL

Test1d 在自身规则里重新建立本地 `115Api` 页面，但不复制 9 万字协议代码。桥接逻辑改为：

```text
$.require('115Api')
→ Test1d 本地 115Api 页面
→ fetch('hiker://home@115.简') 读取已安装原版规则文本
→ JSON.parse(rule.pages)
→ 精确找到 path === '115Api'
→ eval 原版 115Api 页面代码
→ 原版代码正常写入 $.exports
```

这样首页、离线接口和 `player.resolve` 内部再次执行 `$.require('115Api')` 时，都只命中 Test1d 的**本地页面模块**，不会再把 `hiker://page/...` 当 HTTP URL。

该方案仍以用户当前安装的原版 `115.简` 为协议事实源，不复制/分叉原版 115 加密与直链实现。

### UI 修订

首页和 `115Open` 输入框标题统一缩短为：

```text
粘贴磁链
```

删除 `magnet / ed2k / HTTP下载链接` 的长右侧提示，保留更大的实际输入空间。

### Test1d 静态验证

- 规则 JSON、`pages` JSON 均可正常解析。
- 首页、`115Api` 本地桥、`115Open` 全部通过 `node --check`。
- 待实机验证：桥接 `eval` 能否在目标海阔 JSEngine 中正确让原版 `115Api` 设置 `$.exports`；随后再验证 magnet → 离线 → file_id → player.resolve。

## 当前实机验收顺序

1. 用 Test1d 云口令覆盖 `115.简·测试`。
2. 首页确认输入框右侧只显示短提示“粘贴磁链”。
3. 点击“磁链播放”，不再出现 `Expected URL scheme 'http' or 'https'`。
4. 粘贴一个可秒传 magnet，确认只创建一个 115 离线任务。
5. 完成后确认能按 `file_id` 定位结果并显示视频。
6. 点击视频确认原版 `player.resolve` 仍能取得直链并播放。
7. 单视频链通过后再继续多文件/选集和外部小程序调用验证。
