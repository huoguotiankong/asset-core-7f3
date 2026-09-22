(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver===2026092236)return "toast://当前已是115 Test 1.2.1-test.16";
if(ver!==2026092233&&ver!==2026092234&&ver!==2026092235)return "toast://本版基于Test13-15，请先覆盖到1.2.1-test.13或更高测试版";
var base="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@e438c1b71f2ceebcbc34f1723472a7d10bcbe557/apps/cloud/pan115/modules/";
var offline="",account="",diag="";
try{offline=fetch(base+"offline_center_v3.js");account=fetch(base+"account_center_v1.js");diag=fetch(base+"account_diag_v1.js");}catch(e2){return "toast://下载Test16模块失败："+e2.message;}
if(!offline||offline.indexOf("__PAN115_OFFLINE_CENTER_V3__")<0)return "toast://离线中心V3模块校验失败";
if(!account||account.indexOf("__PAN115_ACCOUNT_CENTER_V1__")<0||account.indexOf("getInfo")<0)return "toast://账户中心模块校验失败";
if(!diag||diag.indexOf("__PAN115_ACCOUNT_DIAG_V1__")<0)return "toast://诊断模块校验失败";
function replacePage(path,name,code){var found=false;for(var i=0;i<pages.length;i++){if(pages[i]&&pages[i].path===path){pages[i].name=name;pages[i].rule="js:\n"+code;found=true;break;}}if(!found)pages.push({col_type:"movie_3",name:name,path:path,rule:"js:\n"+code});}
replacePage("115OfflineCenter","离线中心",offline);
replacePage("115AccountCenter","账号与设置",account);
replacePage("115AccountDiag","诊断与高级设置",diag);
var foundOldAccount=false;
for(var j=0;j<pages.length;j++){
 var p=pages[j]||{};
 if(p.path==="115Account"){
  foundOldAccount=true;
  var ar=String(p.rule||"");
  if(ar.indexOf("__PAN115_ACCOUNT_CENTER_ENTRY_V1__")<0){
   var entry='\n/*__PAN115_ACCOUNT_CENTER_ENTRY_V1__*/\nd.push({title:"👤 账号与设置中心",desc:"容量 / 文件 / 离线 / 诊断",col_type:"text_1",url:"hiker://page/115AccountCenter?rule=115.简&page=fypage",extra:{lineVisible:false}});';
   var re=/((?:let|var)\s+d\s*=\s*\[\]\s*;?)/;
   if(re.test(ar))ar=ar.replace(re,"$1"+entry);
   p.rule=ar;
  }
 }
 if(p.path==="115Offline"){
  var off=String(p.rule||"");
  if(off.indexOf("__PAN115_OFFLINE_CENTER_ENTRY_V1__")>=0){
   off=off.replace('title:"⬇ 离线下载中心（新版）"','title:"⬇ 离线中心"');
   off=off.replace('desc:"任务状态 / 手动刷新 / 新建离线 / 完成结果 / 任务记录管理"','desc:"任务管理"');
   p.rule=off;
  }
 }
}
if(!foundOldAccount)return "toast://当前115缺少原账号页，停止覆盖";
var fr=String(rule.find_rule||"");
var oldHome="hiker://page/115Account?rule=115.简&page=fypage",newHome="hiker://page/115AccountCenter?rule=115.简&page=fypage";
if(fr.indexOf(newHome)<0&&fr.indexOf(oldHome)>=0)fr=fr.replace(oldHome,newHome);
rule.find_rule=fr;
rule.pages=JSON.stringify(pages);
rule.title="115.简";
rule.author="AI&三鲜汤 · 115.简 Test 1.2.1 账号与设置中心";
rule.version=2026092236;
var out="hiker://files/cache/115_12116_account_settings.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
