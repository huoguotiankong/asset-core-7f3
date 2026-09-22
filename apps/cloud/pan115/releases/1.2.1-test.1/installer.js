(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver!==2026092219&&ver!==2026092220)return "toast://请先覆盖到115 Test18或Stable 1.2.0再导入本版";
var base="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@976eb266c5bb55bba43b6676eb379cf50655ae0c/apps/cloud/pan115/modules/";
var rb="";
try{rb=fetch(base+"recycle_v5.js");}catch(e2){return "toast://下载115回收站Test模块失败："+e2.message;}
if(!rb||rb.indexOf("清空回收站")<0||rb.indexOf("cleanRecycleBin")<0||rb.indexOf("115安全密码")<0)return "toast://回收站V5模块校验失败";
var found=false;
for(var i=0;i<pages.length;i++){
 if(pages[i]&&pages[i].path==="115Recycle"){pages[i].name="回收站";pages[i].rule="js:\n"+rb;found=true;break;}
}
if(!found)pages.push({col_type:"movie_3",name:"回收站",path:"115Recycle",rule:"js:\n"+rb});
rule.pages=JSON.stringify(pages);
rule.title="115.简";
rule.author="AI&三鲜汤 · 115.简 Test 1.2.1 清空回收站";
rule.version=2026092221;
var out="hiker://files/cache/115_12101_recycle_clear_test.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
