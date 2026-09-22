(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null") return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver!==2026092210&&ver!==2026092211) return "toast://当前115版本不是Test9/Test10基线，停止覆盖";
function findPath(exacts,words){
 for(var i=0;i<pages.length;i++){var p=pages[i]||{},path=String(p.path||"");for(var j=0;j<exacts.length;j++)if(path===exacts[j])return path;}
 for(var k=0;k<pages.length;k++){var q=pages[k]||{},hay=(String(q.path||"")+" "+String(q.name||"")).toLowerCase();for(var m=0;m<words.length;m++)if(hay.indexOf(String(words[m]).toLowerCase())>=0)return String(q.path||"");}
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
if(!P.list||!P.search||!P.offline||!P.account)return "toast://当前115页面结构不完整，停止覆盖";
var home="js:\n(function(){\nvar d=[];\nvar P=__P__;\nvar ruleTitle=\"115.简\";\nfunction page(path,params){\n    if(!path){return \"toast://当前版本未提供此功能\";}\n    var u=\"hiker://page/\"+path+\"?rule=\"+encodeURIComponent(ruleTitle)+\"&page=fypage\";\n    if(params){\n        for(var k in params){\n            if(params[k]!==undefined&&params[k]!==null&&String(params[k])!==\"\"){\n                u+=\"&\"+encodeURIComponent(k)+\"=\"+encodeURIComponent(String(params[k]));\n            }\n        }\n    }\n    return u;\n}\nvar connected=true;\ntry{var api=$.require(\"115Api\");api.newClient();}catch(e){connected=false;}\nvar hcid=\"\";\ntry{hcid=String(getItem(\"115HikerVisionCid\",\"\")||\"\");}catch(e2){hcid=\"\";}\n\nd.push({title:\"☁ 115 网盘\",desc:connected?\"已连接 · 文件、分享、离线与播放统一入口\":\"未登录 · 点击进入账号登录\",col_type:\"text_1\",url:connected?\"hiker://empty\":page(P.account),extra:{lineVisible:false}});\nd.push({title:\"搜索文件 / 粘贴115分享 / 磁链\",desc:\"自动识别后进入对应功能\",col_type:\"input\",url:$.toString(function(){\n    var t=String(input||\"\").trim();\n    if(!t){return \"toast://请输入文件名、115分享链接或磁链\";}\n    var s=t.toLowerCase();\n    var r=\"115.简\";\n    if(s.indexOf(\"magnet:\")===0||s.indexOf(\"ed2k://\")===0){return \"hiker://page/115Offline?rule=\"+encodeURIComponent(r)+\"&page=fypage&add=\"+encodeURIComponent(t);}\n    if(s.indexOf(\"http://\")===0||s.indexOf(\"https://\")===0){\n        if(s.indexOf(\"115.com/\")>=0||s.indexOf(\"115cdn\")>=0){return \"hiker://page/115Share?rule=\"+encodeURIComponent(r)+\"&page=fypage&sc=\"+encodeURIComponent(t);}\n        return \"hiker://page/115Offline?rule=\"+encodeURIComponent(r)+\"&page=fypage&add=\"+encodeURIComponent(t);\n    }\n    return \"hiker://page/115Search?rule=\"+encodeURIComponent(r)+\"&page=fypage&kw=\"+encodeURIComponent(t);\n}),extra:{titleVisible:true,lineVisible:false}});\n\nd.push({title:\"快捷访问\",desc:\"常用功能\",col_type:\"text_center_1\",extra:{lineVisible:false}});\nd.push({title:\"☁ 我的文件\",desc:\"全部文件\",col_type:\"text_2\",url:page(P.list,{cid:\"0\",cname:\"我的文件\"})});\nd.push({title:\"📁 海阔视界\",desc:hcid?\"默认离线目录\":\"等待首次识别\",col_type:\"text_2\",url:hcid?page(P.list,{cid:hcid,cname:\"海阔视界\"}):\"toast://尚未识别海阔视界目录\"});\nd.push({title:\"⚡ 离线下载\",desc:\"磁链 / ed2k / HTTP\",col_type:\"text_2\",url:page(P.offline)});\nd.push({title:\"🔗 分享链接\",desc:\"115分享资源\",col_type:\"text_2\",url:page(P.share)});\n\nd.push({title:\"我的内容\",desc:\"账号与文件管理\",col_type:\"text_center_1\",extra:{lineVisible:false}});\nif(P.favorite){d.push({title:\"⭐ 收藏\",desc:\"收藏内容\",col_type:\"text_2\",url:page(P.favorite)});}\nif(P.history){d.push({title:\"🕘 历史\",desc:\"最近访问\",col_type:\"text_2\",url:page(P.history)});}\nif(P.recycle){d.push({title:\"🗑 回收站\",desc:\"已删除文件\",col_type:\"text_2\",url:page(P.recycle)});}\nd.push({title:\"👤 账号与设置\",desc:connected?\"账号已连接\":\"需要登录\",col_type:\"text_2\",url:page(P.account)});\n\nd.push({title:\"磁链与工具\",desc:\"给其它海阔小程序调用\",col_type:\"text_center_1\",extra:{lineVisible:false}});\nd.push({title:\"🎬 115磁链播放\",desc:\"离线后定位视频并播放\",col_type:\"text_1\",url:page(P.offline)});\nd.push({title:\"📋 全部离线任务\",desc:\"查看下载状态\",col_type:\"text_1\",url:page(P.offline)});\nd.push({title:\"🔧 复制磁链调用\",desc:\"JavDB / 磁力君可直接调用\",col_type:\"text_1\",url:$(\"复制115调用\").lazyRule(function(){return 'copy://\"hiker://page/115Offline?rule=115.简&page=fypage&add=\"+encodeURIComponent(url)';})});\n\nd.push({title:\"当前状态\",desc:(connected?\"115已连接\":\"115未登录\")+\" · 离线目录：\"+(hcid?\"海阔视界\":\"自动识别\")+\" · 安全低频模式\",col_type:\"text_center_1\",extra:{lineVisible:false}});\nd.push({title:\"115.简 · APP化首页 Phase 1 · Build 2026092212\",desc:\"仅重构首页，不修改115Api、我的文件、登录和播放器\",col_type:\"text_center_1\",extra:{lineVisible:false}});\nsetResult(d);\n})();\n";
home=home.replace("__P__",JSON.stringify(P));
rule.find_rule=home;
rule.title="115.简";
rule.author="AI&三鲜汤 · APP化首页 Phase1 Test11";
rule.version=2026092212;
var out="hiker://files/cache/115_12011_app_home_hotfix.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
