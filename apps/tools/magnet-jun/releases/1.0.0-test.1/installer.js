(function(){
var raw=fetch("hiker://home@磁力君.简");
if(!raw||raw==="null") return "toast://未找到原版磁力君.简，请先保留原版";
var rule;
try{rule=JSON.parse(raw);}catch(e){return "toast://读取原版磁力君.简失败："+e.message;}
var pages;
try{pages=typeof rule.pages==="string"?JSON.parse(rule.pages||"[]"):(rule.pages||[]);}catch(e2){return "toast://解析原版页面失败："+e2.message;}
function page(path){for(var i=0;i<pages.length;i++){if(pages[i]&&pages[i].path===path)return pages[i];}return null;}
var dataPage=page("data"),souPage=page("sou"),torrentPage=page("SelectTorrent");
if(!dataPage||!souPage||!torrentPage)return "toast://原版页面结构不匹配，请提供当前磁力君.简规则";

var data=String(dataPage.rule||"");
var fStart=data.indexOf("function getModeUrl(");
var fEnd=data.indexOf("\nfunction getCompleteRule",fStart);
if(fStart<0||fEnd<0)return "toast://未找到原版 getModeUrl，停止覆盖";
var newModeFn=`function getInstalledRule(candidates) {
    for (let i = 0; i < candidates.length; i++) {
        let name = candidates[i];
        try {
            let raw = fetch("hiker://home@" + name);
            if (raw && raw !== "null") return { name: name, raw: raw };
        } catch (e) { }
    }
    return null;
}

function hasRulePage(raw, path) {
    try {
        let obj = JSON.parse(raw);
        let pages = typeof obj.pages === "string" ? JSON.parse(obj.pages || "[]") : (obj.pages || []);
        return pages.some(v => v && v.path === path);
    } catch (e) {
        return false;
    }
}

function callDiaoyong(ciliUrl, candidates, label) {
    let hit = getInstalledRule(candidates);
    if (!hit) return "toast://未检测到【" + label + "】海阔小程序，请先安装";
    if (!hasRulePage(hit.raw, "diaoyong")) {
        return "toast://【" + hit.name + "】未发现外部调用页 diaoyong，请更新对应小程序";
    }
    return "hiker://page/diaoyong?rule=" + hit.name + "&page=fypage#" + ciliUrl;
}

function normalizeMode(openMode) {
    let aliases = {
        "查询元数据": "查询云数据",
        "迅雷下载": "迅雷云盘",
        "PIKPAK": "PikPak",
        "115生活": "115云盘"
    };
    return aliases[openMode] || openMode || "海阔视界";
}

function getModeUrl(ciliUrl, sharePwd, openMode) {
    openMode = normalizeMode(openMode);
    ciliUrl = String(ciliUrl || "").trim();
    if (ciliUrl.startsWith("magnet") || ciliUrl.startsWith("ed2k://")) {
        if (openMode === "海阔视界") {
            return ciliUrl;
        } else if (openMode === "查询云数据") {
            return "hiker://page/SelectTorrent?curl=" + encodeURIComponent(ciliUrl);
        } else if (openMode === "复制磁链") {
            copy(ciliUrl);
            return "toast://复制成功";
        } else if (openMode === "115云盘") {
            let has115 = false;
            try { has115 = fetch("hiker://home@115.简") !== "null"; } catch (e) { }
            if (!has115) return "toast://未检测到【115.简】小程序，请先安装";
            return "hiker://page/115Offline?rule=115.简&page=fypage&add=" + encodeURIComponent(ciliUrl);
        } else if (openMode === "迅雷云盘") {
            return callDiaoyong(ciliUrl, ["迅雷", "迅雷云盘"], "迅雷云盘");
        } else if (openMode === "PikPak") {
            return callDiaoyong(ciliUrl, ["PikPakM", "PikPak", "PIKPAK"], "PikPak");
        } else if (openMode === "光鸭云盘") {
            return callDiaoyong(ciliUrl, ["光鸭云盘", "光鸭"], "光鸭云盘");
        } else if (openMode === "123云盘") {
            return callDiaoyong(ciliUrl, ["123云盘", "123云盘M", "123Pan", "123盘"], "123云盘");
        }
        return ciliUrl;
    } else if (ciliUrl.includes("pan.quark.cn/s/")) {
        let has = fetch("hiker://home@Quark.简") != "null";
        if (has) return "hiker://page/quarkList?rule=Quark.简&realurl=" + encodeURIComponent(ciliUrl) + "&sharePwd=" + (sharePwd || "");
        return ciliUrl;
    } else if (/ali(pan|yundrive)\\.com/.test(ciliUrl)) {
        let has = fetch("hiker://home@云盘君.简") != "null";
        if (has) return "hiker://page/aliyun?rule=云盘君.简&page=fypage&realurl=" + encodeURIComponent(ciliUrl) + "&sharePwd=" + (sharePwd || "");
        return ciliUrl;
    } else if (ciliUrl.startsWith("http")) {
        return "web://" + ciliUrl;
    }
    return ciliUrl;
}
`;
data=data.substring(0,fStart)+newModeFn+data.substring(fEnd);
var exportMark='$.exports.getData = function(page, rule) {';
if(data.indexOf('$.exports.getModeUrl = getModeUrl;')<0){
  if(data.indexOf(exportMark)<0)return "toast://data 导出结构不匹配";
  data=data.replace(exportMark,'$.exports.getModeUrl = getModeUrl;\n\n'+exportMark);
}
dataPage.rule=data;

var sou=String(souPage.rule||"");
var oldOptions='options: ["模式：海阔视界", "模式：查询元数据", "模式：复制磁链", "模式：迅雷下载", "模式：PIKPAK", "模式：115生活", "模式：二驴下载", "模式：新闪存云", "模式：柚子下载", "模式：飞驰下载", "模式：海马下载", "模式：鲨鱼下载", "模式：悟空下载", "模式：浩克下载", "模式：影视播放", "模式：无限云盘", "规则管理", "支持作者"],';
var newOptions='options: ["模式：海阔视界", "模式：查询云数据", "模式：复制磁链", "模式：115云盘", "模式：迅雷云盘", "模式：PikPak", "模式：光鸭云盘", "模式：123云盘", "规则管理", "支持作者"],';
if(sou.indexOf(oldOptions)<0)return "toast://设置菜单基线不匹配，停止覆盖";
sou=sou.replace(oldOptions,newOptions);
sou=sou.replace('if (input == "查询元数据") {','if (input == "查询云数据") {');
var oldInit='let openMode = getItem("openMode", "海阔视界");';
var newInit=`let openMode = getItem("openMode", "海阔视界");
let modeAlias = {"查询元数据":"查询云数据","迅雷下载":"迅雷云盘","PIKPAK":"PikPak","115生活":"115云盘"};
if (modeAlias[openMode]) {
    openMode = modeAlias[openMode];
    setItem("openMode", openMode);
}
let allowedModes = ["海阔视界","查询云数据","复制磁链","115云盘","迅雷云盘","PikPak","光鸭云盘","123云盘"];
if (allowedModes.indexOf(openMode) < 0) {
    openMode = "海阔视界";
    setItem("openMode", openMode);
}`;
if(sou.indexOf(oldInit)<0)return "toast://openMode 基线不匹配，停止覆盖";
sou=sou.replace(oldInit,newInit);
souPage.rule=sou;

var st=String(torrentPage.rule||"");
var oldTorrentOptions='options: ["海阔视界", "复制磁链", "迅雷下载", "PIKPAK", "115生活", "二驴下载", "新闪存云", "柚子下载", "飞驰下载", "海马下载", "鲨鱼下载", "悟空下载", "浩克下载", "无限云盘", "影视播放"],';
var newTorrentOptions='options: ["海阔视界", "查询云数据", "复制磁链", "115云盘", "迅雷云盘", "PikPak", "光鸭云盘", "123云盘"],';
if(st.indexOf(oldTorrentOptions)<0)return "toast://磁力查询菜单基线不匹配，停止覆盖";
st=st.replace(oldTorrentOptions,newTorrentOptions);
var cbStart=st.indexOf('js: $.toString((ciliUrl) => {');
var cbTail='        }, getParam("curl", ""))';
var cbEnd=st.indexOf(cbTail,cbStart);
if(cbStart<0||cbEnd<0)return "toast://磁力查询回调结构不匹配";
cbEnd+=cbTail.length;
var newCallback=`js: $.toString((ciliUrl) => {
            if (input === "查询云数据") return "toast://当前已在云数据查询页";
            try {
                return $.require("data").getModeUrl(ciliUrl, "", input);
            } catch (e) {
                return "toast://调用失败：" + e.message;
            }
        }, getParam("curl", ""))`;
st=st.substring(0,cbStart)+newCallback+st.substring(cbEnd);
torrentPage.rule=st;

rule.title="磁力君.简·测试";
rule.author=String(rule.author||"")+" · 云盘调用精简 Test1";
rule.version=2026092101;
rule.pages=JSON.stringify(pages);
var out="hiker://files/cache/magnetjun_test1_rule.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()