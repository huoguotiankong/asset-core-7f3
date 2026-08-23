# 海阔 Remote Runtime 固定 module 导出快照事故（2026-08-23）

状态：跨程序长期硬约束。

## 1. 实机事故
Pornhub `0.1.0-test.4 / Build10104` 已在 Shell 新增：

- `pornhubComments → PornhubBoot.module().comments()`
- `pornhubPlaylistDetail → PornhubBoot.module().playlistDetail()`

同时 Test4 `ui_patch.js` 也确实给 `PornhubRemoteRuntime` 增加了 `R.comments` 和 `R.playlistDetail`。

但手机点击评论直接报：

```text
TypeError: 找不到函数 comments。
```

## 2. 根因
基础 Test1 Runtime 的导出不是返回活动 Runtime 本身，而是固定创建一个白名单对象：

```js
R.module=function(){
  return {
    home:R.home,
    detail:R.detail,
    ...
    settings:R.settings
  };
};
```

后续 Patch 覆盖白名单中已有方法时可以生效，因为每次调用 `module()` 会读取新的 `R.detail` 等引用；但后续新增的 `R.comments / R.playlistDetail` 根本不在白名单里，因此 Shell 即使已经声明页面，也永远取不到它们。

这是“源码有函数 + Shell 有页面 ≠ 运行时真正导出了函数”的发布事故。

## 3. 永久规则
Remote Runtime 采用 Patch 扩展页面时，优先使用稳定动态导出：

```js
R.module=function(){ return R; };
```

或者维护显式 Registry，但 Registry 必须由新增页面统一注册，禁止散落维护多个固定白名单。

如果由于安全边界必须使用白名单，则每一个新增页面都必须同时修改唯一导出表，并执行自动一致性检查。

## 4. 发布前 smoke test
只做 `node --check` 不够。任何 Shell/Runtime 新增页面，发布前至少执行：

```text
加载完整 Release
→ var m = Runtime.module()
→ 对 Shell pages 中每个 PornhubBoot.module().xxx() / Runtime.module().xxx() 入口
→ assert typeof m.xxx === 'function'
```

特别关注：
- 评论页
- 片单/收藏页
- 登录子页
- 社区/帖子详情
- 新增 Reader/Player 工具页
- 任何由后置 Patch 新增的方法

## 5. Pornhub Test5 修复
`0.1.0-test.5 / Build10105` 将最终导出覆盖为：

```js
R.module=function(){return R;};
```

本地 smoke 已确认 `comments / categories / searchPage` 均为 function；同时也恢复 Test4 已新增但同样未进入旧白名单的 `playlistDetail`。

## 6. 与其他事故的关系
这类故障与以下问题属于同一发布事实原则：

- Remote state 指向旧 Release。
- lazyRule 点击时重新 eval 老 Core。
- eval 局部符号跨 helper 丢失。
- Shell 元数据已升版但安装 Bootstrap 仍旧。

共同结论：**仓库源码“存在”不能替代真实入口 smoke test；必须验证最终 Shell 实际调用到的活动导出。**
