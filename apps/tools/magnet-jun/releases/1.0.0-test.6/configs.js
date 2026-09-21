var MJ_REG_PATH = "hiker://files/rules/LoyDgIk/magnetjunProviders_v2.json";

function mjHashText(s) {
    s = String(s || "");
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return (h >>> 0).toString(16);
}

function mjDefaults() {
    return [
        { id: "btdig", name: "BTDig", type: "builtin", builtin: "btdig", page: true, forbidden: false },
        { id: "knaben", name: "Knaben", type: "builtin", builtin: "knaben", page: true, forbidden: false },
        { id: "apibay", name: "PirateBay", type: "builtin", builtin: "apibay", page: true, forbidden: false }
    ];
}

function mjNormalize(rule, index) {
    rule = rule || {};
    var out = {};
    for (var k in rule) out[k] = rule[k];
    out.name = String(out.name || (out.builtin || ("规则" + index))).trim();
    if (!out.type) out.type = out.find ? "script" : (out.builtin ? "builtin" : "script");
    if (!out.id) out.id = (out.type === "builtin" && out.builtin) ? String(out.builtin) : ("custom_" + mjHashText(out.name + "|" + (out.find || "") + "|" + index));
    out.page = out.page !== false;
    out.forbidden = !!out.forbidden;
    if (out.type === "script") {
        out.find = String(out.find || "");
        out.findAliUrl = String(out.findAliUrl || "");
        out.basicUrl = String(out.basicUrl || "");
        out.registerUrl = out.registerUrl ? String(out.registerUrl) : undefined;
        out.user = out.user || {};
    }
    return out;
}

function getJson() {
    if (!fileExist(MJ_REG_PATH)) {
        saveFile(MJ_REG_PATH, JSON.stringify(mjDefaults()));
    }
    var arr;
    try { arr = JSON.parse(readFile(MJ_REG_PATH) || "[]"); }
    catch (e) { arr = mjDefaults(); saveFile(MJ_REG_PATH, JSON.stringify(arr)); }
    if (!Array.isArray(arr)) arr = [];
    var changed = false;
    var out = [];
    for (var i = 0; i < arr.length; i++) {
        var n = mjNormalize(arr[i], i);
        out.push(n);
        if (!arr[i].id || !arr[i].type) changed = true;
    }
    if (changed) saveFile(MJ_REG_PATH, JSON.stringify(out));
    return out;
}

function saveJson(arr) {
    arr = Array.isArray(arr) ? arr : [];
    var out = [];
    for (var i = 0; i < arr.length; i++) out.push(mjNormalize(arr[i], i));
    saveFile(MJ_REG_PATH, JSON.stringify(out));
}

function getUsefulJson() { return getJson().filter(function(v){ return !v.forbidden; }); }
function getForbiddenJson() { return getJson().filter(function(v){ return !!v.forbidden; }); }
function reset() { var arr = mjDefaults(); saveJson(arr); return arr; }

function mergeImported(rules) {
    if (!Array.isArray(rules)) rules = [rules];
    var arr = getJson();
    var added = 0, updated = 0;
    for (var i = rules.length - 1; i >= 0; i--) {
        var raw = rules[i] || {};
        if (!raw.name) continue;
        var r = mjNormalize(raw, arr.length + i);
        if (raw.find && !raw.type) r.type = "script";
        var idx = -1;
        for (var j = 0; j < arr.length; j++) {
            if (arr[j].name === r.name || (r.id && arr[j].id === r.id)) { idx = j; break; }
        }
        if (idx >= 0) {
            var base = arr[idx];
            for (var k in r) base[k] = r[k];
            arr[idx] = mjNormalize(base, idx);
            updated++;
        } else {
            arr.unshift(r);
            added++;
        }
    }
    saveJson(arr);
    return { added: added, updated: updated, total: arr.length };
}

$.exports = {
    path: MJ_REG_PATH,
    defaults: mjDefaults,
    getJson: getJson,
    saveJson: saveJson,
    getUsefulJson: getUsefulJson,
    getForbiddenJson: getForbiddenJson,
    reset: reset,
    mergeImported: mergeImported,
    normalize: mjNormalize
};