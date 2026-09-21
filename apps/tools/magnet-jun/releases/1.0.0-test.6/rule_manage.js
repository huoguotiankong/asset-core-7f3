js:
var d = [];
setPageTitle("规则管理");
var cfg = $.require("configs");
var arr = cfg.getJson();
var length = arr.length;

d.push({
    title: "新增",
    url: "hiker://page/ruleEdit#noRecordHistory##noHistory#",
    col_type: "icon_round_small_4",
    pic_url: "hiker://images/icon_domain_config"
});
d.push({
    title: "导入",
    url: $("", "粘贴原版磁力君规则口令、JSON 或 Base64 JSON").input(function(){
        return $.require("import")(input);
    }),
    col_type: "icon_round_small_4",
    pic_url: "hiker://images/icon_download"
});
d.push({
    title: "重置",
    url: $("确定恢复 Test6 内置搜索规则？自定义规则会被清除。").confirm(function(){
        $.require("configs").reset();
        setItem("mj6_provider", "all");
        refreshPage(false);
        return "toast://已恢复默认规则";
    }),
    col_type: "icon_round_small_4",
    pic_url: "hiker://images/icon_refresh"
});
d.push({
    title: "清空",
    url: $("确定删除全部搜索规则？之后可通过重置恢复内置规则。").confirm(function(){
        $.require("configs").saveJson([]);
        setItem("mj6_provider", "all");
        refreshPage(false);
        return "toast://已清空";
    }),
    col_type: "icon_round_small_4",
    pic_url: "hiker://images/icon_code_view"
});

d.push({
    title: '<font color="#13B61B">▐ </font><b>搜索规则</b> (' + String(length).fontcolor("#ff6601") + ')',
    desc: "列表顺序就是聚合搜索优先级；可移动、置顶、禁用或删除。",
    col_type: "rich_text"
});

for (var i = 0; i < arr.length; i++) {
    (function(index){
        var it = arr[index] || {};
        var tags = [];
        if (it.type === "builtin") tags.push("内置");
        if (it.forbidden) tags.push("禁用");
        d.push({
            title: "[" + index + "]  " + it.name + (tags.length ? "  #" + tags.join(" #") : ""),
            desc: it.type === "script" ? (it.basicUrl || "自定义脚本规则") : ("内置 Provider · " + (it.builtin || it.id)),
            url: $(it.type === "script" ? ["编辑","禁用/启用","删除","移动","置顶"] : ["禁用/启用","删除","移动","置顶"], 1, "操作：" + it.name).select(function(index, length){
                var cfg = $.require("configs");
                var rules = cfg.getJson();
                var rule = rules[index];
                if (!rule) return "toast://规则已变化，请刷新";
                if (input === "编辑") return "hiker://page/ruleEdit?index=" + index + "#noRecordHistory##noHistory#";
                if (input === "禁用/启用") {
                    rule.forbidden = !rule.forbidden;
                    rules[index] = rule;
                    cfg.saveJson(rules);
                    setItem("mj6_provider", "all");
                    refreshPage(false);
                    return "toast://已" + (rule.forbidden ? "禁用 " : "启用 ") + rule.name;
                }
                if (input === "删除") {
                    return $("确定删除【" + rule.name + "】？删除后可通过重置恢复内置规则，自定义规则需重新导入。").confirm(function(index){
                        var cfg = $.require("configs");
                        var rules = cfg.getJson();
                        rules.splice(index,1);
                        cfg.saveJson(rules);
                        setItem("mj6_provider", "all");
                        refreshPage(false);
                        return "toast://删除成功";
                    }, index);
                }
                if (input === "移动") {
                    return $(String(index), "输入目标位置 0-" + Math.max(0,length-1)).input(function(index, length){
                        var n = Number(input);
                        if (!isFinite(n) || n < 0 || n >= length) return "toast://位置不合法";
                        n = Math.floor(n);
                        var cfg = $.require("configs");
                        var rules = cfg.getJson();
                        var r = rules.splice(index,1)[0];
                        rules.splice(n,0,r);
                        cfg.saveJson(rules);
                        setItem("mj6_provider", "all");
                        refreshPage(false);
                        return "toast://已移动到 " + n;
                    }, index, length);
                }
                if (input === "置顶") {
                    var r = rules.splice(index,1)[0];
                    rules.unshift(r);
                    cfg.saveJson(rules);
                    setItem("mj6_provider", "all");
                    refreshPage(false);
                    return "toast://已置顶";
                }
                return "hiker://empty";
            }, index, length),
            col_type: "text_1",
            extra: { lineVisible: true }
        });
    })(i);
}
setResult(d);