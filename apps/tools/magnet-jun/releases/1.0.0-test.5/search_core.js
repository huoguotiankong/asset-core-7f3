function mjSafeJson(text, fallback) {
    try { return JSON.parse(text); } catch (e) { return fallback; }
}

function mjNum(v) {
    var n = Number(v || 0);
    return isFinite(n) ? n : 0;
}

function mjBytes(n) {
    n = mjNum(n);
    if (n <= 0) return "";
    var units = ["B", "KB", "MB", "GB", "TB"];
    var i = 0;
    while (n >= 1024 && i < units.length - 1) { n = n / 1024; i++; }
    var fixed = n >= 100 ? 0 : (n >= 10 ? 1 : 2);
    return n.toFixed(fixed) + " " + units[i];
}

function mjMagnet(hash, title) {
    hash = String(hash || "").trim();
    if (!hash) return "";
    var url = "magnet:?xt=urn:btih:" + hash;
    if (title) url += "&dn=" + encodeURIComponent(String(title));
    return url;
}

function mjHashFromMagnet(url) {
    var m = String(url || "").match(/btih:([A-Za-z0-9]+)/i);
    return m ? String(m[1]).toUpperCase() : "";
}

function mjDate(ts) {
    var n = mjNum(ts);
    if (!n) return "";
    try {
        if (n < 1000000000000) n = n * 1000;
        var d = new Date(n);
        var y = d.getFullYear();
        var m = String(d.getMonth() + 1); if (m.length < 2) m = "0" + m;
        var day = String(d.getDate()); if (day.length < 2) day = "0" + day;
        return y + "-" + m + "-" + day;
    } catch (e) { return ""; }
}

function mjProviders() {
    return [
        { id: "all", name: "聚合" },
        { id: "btdig", name: "BTDig" },
        { id: "knaben", name: "Knaben" },
        { id: "apibay", name: "PirateBay" }
    ];
}

function mjSizeTextToBytes(text) {
    text = String(text || "").replace(/&nbsp;/g, " ").trim();
    var m = text.match(/([0-9.]+)\s*(B|KB|MB|GB|TB)/i);
    if (!m) return 0;
    var n = Number(m[1] || 0);
    var u = String(m[2] || "B").toUpperCase();
    var pow = {B:0,KB:1,MB:2,GB:3,TB:4}[u] || 0;
    return Math.round(n * Math.pow(1024, pow));
}

function mjReqBTDig(keyword, page) {
    return {
        provider: "btdig",
        url: "https://www.btdig.com/search?q=" + encodeURIComponent(String(keyword || "")) + "&p=" + (Math.max(1, page) - 1) + "&order=0",
        options: {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.6"
            },
            timeout: 10000
        }
    };
}

function mjHtmlText(text) {
    return String(text || "")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .trim();
}

