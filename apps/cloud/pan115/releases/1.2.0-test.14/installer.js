(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null") return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver!==2026092214) return "toast://请先使用115 Test13（Build 2026092214）再导入本版";
var base="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@0f05fc037ea8920807e61b981e742c8d009740a9/apps/cloud/pan115/modules/";
var fm="",rb="";
try{fm=fetch(base+"file_manage_v1.js");rb=fetch(base+"recycle_v1.js");}catch(e2){return "toast://下载115文件管理模块失败："+e2.message;}
if(!fm||fm.indexOf("getFiles")<0)return "toast://文件管理模块为空";
if(!rb||rb.indexOf("/rb/revert")<0)return "toast://回收站模块为空";
function upsert(path,name,code){
 var found=false;
 for(var i=0;i<pages.length;i++){
  if(pages[i]&&pages[i].path===path){pages[i].name=name;pages[i].rule="js:\n"+code;found=true;break;}
 }
 if(!found)pages.push({col_type:"movie_3",name:name,path:path,rule:"js:\n"+code});
}
upsert("115FileManage","文件管理",fm);
upsert("115Recycle","回收站",rb);
var fr=String(rule.find_rule||"");
if(fr.indexOf("115FileManage")<0){
 var marker='d.push({title:"👤 账号与设置"';
 var pos=fr.indexOf(marker);
 if(pos<0)return "toast://Test14未定位到首页账号入口，停止覆盖";
 var add='d.push({title:"🗂 文件管理",desc:"",col_type:"text_2",url:"hiker://page/115FileManage?rule=115.简&page=fypage&cid=0&cname="+encodeURIComponent("我的文件")});\n'+
         'd.push({title:"🗑 回收站",desc:"",col_type:"text_2",url:"hiker://page/115Recycle?rule=115.简&page=fypage"});\n';
 fr=fr.slice(0,pos)+add+fr.slice(pos);
}
rule.find_rule=fr;
rule.pages=JSON.stringify(pages);
rule.title="115.简";
rule.author="AI&三鲜汤 · 文件管理 Phase2 Test14";
rule.version=2026092215;
var out="hiker://files/cache/115_12014_filemanage_phase2.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()