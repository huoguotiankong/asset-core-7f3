(function(){
  var url='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/cloud/javdb/v3.9.55-test.1/javdb_v3.9.55_test1_apk1939.txt';
  var s=String(fetch(url,{timeout:10000,headers:{'Cache-Control':'no-cache'}})||'');
  var marker='￥home_rule￥',p=s.indexOf(marker);
  if(p<0)throw new Error('JavDB Test55 规则壳下载失败');
  var o=null;
  try{o=JSON.parse(s.substring(p+marker.length));}catch(e){throw new Error('JavDB Test55 规则结构异常');}
  var pages=[];
  try{pages=JSON.parse(o.pages);}catch(e2){}
  var paths=pages.map(function(x){return String(x.path||'');});
  if(Number(o.version)!==2026111601||paths.indexOf('javdb3Lucky')<0||paths.indexOf('javdb3Notifications')<0)
    throw new Error('JavDB Test55 规则版本与页面不匹配');
  return s;
})()