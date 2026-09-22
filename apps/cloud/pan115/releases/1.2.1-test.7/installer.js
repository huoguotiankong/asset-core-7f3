(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null")return "toast://未找到115.简，请保留当前已登录的115.简";
var rule,pages;
try{rule=JSON.parse(raw);pages=JSON.parse(rule.pages||"[]");}catch(e){return "toast://读取115.简失败："+e.message;}
var ver=Number(rule.version||0);
if(ver===2026092227)return "toast://当前已是115 Test 1.2.1-test.7";
if(ver!==2026092226&&ver!==2026092225&&ver!==2026092224&&ver!==2026092223&&ver!==2026092222&&ver!==2026092221&&ver!==2026092220)return "toast://请先覆盖到115 Stable 1.2.0或1.2.1 Test1-Test6再导入本版";
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
   if(ps[i]&&ps[i].path==="115Search"&&String(ps[i].rule||"").length>50){
     return {page:ps[i],version:rv};
   }
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
 var snap=readLocal(candidates[c]);
 var hit=extractSearch(snap);
 if(hit){legacy=hit;source=candidates[c];break;}
}
if(!legacy)return "toast://未找到Test4/Stable旧搜索快照。为避免继续猜115接口，本版不会覆盖当前规则；请把这个提示截图发我。";
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
rule.author="AI&三鲜汤 · 115.简 Test 1.2.1 搜索恢复基线";
rule.version=2026092227;
var out="hiker://files/cache/115_12107_legacy_search_recovery.json";
saveFile(out,JSON.stringify(rule));
setItem("115SearchRecoverySourceV1",source+"|version="+legacy.version);
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()
