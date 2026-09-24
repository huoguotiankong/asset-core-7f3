# Incident：海阔小程序跨程序调用页不可假定统一为 `diaoyong`

日期：2026-09-24  
状态：已在色花堂、磁力君.简两次真实故障中确认  
适用：115 / 迅雷 / PikPak / 光鸭 / 123 等海阔云盘小程序跨程序 Magnet/分享链接调用

## 1. 事故现象

两个不同调用方先后出现 PikPak 调用错误：

1. 色花堂把 Magnet 直接交给 Android `pikpakapp://` Deep Link，结果离开海阔并弹系统“打开 PikPak”确认框；
2. 磁力君.简 Test6 虽然坚持调用海阔小程序，但统一假定所有云盘都暴露 `diaoyong` 页面，实机提示：

```text
【PikPak】未发现外部调用页 diaoyong
```

当前 PikPak 活动 Test Shell 实际声明的外部入口为：

```text
path = fxlj
rule = js:$.require('pikpak').handoff();
```

并通过 `realurl` 参数接收完整外部输入。

## 2. 根因

错误架构假设：

```text
“云盘小程序” = 都有统一 diaoyong 页面
```

海阔小程序之间没有自动保证这个页面名或参数名一致。外部调用契约属于目标程序当前 Shell/Runtime 的公开接口，必须按目标程序真实运行版本读取，不允许根据旧样本、其它云盘或历史聊天猜测。

## 3. 固定规则

跨程序调用前必须恢复目标程序当前事实：

```text
目标程序 active Stable/Test
→ 当前 Shell pages
→ 外部调用 page path
→ 参数名与编码方式
→ Runtime 对应 handler
→ 实机验证
```

禁止：

- 看到“PikPak/迅雷/115”就默认 `diaoyong`；
- 用 Android Intent/App Scheme 代替已经存在的海阔小程序调用；
- 目标规则已安装但页面协议不匹配时立即停止候选查找；
- 把 `#magnet`、`kw=magnet`、`realurl=magnet`、`add=magnet` 当作可互换参数。

## 4. 当前已确认调用契约

### 115.简

```text
hiker://page/115Offline?rule=115.简&page=fypage&add=<encodeURIComponent(magnet)>
```

`115Search?kw=` 已实机证明只是普通网盘搜索，不属于 Magnet 离线调用入口。

### PikPak（2026-09-24 当前活动 Test）

```text
hiker://page/fxlj?rule=PikPak&page=fypage&realurl=<encodeURIComponent(magnet)>
```

`fxlj` 对应 `$.require('pikpak').handoff()`；当前 handler 从 `realurl` 解析 Magnet/分享输入。

旧 `diaoyong` 只能作为目标规则**明确存在该页面时**的兼容后备，不能作为默认事实。

## 5. 推荐适配器模式

调用方不要把 URL 散落在页面代码中。建立 CloudAppHandoff Adapter：

```text
provider = 115 / PikPak / 迅雷 / 光鸭 / 123
→ 检测目标规则是否安装
→ 读取目标规则 pages
→ 按已知契约优先级匹配入口
→ 按该入口要求编码参数
→ 返回 hiker://page/... 路由
```

PikPak 示例兼容顺序：

```text
fxlj + realurl
→ 明确存在时再兼容 diaoyong
→ 都不存在则显示协议不兼容提示
```

这样目标云盘小程序以后改入口时，只需修改 Adapter，不需要在搜索页、帖子页、详情页分别打补丁。

## 6. 发布验收

跨程序调用修复不能只做字符串检查，至少验证：

1. 目标小程序已安装；
2. 调用后仍停留在海阔内部，不弹 Android 外部 APP 确认框；
3. 目标页面收到完整 Magnet，包含 `&dn=` 等尾部参数；
4. 目标页面能继续进入其正常文件解析/播放链；
5. 同一调用方的其它云盘分支没有回归。

## 7. 已应用

- 色花堂 Test32：PikPak 从 Android App Scheme 改为 `fxlj + realurl`。
- 磁力君.简 Test7：PikPak 从强制 `diaoyong` 改为优先 `fxlj + realurl`，旧 `diaoyong` 仅作兼容后备。
