function mjParseImport(pass) {
    var text = String(pass || "").trim();
    if (!text) throw new Error("导入内容为空");
    var payload = text;
    var type = "";
    var m = text.match(/\$([^$]+)\$(a|b)(?:@|$)/);
    if (m) { payload = m[1]; type = m[2]; }
    if (type === "b") payload = parsePaste(payload);
    var obj = null;
    try { obj = JSON.parse(payload); } catch (e1) {}
    if (obj === null) {
        try { obj = JSON.parse(base64Decode(payload)); } catch (e2) {}
    }
    if (obj === null) throw new Error("无法识别：请粘贴原版口令、JSON 或 Base64 JSON");
    return Array.isArray(obj) ? obj : [obj];
}

$.exports = function(pass) {
    try {
        var rules = mjParseImport(pass);
        var valid = [];
        for (var i = 0; i < rules.length; i++) {
            var r = rules[i] || {};
            if (!r.name) continue;
            if (!r.builtin && !r.find) continue;
            valid.push(r);
        }
        if (!valid.length) return "toast://没有发现可导入的磁力搜索规则";
        var ret = $.require("configs").mergeImported(valid);
        refreshPage(false);
        return "toast://导入完成：新增 " + ret.added + "，更新 " + ret.updated;
    } catch (e) {
        return "toast://导入失败：" + (e.message || e);
    }
};