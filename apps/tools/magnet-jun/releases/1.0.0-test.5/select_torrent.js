js:
var d = [];
var curl = getParam("curl", "");
var modes = ["海阔视界", "查询云数据", "复制磁链", "115云盘", "迅雷云盘", "PikPak", "光鸭云盘", "123云盘"];

d.push({
    title: "链接",
    url: "hiker://empty",
    extra: { lineVisible: false },
    col_type: "text_center_1"
}, {
    title: "““””" + curl.fontcolor("#FF0000"),
    col_type: "text_1",
    url: "select://" + JSON.stringify({
        title: "请选择打开方式",
        options: modes,
        col: 2,
        js: $.toString(function(ciliUrl){
            if (input === "查询云数据") return "toast://当前已在云数据查询页";
            return $.require("hiker://page/MJSearchCore").routeMagnet(ciliUrl, input);
        }, curl)
    }),
    extra: { lineVisible: false }
});

try {
    var m = fetch("https://whatslink.info/api/v1/link?url=" + encodeURIComponent(curl), {
        headers: { Referer: "https://whatslink.info/" },
        timeout: 10000
    });
    var info = JSON.parse(m);
    d.push({
        title: "名称:" + (info.name || "未知") + "\n大小:" + (info.size || "未知") + "\n数量:" + (info.count || 0),
        col_type: "long_text"
    });
    var shots = info.screenshots || [];
    for (var i = 0; i < shots.length; i++) {
        var u = shots[i].screenshot;
        d.push({ pic_url: u + "#.jpg@Referer=https://whatslink.info/", col_type: "pic_1_full", url: u + "#.jpg@Referer=https://whatslink.info/" });
    }
} catch (e) {
    d.push({ title: "未查询到云端元数据", desc: String(e.message || e), col_type: "text_1", url: "hiker://empty", extra: { lineVisible: false } });
}
setResult(d);
