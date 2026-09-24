(function(){
var base="";
try{base=fetch("https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/875213a2cef667a17e02838a2095739454fb0ede/apps/tools/magnet-jun/releases/1.0.0-test.6/installer.js");}catch(e){return "toast://下载 Test6 基线失败："+e.message;}
if(!base||base.indexOf("magnetjun_test6_rule.json")<0)return "toast://Test6 基线异常";
try{eval(base);}catch(e2){return "toast://生成 Test6 基线失败："+e2.message;}
var raw=fetch("hiker://files/cache/magnetjun_test6_rule.json");
if(!raw||raw==="null")return "toast://未生成 Test6 规则缓存";
var rule;try{rule=JSON.parse(raw);}catch(e3){return "toast://解析 Test6 规则失败："+e3.message;}
var pages;try{pages=typeof rule.pages==="string"?JSON.parse(rule.pages||"[]"):(rule.pages||[]);}catch(e4){return "toast://解析页面失败："+e4.message;}
function page(path){for(var i=0;i<pages.length;i++){if(pages[i]&&pages[i].path===path)return pages[i];}return null;}
var corePage=page("MJSearchCore");
if(!corePage||!String(corePage.rule||"").match(/mjRouteMagnet/))return "toast://Test6 搜索核心页面异常";
var patch="";
try{patch=fetch("https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/5f53138fe79fb74a3f195ac27ae90aabb5b676e3/apps/tools/magnet-jun/releases/1.0.0-test.7/pikpak_handoff_patch.js");}catch(e5){return "toast://下载 Test7 PikPak 修复模块失败："+e5.message;}
if(!patch||patch.indexOf("mjCallPikPakV7")<0)return "toast://Test7 PikPak 修复模块异常";
corePage.rule=String(corePage.rule||"")+"\n"+patch;
rule.preRule="";
rule.title="磁力君.简·测试";
rule.author=String(rule.author||"").replace(/ · PikPak调用修复 Test7/g,"")+" · PikPak调用修复 Test7";
rule.version=2026092401;
rule.pages=JSON.stringify(pages);
var out="hiker://files/cache/magnetjun_test7_rule.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()