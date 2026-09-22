(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver===2026092235)return "toast://当前已是115 Test 1.2.1-test.15";
if(ver!==2026092233&&ver!==2026092234)return "toast://本版基于Test13/14，请先覆盖到1.2.1-test.13或Test14";
var base="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@aed584c2feecaa1f275b608c34919d86f157565e/apps/cloud/pan115/modules/";
var center="";
try{center=fetch(base+"offline_center_v3.js");}catch(e2){return "toast://下载离线中心Phase2模块失败："+e2.message;}
if(!center||center.indexOf("__PAN115_OFFLINE_CENTER_V3__")<0||center.indexOf("leftTime")<0||center.indexOf("completedUrl")<0)return "toast://离线中心V3模块校验失败";
var foundCenter=false,foundOffline=false;
for(var i=0;i<pages.length;i++){
 var p=pages[i]||{};
 if(p.path==="115OfflineCenter"){
   p.name="离线中心";
   p.rule="js:\n"+center;
   foundCenter=true;
 }
 if(p.path==="115Offline"){
   foundOffline=true;
   var off=String(p.rule||"");
   if(off.indexOf("__PAN115_OFFLINE_CENTER_ENTRY_V1__")>=0){
     off=off.replace('title:"⬇ 离线下载中心（新版）"','title:"⬇ 离线中心"');
     off=off.replace('desc:"任务状态 / 手动刷新 / 新建离线 / 完成结果 / 任务记录管理"','desc:"任务管理"');
     p.rule=off;
   }
 }
}
if(!foundCenter||!foundOffline)return "toast://当前115缺少离线中心或原离线页，停止覆盖";
rule.pages=JSON.stringify(pages);
rule.title="115.简";
rule.author="AI&三鲜汤 · 115.简 Test 1.2.1 离线中心Phase2";
rule.version=2026092235;
var out="hiker://files/cache/115_12115_offline_center_phase2.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
