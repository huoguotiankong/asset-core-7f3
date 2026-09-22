(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver!==2026092218)return "toast://请先覆盖到115 Test17（Build 2026092218）再导入本版";
var base="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@d54bc67b0c3b65978b268d694967292a177b9179/apps/cloud/pan115/modules/";
var fm="",rb="";
try{fm=fetch(base+"file_manage_v5.js");rb=fetch(base+"recycle_v4.js");}catch(e2){return "toast://下载115文件管理Test18模块失败："+e2.message;}
if(!fm||fm.indexOf("__hiker_transport_probe__")<0||fm.indexOf("revertRecycleBin")<0||fm.indexOf("/rb/delete")<0)return "toast://文件管理V5模块校验失败";
if(!rb||rb.indexOf("cleanRecycleBin")<0||rb.indexOf("115安全密码")<0)return "toast://回收站V4模块校验失败";
function replacePage(path,name,code){var found=false;for(var i=0;i<pages.length;i++){if(pages[i]&&pages[i].path===path){pages[i].name=name;pages[i].rule="js:\n"+code;found=true;break;}}if(!found)pages.push({col_type:"movie_3",name:name,path:path,rule:"js:\n"+code});}
replacePage("115FileManage","文件管理",fm);
replacePage("115Recycle","回收站",rb);
rule.pages=JSON.stringify(pages);
rule.title="115.简";
rule.author="AI&三鲜汤 · 文件管理 Phase2 Test18 认证传输复用";
rule.version=2026092219;
var out="hiker://files/cache/115_12018_filemanage_delete_transport_fix.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()