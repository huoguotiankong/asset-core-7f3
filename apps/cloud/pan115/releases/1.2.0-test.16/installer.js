(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver!==2026092216)return "toast://请先覆盖到115 Test15（Build 2026092216）再导入本版";
var base="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@36e6b89963356ff7c08920a48b34d7fe9e5f82c9/apps/cloud/pan115/modules/";
var fm="",rb="";
try{fm=fetch(base+"file_manage_v3.js");rb=fetch(base+"recycle_v3.js");}catch(e2){return "toast://下载115文件管理Test16模块失败："+e2.message;}
if(!fm||fm.indexOf("fsDelete")<0||fm.indexOf("open/ufile/delete")<0)return "toast://文件管理V3模块校验失败";
if(!rb||rb.indexOf("永久删除")<0||rb.indexOf("open/rb/del")<0)return "toast://回收站V3模块校验失败";
function replacePage(path,name,code){var found=false;for(var i=0;i<pages.length;i++){if(pages[i]&&pages[i].path===path){pages[i].name=name;pages[i].rule="js:\n"+code;found=true;break;}}if(!found)pages.push({col_type:"movie_3",name:name,path:path,rule:"js:\n"+code});}
replacePage("115FileManage","文件管理",fm);
replacePage("115Recycle","回收站",rb);
rule.pages=JSON.stringify(pages);
rule.title="115.简";
rule.author="AI&三鲜汤 · 文件管理 Phase2 Test16 删除能力补强";
rule.version=2026092217;
var out="hiker://files/cache/115_12016_filemanage_deletefix.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()