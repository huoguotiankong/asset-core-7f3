(function(){
var url='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/51chigua/51chigua_remote_test_localfirst_v4_b10204.txt';
var shell=String(fetch(url,{timeout:12000,headers:{'Cache-Control':'no-cache'}})||'');
var flag='￥home_rule￥',i=shell.indexOf(flag),body=null,pages=[];
if(i<0)throw new Error('51吃瓜 Test4 规则壳下载失败');
try{body=JSON.parse(shell.substring(i+flag.length));pages=JSON.parse(body.pages||'[]');}
catch(e){throw new Error('51吃瓜 Test4 规则壳结构异常');}
if(Number(body.version)!==2026112103||pages.length!==11||
!pages.some(function(x){return x&&x.path==='cg51ImageDiag'&&String(x.rule||'').indexOf('imageDiag()')>=0;})||
!pages.some(function(x){return x&&x.path==='cg51Detail';})||
String(body.find_rule||'').indexOf('14a3bece199e007b09fbf06fd101e9ac43e40cda')<0||
String(body.searchFind||'').indexOf('b10204/')<0)
throw new Error('51吃瓜 Test4 入口/诊断/版本号校验失败');
return shell;
})()