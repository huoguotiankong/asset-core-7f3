(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null") return "toast://未找到115.简，请先保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
if(Number(rule.version||0)!==2026092210) return "toast://请先升级到115 Test9（Build 2026092210）后再导入本版";

function findPath(exacts, words){
    for(var i=0;i<pages.length;i++){
        var p=pages[i]||{}, path=String(p.path||""), name=String(p.name||"");
        for(var j=0;j<exacts.length;j++) if(path===exacts[j]) return path;
    }
    for(var k=0;k<pages.length;k++){
        var q=pages[k]||{}, hay=(String(q.path||"")+" "+String(q.name||"")).toLowerCase();
        for(var m=0;m<words.length;m++) if(hay.indexOf(String(words[m]).toLowerCase())>=0) return String(q.path||"");
    }
    return "";
}
var P={
    list:findPath(["115List"],["我的文件","文件列表","115list"]),
    search:findPath(["115Search"],["搜索","115search"]),
    share:findPath(["115Share"],["分享","115share"]),
    offline:findPath(["115Offline"],["离线","115offline"]),
    account:findPath(["115Account"],["账号","账户","115account"]),
    recycle:findPath(["115Recycle","115RecycleBin"],["回收站","recycle"]),
    favorite:findPath(["115Favorite","115Favorites","115Star"],["收藏","favorite","star"]),
    history:findPath(["115History"],["历史","history"])
};
if(!P.list||!P.search||!P.offline||!P.account) return "toast://Test10检测到当前115页面结构不完整，停止覆盖";
var pj=JSON.stringify(P);
var home=`js:
(function(){
var d=[];
var P=${pj};
var ruleTitle=String((typeof MY_RULE!=="undefined"&&MY_RULE.title)||"115.简");
function page(path,params){
    if(!path)return "toast://当前版本未提供此功能";
    var u="hiker://page/"+path+"?rule="+encodeURIComponent(ruleTitle)+"&page=fypage";
    if(params)for(var k in params)if(params[k]!==undefined&&params[k]!==null&&String(params[k])!=="")u+="&"+encodeURIComponent(k)+"="+encodeURIComponent(String(params[k]));
    return u;
}
var connected=true;
try{$.require("115Api").newClient();}catch(e){connected=false;}
var hcid="";try{hcid=String(getItem("115HikerVisionCid","")||"");}catch(e2){}
var targetMode="";try{targetMode=String(getItem("115OfflineTargetMode","")||"");}catch(e3){}

d.push({
    title:'<b>☁ 115 网盘</b>'.fontcolor("#2B6CB0"),
    desc:connected?"已连接 · 文件、分享、离线与播放统一入口":"未登录 · 点击账号完成登录",
    col_type:"rich_text",
    url:connected?"hiker://empty":page(P.account),
    extra:{textSize:22,lineVisible:false}
});

d.push({
    title:"搜索文件 / 粘贴115分享链接 / 磁链",
    desc:"自动识别内容并进入对应功能",
    col_type:"input",
    url:$.toString(function(){
        var t=String(input||"").trim();
        if(!t)return "toast://请输入文件名、115分享链接或磁链";
        var r=String((typeof MY_RULE!=="undefined"&&MY_RULE.title)||"115.简");
        if(/^magnet:\\?|^ed2k:\\/\\//i.test(t))return "hiker://page/115Offline?rule="+encodeURIComponent(r)+"&page=fypage&add="+encodeURIComponent(t);
        if(/^https?:\\/\\//i.test(t)){
            if(/(?:^|\\.)115\\.com\\/|115cdn|115\.com\/s\//i.test(t))return "hiker://page/115Share?rule="+encodeURIComponent(r)+"&page=fypage&sc="+encodeURIComponent(t);
            return "hiker://page/115Offline?rule="+encodeURIComponent(r)+"&page=fypage&add="+encodeURIComponent(t);
        }
        return "hiker://page/115Search?rule="+encodeURIComponent(r)+"&page=fypage&kw="+encodeURIComponent(t);
    }),
    extra:{titleVisible:true,lineVisible:false}
});

d.push({title:'<b>快捷访问</b>'.fontcolor("#333333"),desc:"最常用的四个入口",col_type:"rich_text",extra:{textSize:16,lineVisible:false}});
d.push({title:"☁ 我的文件",desc:"浏览全部网盘文件",col_type:"text_2",url:page(P.list,{cid:"0",cname:"我的文件"})});
d.push({title:"📁 海阔视界",desc:hcid?"默认离线保存目录":"首次离线后自动识别",col_type:"text_2",url:hcid?page(P.list,{cid:hcid,cname:"海阔视界"}):"toast://尚未识别海阔视界目录；完成一次离线任务后会自动记录"});
d.push({title:"⚡ 离线下载",desc:"磁链 / ed2k / HTTP",col_type:"text_2",url:page(P.offline)});
d.push({title:"🔗 分享链接",desc:"打开115分享资源",col_type:"text_2",url:P.share?page(P.share):"toast://当前版本未提供分享页"});

d.push({title:'<b>我的内容</b>'.fontcolor("#333333"),desc:"收藏、历史与文件管理",col_type:"rich_text",extra:{textSize:16,lineVisible:false}});
if(P.favorite)d.push({title:"⭐ 收藏",desc:"快速查看收藏内容",col_type:"text_2",url:page(P.favorite)});
if(P.history)d.push({title:"🕘 历史",desc:"最近访问与播放记录",col_type:"text_2",url:page(P.history)});
if(P.recycle)d.push({title:"🗑 回收站",desc:"恢复或清理已删除文件",col_type:"text_2",url:page(P.recycle)});
d.push({title:"👤 账号与设置",desc:connected?"账号已连接":"当前未登录",col_type:"text_2",url:page(P.account)});

d.push({title:'<b>磁链与工具</b>'.fontcolor("#333333"),desc:"面向海阔其它小程序的115能力",col_type:"rich_text",extra:{textSize:16,lineVisible:false}});
d.push({title:"🎬 115磁链播放",desc:"提交磁链后定位文件并直接播放",col_type:"text_1",url:page(P.offline)});
d.push({title:"📋 全部离线任务",desc:"查看任务状态、失败任务与已完成任务",col_type:"text_1",url:page(P.offline)});
d.push({title:"🔧 复制磁链调用",desc:'给 JavDB、磁力君等小程序使用',col_type:"text_1",url:$("复制115磁链调用").lazyRule(function(){return 'copy://"hiker://page/115Offline?rule=115.简&page=fypage&add="+encodeURIComponent(url)';})});

d.push({
    title:"🛡 当前状态",
    desc:(connected?"115已连接":"115未登录")+" · 离线目录："+(hcid?"海阔视界":"自动识别")+" · 安全低频磁链模式",
    col_type:"text_center_1",
    extra:{lineVisible:false}
});
d.push({title:"115.简 · APP化首页 Phase 1 · Build 2026092211",desc:"本阶段只重构首页与入口，不修改115Api、我的文件、登录、分享协议和播放器",col_type:"text_center_1",extra:{lineVisible:false}});
setResult(d);
})();`;

rule.find_rule=home;
rule.title="115.简";
rule.author="AI&三鲜汤 · APP化首页 Phase1 1.2.0-test.10";
rule.version=2026092211;
var out="hiker://files/cache/115_12010_app_home_phase1.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
