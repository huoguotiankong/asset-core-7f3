(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver===2026092233)return "toast://当前已是115 Test 1.2.1-test.13";
if(ver!==2026092232)return "toast://本版基于已验证Test12，请先覆盖到1.2.1-test.12";
var base="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@7e5bebfd58ef0380f60e5a11f822943b5101c6a6/apps/cloud/pan115/modules/";
var center="";
try{center=fetch(base+"offline_center_v1.js");}catch(e2){return "toast://下载离线中心模块失败："+e2.message;}
if(!center||center.indexOf("__PAN115_OFFLINE_CENTER_V1__")<0||center.indexOf("listOfflineTask")<0||center.indexOf("addOfflineTaskURIs")<0)return "toast://离线中心模块校验失败";
function replacePage(path,name,code){var found=false;for(var i=0;i<pages.length;i++){if(pages[i]&&pages[i].path===path){pages[i].name=name;pages[i].rule="js:\n"+code;found=true;break;}}if(!found)pages.push({col_type:"movie_3",name:name,path:path,rule:"js:\n"+code});}
var idx=-1;
for(var i=0;i<pages.length;i++)if(pages[i]&&pages[i].path==="115Offline"){idx=i;break;}
if(idx<0)return "toast://当前115.简缺少115Offline页面，停止覆盖";
var off=String(pages[idx].rule||"");
if(off.indexOf("pan115_safe_")<0||off.indexOf("_115ResolveTargetCid")<0)return "toast://当前115Offline不是已验证安全低频基线，停止覆盖";
var marker="if (!focusMode && myPage === 1) {";
if(off.indexOf(marker)<0)return "toast://未找到离线普通模式入口，停止覆盖";
if(off.indexOf("__PAN115_OFFLINE_CENTER_ENTRY_V1__")<0){
 var entry='\n    /*__PAN115_OFFLINE_CENTER_ENTRY_V1__*/\n    d.push({title:"⬇ 离线下载中心（新版）",desc:"任务状态 / 手动刷新 / 新建离线 / 完成结果 / 任务记录管理",col_type:"text_1",url:"hiker://page/115OfflineCenter?rule=115.简&page=fypage",extra:{lineVisible:false}});';
 off=off.replace(marker,marker+entry);
 pages[idx].rule=off;
}
replacePage("115OfflineCenter","离线下载中心",center);
rule.pages=JSON.stringify(pages);
rule.title="115.简";
rule.author="AI&三鲜汤 · 115.简 Test 1.2.1 离线下载中心";
rule.version=2026092233;
var out="hiker://files/cache/115_12113_offline_center.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
