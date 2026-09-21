js:
// 115OfflineResult Test4：多视频智能选集 + 缓存复用。
let d = [];
let api = $.require("115Api");
let client = api.newClient();

function q(name, dflt) {
    let v = "";
    try { v = String(getParam(name, "") || ""); } catch (e) { v = ""; }
    if (v) { try { v = decodeURIComponent(v); } catch (e2) { } return v; }
    try {
        let mv = (typeof MY_PARAMS !== "undefined" && MY_PARAMS) ? MY_PARAMS[name] : undefined;
        if (mv !== undefined && mv !== null && mv !== "") return String(mv);
    } catch (e3) { }
    return dflt || "";
}
function isNoiseName(name) {
    return /(sample|preview|trailer|teaser|promo|readme|试看|试播|预告|花絮|广告|宣传|二维码|广告片|福利片)/i.test(String(name || ""));
}
function naturalCompare(a, b) {
    let aa = String((a && a.name) || "").toLowerCase().split(/(\d+)/);
    let bb = String((b && b.name) || "").toLowerCase().split(/(\d+)/);
    let n = Math.max(aa.length, bb.length);
    for (let i = 0; i < n; i++) {
        let x = aa[i] === undefined ? "" : aa[i];
        let y = bb[i] === undefined ? "" : bb[i];
        let xn = /^\d+$/.test(x), yn = /^\d+$/.test(y);
        if (xn && yn) {
            let dx = parseInt(x, 10), dy = parseInt(y, 10);
            if (dx !== dy) return dx - dy;
        } else if (x !== y) {
            return x > y ? 1 : -1;
        }
    }
    return 0;
}
function playUrl(f) {
    return $().lazyRule(api.player.resolve, JSON.stringify({
        pc: f.pickCode || "",
        fid: f.fileId || "",
        name: f.name || "",
        kind: "video"
    }));
}

let fid = q("fid", "");
let pid = q("pid", "");
let hash = q("hash", "");
let taskName = q("name", "离线结果");
let videos = [];
let queue = [];
let seen = {};
let scanned = 0;
let fromCache = false;

if (hash) {
    try {
        let s = getItem("115MagnetResult_" + String(hash).toLowerCase(), "");
        let c = s ? JSON.parse(s) : null;
        if (c && c.mode === "multi" && c.videos && c.videos.length) {
            videos = c.videos.map((x) => ({
                fileId: String(x.fileId || ""),
                pickCode: String(x.pickCode || ""),
                name: String(x.name || ""),
                size: Number(x.size || 0),
                isDirectory: false
            }));
            if (!fid) fid = String(c.rootFid || "");
            if (!pid) pid = String(c.rootPid || "");
            if (!taskName && c.taskName) taskName = String(c.taskName);
            fromCache = true;
        }
    } catch (e0) { }
}

function addVideo(f) {
    if (!f || f.isDirectory) return;
    try { if (api.tool.fileKind(f.name) === "video") videos.push(f); } catch (e) { }
}
function queueRoot(id, depth) {
    if (id) queue.push({ id: String(id), depth: depth || 0 });
}

if (!fromCache) {
    if (fid) {
        try {
            let root = client.getFile(String(fid));
            if (root && root.fileId) {
                if (root.isDirectory) queueRoot(root.fileId, 0);
                else addVideo(root);
            } else queueRoot(fid, 0);
        } catch (e) { queueRoot(fid, 0); }
    }
    if (!fid && pid) {
        try {
            let r = client.getFiles(String(pid), { offset: 0, pageSize: 100, order: "file_name", asc: "1", showDir: "1" });
            let a = (r && r.files) || [];
            for (let i = 0; i < a.length; i++) {
                if (String(a[i].name || "") === String(taskName || "")) {
                    if (a[i].isDirectory) queueRoot(a[i].fileId, 0);
                    else addVideo(a[i]);
                    break;
                }
            }
        } catch (e2) { }
    }
    while (queue.length && scanned < 500) {
        let cur = queue.shift();
        if (!cur || seen[cur.id]) continue;
        seen[cur.id] = true;
        let offset = 0, loops = 0;
        while (loops < 10 && scanned < 500) {
            let r;
            try {
                r = client.getFiles(String(cur.id), { offset: offset, pageSize: 50, order: "file_name", asc: "1", showDir: "1" });
            } catch (e3) { break; }
            let a = (r && r.files) || [];
            if (!a.length) break;
            for (let i = 0; i < a.length && scanned < 500; i++) {
                let f = a[i];
                scanned++;
                if (f && f.isDirectory) {
                    if (cur.depth < 3) queueRoot(f.fileId, cur.depth + 1);
                } else addVideo(f);
            }
            offset += 50;
            loops++;
            if (r.count !== undefined && offset >= r.count) break;
        }
    }
}

videos.sort(naturalCompare);
let primary = videos.filter((f) => !isNoiseName(f.name) && Number(f.size || 0) >= 80 * 1024 * 1024);
let extras = [];
if (primary.length) {
    let pids = {};
    primary.forEach((f) => { pids[String(f.fileId || "")] = 1; });
    extras = videos.filter((f) => !pids[String(f.fileId || "")]);
} else {
    primary = videos.slice();
}
primary.sort(naturalCompare);
extras.sort(naturalCompare);

if (hash && primary.length > 1 && !fromCache) {
    try {
        setItem("115MagnetResult_" + String(hash).toLowerCase(), JSON.stringify({
            mode: "multi",
            rootFid: String(fid || ""),
            rootPid: String(pid || ""),
            taskName: String(taskName || ""),
            videos: primary.slice(0, 80).map((f) => ({
                fileId: String(f.fileId || ""),
                pickCode: String(f.pickCode || ""),
                name: String(f.name || ""),
                size: Number(f.size || 0)
            })),
            updated: Date.now()
        }));
    } catch (e4) { }
}

d.push({
    title: '<b>🎞 ' + taskName + '</b>'.fontcolor("#2B6CB0"),
    desc: "识别到 " + videos.length + " 个视频" + (fromCache ? " · 已使用缓存" : ""),
    col_type: "text_1"
});

if (!videos.length) {
    d.push({
        title: "没有识别到视频 · 点击打开结果目录",
        col_type: "text_center_1",
        url: "hiker://page/115List?rule=" + MY_RULE.title + "&page=fypage&cid=" +
            encodeURIComponent(fid || pid || "0") + "&cname=" + encodeURIComponent(taskName)
    });
} else {
    if (primary.length > 1) {
        d.push({ title: "主视频 / 选集", col_type: "rich_text", extra: { lineVisible: false } });
    }
    primary.forEach((f) => {
        d.push({
            title: "▶ " + f.name,
            desc: api.tool.formatSize(f.size),
            col_type: "text_1",
            url: playUrl(f)
        });
    });
    if (extras.length) {
        d.push({ title: "其它小视频 / 附带内容", col_type: "rich_text", extra: { lineVisible: false } });
        extras.forEach((f) => {
            d.push({
                title: "▷ " + f.name,
                desc: api.tool.formatSize(f.size),
                col_type: "text_1",
                url: playUrl(f)
            });
        });
    }
    d.push({
        title: "📂 打开结果目录",
        col_type: "text_center_1",
        url: "hiker://page/115List?rule=" + MY_RULE.title + "&page=fypage&cid=" +
            encodeURIComponent(fid || pid || "0") + "&cname=" + encodeURIComponent(taskName)
    });
}
setResult(d);
