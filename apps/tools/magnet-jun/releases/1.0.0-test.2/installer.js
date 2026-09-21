(function(){
var src="";
try{
  src=fetch("https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@662b606c8ecfd87a25da87649d86a167a74beb91/apps/tools/magnet-jun/releases/1.0.0-test.1/installer.js");
}catch(e){return "toast://下载 Test1 安装器失败："+e.message;}
if(!src||src.indexOf("magnetjun_test1_rule.json")<0)return "toast://Test1 安装器内容异常";
try{eval(src);}catch(e2){return "toast://执行 Test1 安装器失败："+e2.message;}
var raw=fetch("hiker://files/cache/magnetjun_test1_rule.json");
if(!raw||raw==="null")return "toast://未生成 Test1 规则缓存";
var rule;
try{rule=JSON.parse(raw);}catch(e3){return "toast://解析 Test1 规则失败："+e3.message;}
var pages;
try{pages=typeof rule.pages==="string"?JSON.parse(rule.pages||"[]"):(rule.pages||[]);}catch(e4){return "toast://解析页面失败："+e4.message;}
var rulesPage=null;
for(var i=0;i<pages.length;i++){
  if(pages[i]&&pages[i].path==="rules"){rulesPage=pages[i];break;}
}
if(!rulesPage)return "toast://未找到原版 rules 页面";
var code=String(rulesPage.rule||"");
var needle="MY_RULE.title";
var fixed='"磁力君.简"';
var count=0;
while(code.indexOf(needle)>=0){
  code=code.replace(needle,fixed);
  count++;
}
if(count<3)return "toast://远程数据加载结构不匹配，停止覆盖";
rulesPage.rule=code;
rule.title="磁力君.简·测试";
rule.author=String(rule.author||"").replace("云盘调用精简 Test1","云盘调用精简 Test2");
rule.version=2026092102;
rule.pages=JSON.stringify(pages);
var out="hiker://files/cache/magnetjun_test2_rule.json";
saveFile(out,JSON.stringify(rule));
return "海阔视界首页频道规则￥home_rule_url￥"+getPath(out);
})()