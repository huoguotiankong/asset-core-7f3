(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver===2026092220)return "toast://当前已是115.简 Stable 1.2.0";
if(ver===2026092218){
 var base="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@d54bc67b0c3b65978b268d694967292a177b9179/apps/cloud/pan115/modules/";
 var fm="",rb="";
 try{fm=fetch(base+"file_manage_v5.js");rb=fetch(base+"recycle_v4.js");}catch(e2){return "toast://下载115 Stable 1.2.0模块失败："+e2.message;}
 if(!fm||fm.indexOf("__hiker_transport_probe__")<0||fm.indexOf("revertRecycleBin")<0||fm.indexOf("/rb/delete")<0)return "toast://文件管理Stable模块校验失败";
 if(!rb||rb.indexOf("cleanRecycleBin")<0||rb.indexOf("115安全密码")<0)return "toast://回收站Stable模块校验失败";
 function replacePage(path,name,code){var found=false;for(var i=0;i<pages.length;i++){if(pages[i]&&pages[i].path===path){pages[i].name=name;pages[i].rule="js:\n"+code;found=true;break;}}if(!found)pages.push({col_type:"movie_3",name:name,path:path,rule:"js:\n"+code});}
 replacePage("115FileManage","文件管理",fm);
 replacePage("115Recycle","回收站",rb);
}else if(ver!==2026092219){
 return "toast://Stable 1.2.0 为 Test18 原样晋级，请先覆盖到115 Test18（Build 2026092219）";
}
rule.pages=JSON.stringify(pages);
rule.title="115.简";
rule.author="AI&三鲜汤 · 115.简 Stable 1.2.0";
rule.version=2026092220;
var out="hiker://files/cache/115_stable_120_rule.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