function mjParseBTDig(text) {
    text = String(text || "");
    if (!text || text.indexOf("one_result") < 0) {
        if (/captcha|cloudflare|access denied|forbidden/i.test(text)) throw new Error("BTDig 被风控/拦截");
        return [];
    }
    var out = [];
    var re = /<div class="one_result"[\s\S]*?(?=<div class="one_result"|$)/g;
    var m;
    while ((m = re.exec(text)) !== null) {
        var block = m[0];
        var mm = block.match(/<a href="(magnet:\?xt=urn:btih:[^"]+)"/i);
        var nm = block.match(/<div class="torrent_name"[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
        var sm = block.match(/<span class="torrent_size"[^>]*>([\s\S]*?)<\/span>/i);
        if (!mm || !nm) continue;
        var title = mjHtmlText(nm[1]);
        var sizeText = sm ? mjHtmlText(sm[1]) : "";
        var magnet = String(mm[1] || "").replace(/&amp;/g, "&");
        out.push({
            title: title || "未命名资源",
            magnet: magnet,
            hash: mjHashFromMagnet(magnet),
            bytes: mjSizeTextToBytes(sizeText),
            seeders: -1,
            peers: -1,
            date: "",
            category: "",
            source: "BTDig"
        });
    }
    return out;
}

function mjReqKnaben(keyword, page) {
    var size = 40;
    var body = {
        query: String(keyword || ""),
        order_by: "seeders",
        order_direction: "desc",
        from: (Math.max(1, page) - 1) * size,
        size: size,
        hide_unsafe: true,
        hide_xxx: false
    };
    return {
        provider: "knaben",
        url: "https://api.knaben.org/v1",
        options: {
            headers: { "content-type": "application/json" },
            body: body,
            method: "POST",
            timeout: 12000
        }
    };
}

function mjReqApiBay(keyword, page) {
    return {
        provider: "apibay",
        url: "https://apibay.org/q.php?q=" + encodeURIComponent(String(keyword || "")) + "&cat=0",
        options: { timeout: 12000 },
        page: Math.max(1, page)
    };
}

function mjParseKnaben(text) {
    var obj = mjSafeJson(text, null);
    if (!obj || !Array.isArray(obj.hits)) throw new Error("Knaben 返回不是有效 JSON hits");
    var out = [];
    for (var i = 0; i < obj.hits.length; i++) {
        var h = obj.hits[i] || {};
        var magnet = h.magnetUrl || mjMagnet(h.hash, h.title);
        if (!magnet) continue;
        out.push({
            title: String(h.title || "未命名资源"),
            magnet: magnet,
            hash: String(h.hash || mjHashFromMagnet(magnet) || "").toUpperCase(),
            bytes: mjNum(h.bytes),
            seeders: mjNum(h.seeders),
            peers: mjNum(h.peers),
            date: String(h.date || h.lastSeen || ""),
            category: String(h.category || ""),
            source: "Knaben"
        });
    }
    return out;
}

function mjParseApiBay(text, page) {
    var arr = mjSafeJson(text, null);
    if (!Array.isArray(arr)) throw new Error("PirateBay 返回不是 JSON 数组");
    if (arr.length === 1 && String((arr[0] || {}).name || "").indexOf("No results") >= 0) return [];
    var all = [];
    for (var i = 0; i < arr.length; i++) {
        var h = arr[i] || {};
        var hash = String(h.info_hash || "").toUpperCase();
        if (!hash || /^0+$/.test(hash)) continue;
        all.push({
            title: String(h.name || "未命名资源"),
            magnet: mjMagnet(hash, h.name),
            hash: hash,
            bytes: mjNum(h.size),
            seeders: mjNum(h.seeders),
            peers: mjNum(h.leechers),
            date: mjDate(h.added),
            category: String(h.category || ""),
            source: "PirateBay"
        });
    }
    all.sort(function(a, b) { return b.seeders - a.seeders || b.bytes - a.bytes; });
    var size = 25;
    var start = (Math.max(1, page) - 1) * size;
    return all.slice(start, start + size);
}

function mjPreciseMatch(title, keyword) {
    var t = String(title || "").toLowerCase();
    var q = String(keyword || "").toLowerCase().trim();
    if (!q) return true;
    var parts = q.split(/[\s._\-]+/).filter(function(v) { return !!v; });
    if (!parts.length) return t.indexOf(q) >= 0;
    for (var i = 0; i < parts.length; i++) {
        if (t.indexOf(parts[i]) < 0) return false;
    }
    return true;
}

function mjSearch(keyword, page, providerId, precise) {
    keyword = String(keyword || "").trim();
    page = Math.max(1, Number(page || 1));
    providerId = providerId || "all";
    if (!keyword) return { items: [], errors: [] };

    var reqs = [];
    if (providerId === "all" || providerId === "btdig") reqs.push(mjReqBTDig(keyword, page));
    if (providerId === "all" || providerId === "knaben") reqs.push(mjReqKnaben(keyword, page));
    if (providerId === "all" || providerId === "apibay") reqs.push(mjReqApiBay(keyword, page));

    var batch = [];
    for (var i = 0; i < reqs.length; i++) batch.push({ url: reqs[i].url, options: reqs[i].options || {} });
    var raws = [];
    try { raws = batchFetch(batch); } catch (e) { raws = []; }

    var items = [];
    var errors = [];
    for (var j = 0; j < reqs.length; j++) {
        var req = reqs[j];
        var raw = raws && raws.length > j ? raws[j] : "";
        try {
            var part = req.provider === "btdig" ? mjParseBTDig(raw) : (req.provider === "knaben" ? mjParseKnaben(raw) : mjParseApiBay(raw, req.page || page));
            for (var k = 0; k < part.length; k++) items.push(part[k]);
        } catch (e2) {
            errors.push((req.provider === "btdig" ? "BTDig" : (req.provider === "knaben" ? "Knaben" : "PirateBay")) + "：" + e2.message);
        }
    }

    var dedup = {};
    var merged = [];
    for (var x = 0; x < items.length; x++) {
        var it = items[x];
        if (precise && !mjPreciseMatch(it.title, keyword)) continue;
        var key = it.hash || mjHashFromMagnet(it.magnet) || it.magnet;
        key = String(key || "").toUpperCase();
        if (!key || dedup[key]) continue;
        dedup[key] = 1;
        merged.push(it);
    }
    merged.sort(function(a, b) { return b.seeders - a.seeders || b.bytes - a.bytes; });
    return { items: merged, errors: errors };
}

function mjRuleExists(name) {
    try {
        var raw = fetch("hiker://home@" + name);
        return raw && raw !== "null";
    } catch (e) { return false; }
}

function mjHasPage(name, path) {
    try {
        var raw = fetch("hiker://home@" + name);
        var obj = JSON.parse(raw);
        var ps = typeof obj.pages === "string" ? JSON.parse(obj.pages || "[]") : (obj.pages || []);
        for (var i = 0; i < ps.length; i++) if (ps[i] && ps[i].path === path) return true;
    } catch (e) {}
    return false;
}

function mjCallDiaoyong(magnet, candidates, label) {
    for (var i = 0; i < candidates.length; i++) {
        var name = candidates[i];
        if (!mjRuleExists(name)) continue;
        if (!mjHasPage(name, "diaoyong")) return "toast://【" + name + "】未发现外部调用页 diaoyong";
        return "hiker://page/diaoyong?rule=" + name + "&page=fypage#" + magnet;
    }
    return "toast://未检测到【" + label + "】海阔小程序，请先安装";
}

function mjRouteMagnet(magnet, mode) {
    magnet = String(magnet || "").trim();
    mode = mode || "海阔视界";
    if (!magnet) return "toast://磁力链接为空";
    if (mode === "海阔视界") return magnet;
    if (mode === "查询云数据") return "hiker://page/SelectTorrent?curl=" + encodeURIComponent(magnet);
    if (mode === "复制磁链") { copy(magnet); return "toast://复制成功"; }
    if (mode === "115云盘") {
        if (!mjRuleExists("115.简")) return "toast://未检测到【115.简】小程序，请先安装";
        return "hiker://page/115Offline?rule=115.简&page=fypage&add=" + encodeURIComponent(magnet);
    }
    if (mode === "迅雷云盘") return mjCallDiaoyong(magnet, ["迅雷", "迅雷云盘"], "迅雷云盘");
    if (mode === "PikPak") return mjCallDiaoyong(magnet, ["PikPakM", "PikPak", "PIKPAK"], "PikPak");
    if (mode === "光鸭云盘") return mjCallDiaoyong(magnet, ["光鸭云盘", "光鸭"], "光鸭云盘");
    if (mode === "123云盘") return mjCallDiaoyong(magnet, ["123云盘", "123云盘M", "123Pan", "123盘"], "123云盘");
    return magnet;
}

$.exports = {
    providers: mjProviders,
    search: mjSearch,
    routeMagnet: mjRouteMagnet,
    bytes: mjBytes
};
