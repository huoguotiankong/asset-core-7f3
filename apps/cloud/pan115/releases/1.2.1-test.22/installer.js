(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver===2026092242)return "toast://当前已是115 Test 1.2.1-test.22";
if(ver!==2026092241)return "toast://本版基于Test21，请先覆盖到1.2.1-test.21";
var base="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@f780240505285e91e54d800d0b29bebb40e4b701/apps/cloud/pan115/modules/";
var offline="",picker="",account="";
try{
 offline=fetch(base+"offline_center_v4.js");
 picker=fetch(base+"offline_target_picker_v1.js");
 account=fetch(base+"account_center_v2.js");
}catch(e2){return "toast://下载Test22模块失败："+e2.message;}
if(!offline||offline.indexOf("__PAN115_OFFLINE_CENTER_V4__")<0)return "toast://离线中心V4校验失败";
if(!picker||picker.indexOf("__PAN115_OFFLINE_TARGET_PICKER_V1__")<0)return "toast://离线目录选择器校验失败";
if(!account||account.indexOf("__PAN115_ACCOUNT_CENTER_V2__")<0)return "toast://账号中心V2校验失败";
try{new Function(offline);new Function(picker);new Function(account);}catch(parseErr){return "toast://Test22语法门禁失败："+String(parseErr.message||parseErr);}
function replacePage(path,name,code){var found=false;for(var i=0;i<pages.length;i++){if(pages[i]&&pages[i].path===path){pages[i].name=name;pages[i].rule="js:\n"+code;found=true;break;}}if(!found)pages.push({col_type:"movie_3",name:name,path:path,rule:"js:\n"+code});}
replacePage("115OfflineCenter","离线中心",offline);
replacePage("115OfflineTargetPicker","离线保存目录",picker);
replacePage("115AccountCenter","账号与设置",account);
rule.pages=JSON.stringify(pages);
rule.title="115.简";
rule.author="AI&三鲜汤 · 115.简 Test 1.2.1 离线目录与任务中心";
rule.version=2026092242;
var out="hiker://files/cache/115_12122_offline_target_phase3.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
