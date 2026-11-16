(function(){
  var u='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/cloud/javdb/v3.9.58-test.1/javdb_v3.9.58_test1_auth_bridge.txt';
  var s=String(fetch(u,{timeout:10000,headers:{'Cache-Control':'no-cache'}})||'');
  var flag='￥home_rule￥',i=s.indexOf(flag),o=null,pages=[],paths=[];
  if(i<0)throw new Error('JavDB Test58 规则壳下载失败');
  try{o=JSON.parse(s.substring(i+flag.length));pages=JSON.parse(o.pages||'[]');}
  catch(e){throw new Error('JavDB Test58 规则壳解析失败');}
  for(var j=0;j<pages.length;j++)paths.push(String(pages[j]&&pages[j].path||''));
  if(Number(o.version)!==2026111604||paths.indexOf('javdb3Play')<0||paths.indexOf('javdb3Magnets')<0||paths.indexOf('javdb3AuthDiag')<0)
    throw new Error('JavDB Test58 VIP/磁链页面或版本不一致');
  if(s.indexOf('156a382bda2de1b177d55ce0314e45e3b8492165')<0)
    throw new Error('JavDB Test58 入口未绑定最新修复');
  return s;
})()