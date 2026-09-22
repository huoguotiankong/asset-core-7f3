(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver===2026092228)return "toast://当前已是115 Test 1.2.1-test.8";
if(ver!==2026092224&&ver!==2026092225&&ver!==2026092226&&ver!==2026092227)return "toast://请先覆盖到115 1.2.1 Test4-Test7再导入本版";
var hasFM=false,hasInfo=false;
for(var j=0;j<pages.length;j++){if(pages[j]&&pages[j].path==="115FileManage")hasFM=true;if(pages[j]&&pages[j].path==="115FileInfo")hasInfo=true;}
if(!hasFM||!hasInfo)return "toast://当前规则缺少增强文件管理/文件信息页，请先覆盖到115 Test4以上";
var url="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@9383dad6bf441d3c15360e57ef5b16e5e17c4cfc/apps/cloud/pan115/modules/search_v3.js";
var search="";
try{search=fetch(url);}catch(e2){return "toast://下载115搜索V3失败："+e2.message;}
if(!search||search.indexOf("/open/ufile/search")<0||search.indexOf("/files/search")<0||search.indexOf("file_category")<0)return "toast://115搜索V3模块校验失败";
var replaced=false;
for(var i=0;i<pages.length;i++){
 if(pages[i]&&pages[i].path==="115Search"){
  pages[i].name="115网盘搜索";
  pages[i].rule="js:\n"+search;
  replaced=true;break;
 }
}
if(!replaced)pages.push({col_type:"movie_3",name:"115网盘搜索",path:"115Search",rule:"js:\n"+search});
function patchHomeInput(fr){
 var s=String(fr||"");
 s=s.replace(/titleVisible\s*:\s*false/,"titleVisible:true");
 var p=s.indexOf("搜索 / 粘贴链接");
 if(p<0)p=s.indexOf("搜索/粘贴链接");
 if(p>=0&&s.indexOf("titleVisible:true",Math.max(0,p-900))<0){
  var b=Math.max(0,p-900),e=Math.min(s.length,p+1900),seg=s.substring(b,e),old=seg;
  seg=seg.replace(/extra\s*:\s*\{/,"extra:{titleVisible:true,");
  if(seg===old)seg=seg.replace(/col_type\s*:\s*[\"']input[\"']\s*,/,"col_type:\"input\",extra:{titleVisible:true},");
  s=s.substring(0,b)+seg+s.substring(e);
 }
 return s;
}
rule.find_rule=patchHomeInput(rule.find_rule);
rule.pages=JSON.stringify(pages);
rule.title="115.简";
rule.author="AI&三鲜汤 · 115.简 Test 1.2.1 双认证搜索修复";
rule.version=2026092228;
var out="hiker://files/cache/115_12108_search_dual_auth_test.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
