(function(){
var url='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/51chigua/51chigua_remote_test_localfirst_v5_b10205.txt';
var src=String(fetch(url,{timeout:12000,headers:{'Cache-Control':'no-cache'}})||'');
var mark='￥home_rule￥',i=src.indexOf(mark),rule=null,pages=[];
if(i<0)throw new Error('51吃瓜 Test5 规则下载失败');
try{rule=JSON.parse(src.slice(i+mark.length));pages=JSON.parse(rule.pages||'[]');}
catch(e){throw new Error('51吃瓜 Test5 规则结构解析失败');}
if(Number(rule.version)!==2026112201||pages.length!==11||
!pages.some(function(p){return p&&p.path==='cg51ImageDiag'&&String(p.rule||'').indexOf('imageDiag()')>=0;})||
!pages.some(function(p){return p&&p.path==='cg51Detail';})||
!String(rule.find_rule||'').includes('529da67b00a3d33701be2bf8f8c6b23cead4d1cc')||
!String(rule.searchFind||'').includes('b10205/'))
throw new Error('51吃瓜 Test5 入口/封面诊断/缓存版本不一致');
return src;
})()