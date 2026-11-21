(function(){
var url='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/51chigua/51chigua_remote_test_localfirst_v2_b10202.txt';
var txt=String(fetch(url,{timeout:12000,headers:{'Cache-Control':'no-cache'}})||'');
var marker='￥home_rule￥',index=txt.indexOf(marker),obj=null,ps=[];
if(index<0)throw new Error('51吃瓜 Test2 Shell 下载失败');
try{obj=JSON.parse(txt.slice(index+marker.length));ps=JSON.parse(obj.pages||'[]');}catch(e){throw new Error('51吃瓜 Test2 Shell 结构解析失败');}
if(Number(obj.version)!==2026112101||ps.length!==11||
  !ps.some(function(x){return x&&x.path==='cg51ImageDiag'&&String(x.rule||'').includes('imageDiag()');})||
  !ps.some(function(x){return x&&x.path==='cg51Detail';})||
  !String(obj.find_rule||'').includes('90e09b2b6e0da7a539bdc5ed5e8dcb6c8a56332b')||
  !String(obj.find_rule||'').includes('b10202/'))
throw new Error('51吃瓜 Test2 版本/封面诊断/主入口不一致');
return txt;
})()