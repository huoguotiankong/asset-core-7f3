(function(){
var src="";
try{
  src=fetch("https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@662b606c8ecfd87a25da87649d86a167a74beb91/apps/tools/magnet-jun/releases/1.0.0-test.1/installer.js");
}catch(e){return "toast://下载 Test1 基线失败："+e.message;}
if(!src||src.indexOf("magnetjun_test1_rule.json")<0)return "toast://Test1 基线内容异常";
try{eval(src);}catch(e2){return "toast://生成 Test1 基线失败："+e2.message;}
var raw=fetch("hiker://files/cache/magnetjun_test1_rule.json");
if(!raw||raw==="null")return "toast://未生成 Test1 规则缓存";
var rule;
try{rule=JSON.parse(raw);}catch(e3){return "toast://解析 Test1 规则失败："+e3.message;}
var pages;
try{pages=typeof rule.pages==="string"?JSON.parse(rule.pages||"[]"):(rule.pages||[]);}catch(e4){return "toast://解析页面失败："+e4.message;}
function page(path){for(var i=0;i<pages.length;i++){if(pages[i]&&pages[i].path===path)return pages[i];}return null;}
var dataPage=page("data"),souPage=page("sou"),configsPage=page("configs"),rulesPage=page("rules"),torrentPage=page("SelectTorrent");
if(!dataPage||!souPage||!configsPage||!rulesPage||!torrentPage)return "toast://Test1 页面结构不完整";

var data=String(dataPage.rule||"");
var ds=data.indexOf("function getInstalledRule(");
var de=data.indexOf("\nfunction getCompleteRule",ds);
if(ds<0||de<0)return "toast://data 路由结构不匹配";
var selfMode=`function getModeUrl(ciliUrl, sharePwd, openMode) {
    var aliases = {"查询元数据":"查询云数据","迅雷下载":"迅雷云盘","PIKPAK":"PikPak","115生活":"115云盘"};
    openMode = aliases[openMode] || openMode || "海阔视界";
    ciliUrl = String(ciliUrl || "").trim();
    function getInstalledRule(candidates) {
        for (var i = 0; i < candidates.length; i++) {
            var name = candidates[i];
            try {
                var raw = fetch("hiker://home@" + name);
                if (raw && raw !== "null") return {name:name,raw:raw};
            } catch (e) {}
        }
        return null;
    }
    function hasRulePage(raw, path) {
        try {
            var obj = JSON.parse(raw);
            var ps = typeof obj.pages === "string" ? JSON.parse(obj.pages || "[]") : (obj.pages || []);
            for (var i = 0; i < ps.length; i++) if (ps[i] && ps[i].path === path) return true;
        } catch (e) {}
        return false;
    }
    function callDiaoyong(candidates, label) {
        var hit = getInstalledRule(candidates);
        if (!hit) return "toast://未检测到【" + label + "】海阔小程序，请先安装";
        if (!hasRulePage(hit.raw, "diaoyong")) return "toast://【" + hit.name + "】未发现外部调用页 diaoyong";
        return "hiker://page/diaoyong?rule=" + hit.name + "&page=fypage#" + ciliUrl;
    }
    if (ciliUrl.indexOf("magnet") === 0 || ciliUrl.indexOf("ed2k://") === 0) {
        if (openMode === "海阔视界") return ciliUrl;
        if (openMode === "查询云数据") return "hiker://page/SelectTorrent?curl=" + encodeURIComponent(ciliUrl);
        if (openMode === "复制磁链") { copy(ciliUrl); return "toast://复制成功"; }
        if (openMode === "115云盘") {
            var has115 = false;
            try { has115 = fetch("hiker://home@115.简") !== "null"; } catch (e) {}
            if (!has115) return "toast://未检测到【115.简】小程序，请先安装";
            return "hiker://page/115Offline?rule=115.简&page=fypage&add=" + encodeURIComponent(ciliUrl);
        }
        if (openMode === "迅雷云盘") return callDiaoyong(["迅雷","迅雷云盘"],"迅雷云盘");
        if (openMode === "PikPak") return callDiaoyong(["PikPakM","PikPak","PIKPAK"],"PikPak");
        if (openMode === "光鸭云盘") return callDiaoyong(["光鸭云盘","光鸭"],"光鸭云盘");
        if (openMode === "123云盘") return callDiaoyong(["123云盘","123云盘M","123Pan","123盘"],"123云盘");
        return ciliUrl;
    }
    if (ciliUrl.indexOf("pan.quark.cn/s/") >= 0) {
        try { if (fetch("hiker://home@Quark.简") !== "null") return "hiker://page/quarkList?rule=Quark.简&realurl=" + encodeURIComponent(ciliUrl) + "&sharePwd=" + (sharePwd || ""); } catch (e) {}
        return ciliUrl;
    }
    if (/ali(pan|yundrive)\\.com/.test(ciliUrl)) {
        try { if (fetch("hiker://home@云盘君.简") !== "null") return "hiker://page/aliyun?rule=云盘君.简&page=fypage&realurl=" + encodeURIComponent(ciliUrl) + "&sharePwd=" + (sharePwd || ""); } catch (e) {}
        return ciliUrl;
    }
    if (ciliUrl.indexOf("http") === 0) return "web://" + ciliUrl;
    return ciliUrl;
}
`;
data=data.substring(0,ds)+selfMode+data.substring(de);
dataPage.rule=data;

var sou=String(souPage.rule||"");
sou=sou.replace('$.require("data").carryRule(rule, s, realPage, searchMode, openMode)','$.require("hiker://page/data").carryRule(rule, s, realPage, searchMode, openMode)');
souPage.rule=sou;
var st=String(torrentPage.rule||"");
st=st.replace('$.require("data").getModeUrl(ciliUrl, "", input)','$.require("hiker://page/data").getModeUrl(ciliUrl, "", input)');
torrentPage.rule=st;

rulesPage.rule=String(rulesPage.rule||"").replace(/MY_RULE\.title/g,'"磁力君.简"');

var cfg=String(configsPage.rule||"");
var oldPath='const path = "hiker://files/rules/LoyDgIk/ciliSimpleRules.json";';
var newPath=`const path = "hiker://files/rules/LoyDgIk/ciliSimpleRules_magnetjun_test3.json";
const stablePath = "hiker://files/rules/LoyDgIk/ciliSimpleRules.json";
if (!fileExist(path) && fileExist(stablePath)) {
    try { saveFile(path, readFile(stablePath)); } catch (e) {}
}`;
if(cfg.indexOf(oldPath)<0)return "toast://configs 路径结构不匹配";
cfg=cfg.replace(oldPath,newPath);
configsPage.rule=cfg;

rule.preRule="";
rule.title="磁力君.简·测试";
rule.author=String(rule.author||"").replace("云盘调用精简 Test1","云盘调用精简 Test3");
rule.version=2026092103;
rule.pages=JSON.stringify(pages);
var out="hiker://files/cache/magnetjun_test3_rule.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
