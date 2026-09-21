(function(){
var raw=fetch("hiker://home@磁力君.简");
if(!raw||raw==="null") return "toast://未找到原版磁力君.简，请先保留原版";
var rule;
try{rule=JSON.parse(raw);}catch(e){return "toast://读取原版磁力君.简失败："+e.message;}
var pages;
try{pages=typeof rule.pages==="string"?JSON.parse(rule.pages||"[]"):(rule.pages||[]);}catch(e2){return "toast://解析原版页面失败："+e2.message;}
function page(path){for(var i=0;i<pages.length;i++){if(pages[i]&&pages[i].path===path)return pages[i];}return null;}
var dataPage=page("data"),souPage=page("sou"),rulesPage=page("rules"),torrentPage=page("SelectTorrent");
if(!dataPage||!souPage||!rulesPage||!torrentPage)return "toast://原版页面结构不匹配";
var data=String(dataPage.rule||"");
var fStart=data.indexOf("function getModeUrl(");
var fEnd=data.indexOf("\nfunction getCompleteRule",fStart);
if(fStart<0||fEnd<0)return "toast://未找到原版 getModeUrl";
var newModeFn=`function getModeUrl(ciliUrl, sharePwd, openMode) {
    var aliases = {"查询元数据":"查询云数据","迅雷下载":"迅雷云盘","PIKPAK":"PikPak","115生活":"115云盘"};
    openMode = aliases[openMode] || openMode || "海阔视界";
    ciliUrl = String(ciliUrl || "").trim();
    function findInstalled(names) {
        for (var i=0;i<names.length;i++) {
            try {
                var rr=fetch("hiker://home@"+names[i]);
                if (rr && rr!=="null") return names[i];
            } catch(e) {}
        }
        return "";
    }
    function callDiaoyong(names,label) {
        var name=findInstalled(names);
        if(!name) return "toast://未检测到【"+label+"】海阔小程序，请先安装";
        return "hiker://page/diaoyong?rule="+name+"&page=fypage#"+ciliUrl;
    }
    if (ciliUrl.indexOf("magnet")===0 || ciliUrl.indexOf("ed2k://")===0) {
        if (openMode==="海阔视界") return ciliUrl;
        if (openMode==="查询云数据") return "hiker://page/SelectTorrent?curl="+encodeURIComponent(ciliUrl);
        if (openMode==="复制磁链") { copy(ciliUrl); return "toast://复制成功"; }
        if (openMode==="115云盘") {
            var has115=false; try{has115=fetch("hiker://home@115.简")!=="null";}catch(e){}
            if(!has115) return "toast://未检测到【115.简】小程序，请先安装";
            return "hiker://page/115Offline?rule=115.简&page=fypage&add="+encodeURIComponent(ciliUrl);
        }
        if (openMode==="迅雷云盘") return callDiaoyong(["迅雷","迅雷云盘"],"迅雷云盘");
        if (openMode==="PikPak") return callDiaoyong(["PikPakM","PikPak","PIKPAK"],"PikPak");
        if (openMode==="光鸭云盘") return callDiaoyong(["光鸭云盘","光鸭"],"光鸭云盘");
        if (openMode==="123云盘") return callDiaoyong(["123云盘","123云盘M","123Pan","123盘"],"123云盘");
        return ciliUrl;
    }
    if (ciliUrl.indexOf("pan.quark.cn/s/")>=0) {
        try{if(fetch("hiker://home@Quark.简")!=="null") return "hiker://page/quarkList?rule=Quark.简&realurl="+encodeURIComponent(ciliUrl)+"&sharePwd="+(sharePwd||"");}catch(e){}
        return ciliUrl;
    }
    if (/ali(pan|yundrive)\\.com/.test(ciliUrl)) {
        try{if(fetch("hiker://home@云盘君.简")!=="null") return "hiker://page/aliyun?rule=云盘君.简&page=fypage&realurl="+encodeURIComponent(ciliUrl)+"&sharePwd="+(sharePwd||"");}catch(e){}
        return ciliUrl;
    }
    if (ciliUrl.indexOf("http")===0) return "web://"+ciliUrl;
    return ciliUrl;
}
`;
data=data.substring(0,fStart)+newModeFn+data.substring(fEnd);
dataPage.rule=data;
var sou=String(souPage.rule||"");
var oldOptions='options: ["模式：海阔视界", "模式：查询元数据", "模式：复制磁链", "模式：迅雷下载", "模式：PIKPAK", "模式：115生活", "模式：二驴下载", "模式：新闪存云", "模式：柚子下载", "模式：飞驰下载", "模式：海马下载", "模式：鲨鱼下载", "模式：悟空下载", "模式：浩克下载", "模式：影视播放", "模式：无限云盘", "规则管理", "支持作者"],';
var newOptions='options: ["模式：海阔视界", "模式：查询云数据", "模式：复制磁链", "模式：115云盘", "模式：迅雷云盘", "模式：PikPak", "模式：光鸭云盘", "模式：123云盘", "规则管理", "支持作者"],';
if(sou.indexOf(oldOptions)<0)return "toast://设置菜单结构不匹配";
sou=sou.replace(oldOptions,newOptions);
sou=sou.replace('if (input == "查询元数据") {','if (input == "查询云数据") {');
var oldInit='let openMode = getItem("openMode", "海阔视界");';
var newInit=`let openMode = getItem("openMode", "海阔视界");
let modeAlias = {"查询元数据":"查询云数据","迅雷下载":"迅雷云盘","PIKPAK":"PikPak","115生活":"115云盘"};
if (modeAlias[openMode]) { openMode=modeAlias[openMode]; setItem("openMode",openMode); }
let allowedModes=["海阔视界","查询云数据","复制磁链","115云盘","迅雷云盘","PikPak","光鸭云盘","123云盘"];
if(allowedModes.indexOf(openMode)<0){openMode="海阔视界";setItem("openMode",openMode);}`;
if(sou.indexOf(oldInit)<0)return "toast://openMode 结构不匹配";
sou=sou.replace(oldInit,newInit);
var sStart=sou.indexOf("function searchEnd() {");
var sEnd=sou.indexOf("\nfunction setHistory()",sStart);
if(sStart<0||sEnd<0)return "toast://searchEnd 结构不匹配";
var newSearch=`function searchEnd() {
    let p = MY_PAGE;
    let mod = $.require("hiker://page/data");
    let data = mod.getData(p, r != "" ? r : null);
    let realPage = "" == r ? 1 : p;
    let any = false;
    let errors = [];
    for (let i = 0; i < data.length; i++) {
        let rule = data[i];
        try {
            let result = mod.carryRule(rule, s, realPage, searchMode, openMode);
            if (Array.isArray(result) && result.length) {
                any = true;
                for (let j = 0; j < result.length; j++) d.push(result[j]);
            }
        } catch (e) {
            errors.push(rule.name + "：" + e.toString());
            log(rule.name + ":" + e.toString());
        }
    }
    if (!any) {
        d.push({col_type:"text_center_1",url:"hiker://empty",title:"““””" + "~~~什么资源都没有哦~~~".fontcolor("Gray"),extra:{lineVisible:false,id:"_nothave"}});
        if (errors.length) {
            d.push({title:"搜索引擎诊断（"+errors.length+"）",desc:errors.join("\\n\\n"),url:"hiker://empty",col_type:"long_text",extra:{lineVisible:false}});
        }
    }
    setResult(d);
}
`;
sou=sou.substring(0,sStart)+newSearch+sou.substring(sEnd);
souPage.rule=sou;
rulesPage.rule=String(rulesPage.rule||"").replace(/MY_RULE\.title/g,'"磁力君.简"');
rule.preRule="";
var st=String(torrentPage.rule||"");
var oldTorrentOptions='options: ["海阔视界", "复制磁链", "迅雷下载", "PIKPAK", "115生活", "二驴下载", "新闪存云", "柚子下载", "飞驰下载", "海马下载", "鲨鱼下载", "悟空下载", "浩克下载", "无限云盘", "影视播放"],';
var newTorrentOptions='options: ["海阔视界", "查询云数据", "复制磁链", "115云盘", "迅雷云盘", "PikPak", "光鸭云盘", "123云盘"],';
if(st.indexOf(oldTorrentOptions)>=0) st=st.replace(oldTorrentOptions,newTorrentOptions);
var cbStart=st.indexOf('js: $.toString((ciliUrl) => {');
var cbTail='        }, getParam("curl", ""))';
var cbEnd=st.indexOf(cbTail,cbStart);
if(cbStart>=0&&cbEnd>=0){
    cbEnd+=cbTail.length;
    var newCallback=`js: $.toString((ciliUrl) => {
            if (input === "查询云数据") return "toast://当前已在云数据查询页";
            try { return $.require("hiker://page/data").getModeUrl(ciliUrl, "", input); }
            catch(e){ return "toast://调用失败："+e.message; }
        }, getParam("curl", ""))`;
    st=st.substring(0,cbStart)+newCallback+st.substring(cbEnd);
}
if(dataPage.rule.indexOf('$.exports.getModeUrl = getModeUrl;')<0){
    var em='$.exports.carryRule = function(rule, s, page, searchMode, openMode) {';
    dataPage.rule=dataPage.rule.replace(em,'$.exports.getModeUrl = getModeUrl;\n\n'+em);
}
torrentPage.rule=st;
rule.title="磁力君.简·测试";
rule.author=String(rule.author||"")+" · 云盘精简 Test4";
rule.version=2026092104;
rule.pages=JSON.stringify(pages);
var out="hiker://files/cache/magnetjun_test4_rule.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
