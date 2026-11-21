(function(){
var url='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/51chigua/51chigua_remote_test_localfirst_v3_b10203.txt';
var rule=String(fetch(url,{timeout:12000,headers:{'Cache-Control':'no-cache'}})||'');
var flag='￥home_rule￥',i=rule.indexOf(flag),body=null,pages=[];
if(i<0)throw new Error('51吃瓜 Test3 规则壳下载失败');
try{body=JSON.parse(rule.substring(i+flag.length));pages=JSON.parse(body.pages||'[]');}
catch(e){throw new Error('51吃瓜 Test3 规则壳解析错误');}
if(Number(body.version)!==2026112102||pages.length!==11||
!pages.some(function(x){return x&&x.path==='cg51ImageDiag'&&String(x.rule||'').indexOf('imageDiag()')>=0;})||
!pages.some(function(x){return x&&x.path==='cg51Detail';})||
String(body.find_rule||'').indexOf('ca31f864c94cfaeb574271c49b832f8a16a1fcb2')<0||
String(body.searchFind||'').indexOf('b10203/')<0)
throw new Error('51吃瓜 Test3 Build10203 或封面诊断路由不匹配');
return rule;
})()