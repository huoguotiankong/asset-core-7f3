(function(){
var raw=fetch("hiker://home@115.简");
if(!raw||raw==="null") return "toast://未找到原版115.简，请先保留原版";
var rule;
try{rule=JSON.parse(raw);}catch(e){return "toast://读取原版115.简失败："+e.message;}
var pages;
try{pages=JSON.parse(rule.pages||"[]");}catch(e2){return "toast://解析原版页面失败："+e2.message;}
var base="https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@c473d00a292010a63c9f5364cf45d66dbfc9593d/apps/cloud/pan115/test/test4/";
var offlineRule="",resultRule="";
try{
  offlineRule=fetch(base+"offline_part1.txt")+fetch(base+"offline_part2.txt")+fetch(base+"offline_part3.txt")+fetch(base+"offline_part4.txt");
  resultRule=fetch(base+"result.js");
}catch(e3){return "toast://下载 RC1 模块失败："+e3.message;}
if(!offlineRule||offlineRule.indexOf("115Offline")<0) return "toast://RC1 离线模块为空";
if(!resultRule||resultRule.indexOf("115OfflineResult")<0) return "toast://RC1 选集模块为空";
offlineRule=offlineRule.replace(/115\.简·测试/g,"115.简·候选").replace(/Test4/g,"RC1");
resultRule=resultRule.replace(/115\.简·测试/g,"115.简·候选").replace(/Test4/g,"RC1");
var foundOffline=false,foundResult=false;
for(var i=0;i<pages.length;i++){
  if(pages[i]&&pages[i].path==="115Offline"){pages[i].rule=offlineRule;foundOffline=true;}
  if(pages[i]&&pages[i].path==="115OfflineResult"){pages[i].rule=resultRule;pages[i].name="115离线结果";foundResult=true;}
}
if(!foundOffline) return "toast://原版115.简缺少115Offline页面";
if(!foundResult) pages.push({col_type:"movie_3",name:"115离线结果",path:"115OfflineResult",rule:resultRule});
rule.title="115.简·候选";
rule.author="AI&三鲜汤 · 磁链播放 RC1";
rule.version=2026092110;
try{
  var fr=String(rule.find_rule||"");
  fr=fr.replace("输入文件名关键词搜索；粘贴 115 分享链接可直接打开；粘贴 magnet / ed2k / HTTP 链接则离线下载","文件名 / 115分享 / 磁链");
  fr=fr.replace('title: "复制调用"','title: "复制磁链调用"');
  var oldCopy='return "copy://"+"\\"hiker://page/115Search?rule=" + rule + "&page=fypage&kw=\\" + encodeURIComponent(url);"';
  var newCopy='return "copy://"+"\\"hiker://page/115Offline?rule=" + rule + "&page=fypage&add=\\" + encodeURIComponent(url);"';
  fr=fr.replace(oldCopy,newCopy);
  rule.find_rule=fr;
}catch(e4){}
rule.pages=JSON.stringify(pages);
var out="hiker://files/cache/115_rc1_rule.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()