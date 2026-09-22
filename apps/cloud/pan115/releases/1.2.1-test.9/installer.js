(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver===2026092229)return "toast://当前已是115 Test 1.2.1-test.9";
if(ver!==2026092228&&ver!==2026092227&&ver!==2026092226&&ver!==2026092225&&ver!==2026092224)return "toast://请先覆盖到115 1.2.1 Test4-Test8再导入本版";
function readLocal(path){
 var s="";
 try{s=fetch(path)||"";}catch(e){}
 if(!s||s==="null"||s==="undefined")try{s=request(path)||"";}catch(e2){}
 if(!s||s==="null"||s==="undefined")try{s=readFile(path)||"";}catch(e3){}
 return String(s||"");
}
function extractSearch(snapshot){
 if(!snapshot)return null;
 var r,ps;
 try{r=JSON.parse(snapshot);ps=JSON.parse(r.pages||"[]");}catch(e){return null;}
 var rv=Number(r.version||0);
 if(rv>=2026092225)return null;
 for(var i=0;i<ps.length;i++){
  if(ps[i]&&ps[i].path==="115Search"&&String(ps[i].rule||"").length>50)return {page:ps[i],version:rv};
 }
 return null;
}
var candidates=[
 "hiker://files/cache/115_12104_file_manage_ux_test.json",
 "hiker://files/cache/115_12103_file_manage_test.json",
 "hiker://files/cache/115_12102_batch_manage_test.json",
 "hiker://files/cache/115_12101_recycle_clear_test.json",
 "hiker://files/cache/115_stable_120_rule.json"
];
var legacy=null,source="";
for(var c=0;c<candidates.length;c++){
 var hit=extractSearch(readLocal(candidates[c]));
 if(hit){legacy=hit;source=candidates[c];break;}
}
if(!legacy)return "toast://未找到Test4/Stable旧搜索快照。Test9不会覆盖当前规则，请把这个提示截图发我。";
var currentSearch=null;
for(var x=0;x<pages.length;x++)if(pages[x]&&pages[x].path==="115Search"){currentSearch=pages[x];break;}
if(currentSearch){
 var hasDebug=false;
 for(var y=0;y<pages.length;y++)if(pages[y]&&pages[y].path==="115SearchModernDebug"){hasDebug=true;break;}
 if(!hasDebug)pages.push({col_type:currentSearch.col_type||"movie_3",name:"115搜索实验页（隐藏）",path:"115SearchModernDebug",rule:currentSearch.rule});
}
var replaced=false;
for(var i=0;i<pages.length;i++){
 if(pages[i]&&pages[i].path==="115Search"){
  pages[i].name=legacy.page.name||"115网盘搜索";
  pages[i].rule=legacy.page.rule;
  if(legacy.page.col_type)pages[i].col_type=legacy.page.col_type;
  replaced=true;break;
 }
}
if(!replaced)pages.push(legacy.page);
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
rule.author="AI&三鲜汤 · 115.简 Test 1.2.1 旧搜索链恢复";
rule.version=2026092229;
var out="hiker://files/cache/115_12109_legacy_search_runtime_recovery.json";
saveFile(out,JSON.stringify(rule));
setItem("115SearchRecoverySourceV2",source+"|version="+legacy.version);
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
