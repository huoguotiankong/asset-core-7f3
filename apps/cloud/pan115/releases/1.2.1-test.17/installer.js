(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver===2026092237)return "toast://当前已是115 Test 1.2.1-test.17";
if(ver!==2026092236)return "toast://本版基于已验证Test16，请先覆盖到1.2.1-test.16";
var base="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@7d4fdf7824a5e18f3d15003e663eb3e160e1616a/apps/cloud/pan115/modules/";
var fm="",sc="";
try{fm=fetch(base+"file_manage_v9.js");sc=fetch(base+"file_shortcuts_v1.js");}catch(e2){return "toast://下载Test17文件管理模块失败："+e2.message;}
if(!fm||fm.indexOf("__PAN115_FILE_MANAGE_V9__")<0||fm.indexOf("115FMFavoriteDirsV1")<0)return "toast://文件管理V9模块校验失败";
if(!sc||sc.indexOf("__PAN115_FILE_SHORTCUTS_V1__")<0||sc.indexOf("115FMRecentDirsV1")<0)return "toast://常用目录模块校验失败";
function replacePage(path,name,code){var found=false;for(var i=0;i<pages.length;i++){if(pages[i]&&pages[i].path===path){pages[i].name=name;pages[i].rule="js:\n"+code;found=true;break;}}if(!found)pages.push({col_type:"movie_3",name:name,path:path,rule:"js:\n"+code});}
replacePage("115FileManage","文件管理",fm);
replacePage("115FileShortcuts","常用目录",sc);
rule.pages=JSON.stringify(pages);
rule.title="115.简";
rule.author="AI&三鲜汤 · 115.简 Test 1.2.1 文件管理UX Phase3";
rule.version=2026092237;
var out="hiker://files/cache/115_12117_file_manage_phase3.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
