# 海阔同级导航反复压栈事故（2026-08-23）

状态：长期硬约束 / 跨程序适用。

## 1. 事故现象

在 JavBus `2.0.0-alpha1` 实机中，分类页、演员页、搜索页顶部的“有码 / 无码 / 欧美”属于**同一功能页面内的状态切换**，但实现却不断返回新的：

```text
hiker://page/<same-functional-page>?type=...
```

用户连续切换几次后，海阔返回栈出现多个几乎相同的页面。想回到进入该功能前的页面，需要连续点很多次返回。

这不是 JavBus 独有问题。项目历史上多个小程序已经重复出现“分类/筛选/Tab 每点一次就打开新页面”的同类体验缺陷，因此从本事故起升级为跨程序禁止项。

## 2. 根因

把两种不同交互错误混为一谈：

### A. 同级状态变化

例如：
- 有码 / 无码 / 欧美
- 最新 / 最热
- 全部 / 收藏
- 分类组切换
- 排序方式
- 是否只看有资源
- 同一个列表的筛选条件

它们的本质是：**当前 Workspace 的状态变了，页面层级没有变。**

### B. 真正层级钻取

例如：
- 列表 → 影片详情
- 演员列表 → 演员详情
- 分类总览 → 某个具体分类结果
- 帖子列表 → 帖子详情

它们才应该进入新的 `hiker://page/...`。

事故代码把 A 当成 B，导致每一次状态变化都向 history stack push 新页面。

## 3. 永久规则

### 同级状态切换：禁止新开同功能页面

默认优先级：

```text
putMyVar / setItem
→ refreshPage(false)
```

如果只需要更新局部区域，优先：

```text
updateItem / addItemAfter / deleteItem / refreshX5WebView
```

具体能力按目标页面和海阔版本选择。

### 只有真正钻取才允许 `hiker://page`

允许：

```text
首页 → 分类总览
分类总览 → 某个分类结果
列表 → 详情
详情 → 演员详情
详情 → 独立磁力页
```

禁止：

```text
分类页 有码 → 分类页 无码 → 分类页 欧美
演员页 有码 → 演员页 无码
搜索结果 最新 → 搜索结果 最热
同页 排序A → 同页 排序B
```

上述禁止场景不得通过反复构造同一个 `hiker://page/<path>` 处理。

## 4. 推荐实现模板

```js
function tab(title, value, stateKey, active) {
    return {
        title: active ? '““””<b>' + title + '</b>' : title,
        url: $('#noLoading#').lazyRule(function (stateKey, value) {
            putMyVar(stateKey, value);
            refreshPage(false);
            return 'hiker://empty';
        }, stateKey, value),
        col_type: 'scroll_button',
        extra: { lineVisible: false }
    };
}
```

页面读取：

```js
var current = getMyVar('app_page_filter', 'all');
```

分页时当前状态必须继续参与数据请求，但**不能因为分页或切换状态新建同级 Workspace**。

## 5. 页面设计验收

任何带 Tab/筛选/排序页面，发布前至少做：

```text
进入页面
→ 连续切换 A/B/C/A/B 5 次
→ 点击系统返回
```

正确结果：**返回一次就回到进入该页面前的上一级。**

如果需要返回 2 次以上才能离开同一个功能页，默认判定为导航栈回归，除非这几次操作确实进入了不同层级详情。

同时检查：
- 同级切换后标题栏没有重复堆叠。
- 页面状态能正确刷新。
- 翻页使用当前筛选状态。
- 从详情返回后仍保留合理的列表状态。
- 不依赖 `#noHistory#` 粗暴掩盖错误页面模型；先修正“状态 vs 层级”的产品定义。

## 6. JavBus 修复记录

### 失败版本
- `2.0.0-alpha1 / Build20001`
- 分类/演员/搜索三分区使用新的 `hiker://page`。
- 实机确认产生多层返回栈。

### 修复版本
- `2.0.0-alpha2 / Build20002`
- `javbus_home_type`
- `javbus_search_type`
- `javbus_genres_type`
- `javbus_actors_type`

以上同级状态全部改为：

```text
putMyVar → refreshPage(false)
```

影片详情、演员详情、具体分类结果、独立磁力页继续保留真正的页面钻取。

## 7. 后续项目硬约束

新开发或重构任何海阔小程序时，只要出现顶部 Tab、筛选栏、排序栏、显示模式选择，设计评审时先回答：

> 这是“当前页状态变化”，还是“进入新的信息层级”？

如果答案是前者，默认不得创建新的同功能页面。

该检查应与“二级页面避免沉浸式标题栏叠加”“UI 必须实机截图复核”一起作为海阔 UI/Navigation 发布前固定检查项。
