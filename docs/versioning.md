# 版本规范

## SemVer + Build

业务版本统一使用 `major.minor.patch`，并配一个单调递增的整数 `build`。

示例：

```json
{"version":"1.4.2","build":142}
```

- patch：Bug 修复，不改变主要行为。
- minor：新增兼容功能。
- major：存在架构或行为不兼容变化。
- build：更新比较的唯一机器字段，必须递增。

## 三层版本

1. `shellVersion`：云仓库轻量启动壳。
2. `version/build`：业务代码版本，由 `latest.json` 控制。
3. Remote Module Manager version：公共更新协议。

普通接口/UI/Provider修复只升级业务 version/build；只有 Bootstrap 协议变化才重新上传云仓库启动壳。

## 海阔规则壳数值 version

海阔规则 JSON 中的数值型 `version` 字段按有符号 32 位整数处理，必须满足 `version <= 2147483647`。

统一采用 `YYYYMMDDNN` 的 10 位格式，例如：

```json
{"version":2026082042}
```

其中 `NN` 为当天的两位壳版本序号。业务语义版本仍由 `version/build`（例如 `3.4.2 / 342`）管理，两者不要混用。禁止把三位 build 直接追加到日期后形成 11 位整数，否则会触发 `int value overflow, field: version`。
