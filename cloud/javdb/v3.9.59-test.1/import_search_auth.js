(function(){
  var u='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/cloud/javdb/v3.9.59-test.1/javdb_v3.9.59_test1_search_auth.txt';
  var s=String(fetch(u,{timeout:12000,headers:{'Cache-Control':'no-cache'}})||'');
  var flag='￥home_rule￥',i=s.indexOf(flag),o=null,items=[],paths=[];
  if(i<0)throw new Error('JavDB Test59 规则壳下载失败');
  try{o=JSON.parse(s.substring(i+flag.length));items=JSON.parse(o.pages||'[]');}
  catch(e){throw new Error('JavDB Test59 规则壳结构错误');}
  for(var k=0;k<items.length;k++)paths.push(String(items[k]&&items[k].path||''));
  if(Number(o.version)!==2026111605||
      paths.indexOf('javdb3Search')<0||
      paths.indexOf('javdb3AuthDiag')<0||
      paths.indexOf('javdb3Play')<0||
      paths.indexOf('javdb3Magnets')<0||
      String(o.searchFind||'').indexOf("__searchFind")<0)
    throw new Error('JavDB Test59 搜索、诊断或基础路由缺失');
  if(s.indexOf('ec84100da1f7e8fff91458ed34b69e25f538aefe')<0)
    throw new Error('JavDB Test59 入口代码未匹配搜索修复版本');
  return s;
})()