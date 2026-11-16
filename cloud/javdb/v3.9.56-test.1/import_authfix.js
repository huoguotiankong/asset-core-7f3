(function(){
  var u='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/cloud/javdb/v3.9.56-test.1/javdb_v3.9.56_test1_authfix.txt';
  var s=String(fetch(u,{timeout:10000,headers:{'Cache-Control':'no-cache'}})||'');
  var marker='￥home_rule￥',i=s.indexOf(marker),o=null,ps=[];
  if(i<0)throw new Error('JavDB Test56 规则壳下载失败');
  try{o=JSON.parse(s.substring(i+marker.length));ps=JSON.parse(o.pages||'[]');}catch(e){throw new Error('JavDB Test56 规则壳结构异常');}
  var keys=ps.map(function(v){return String(v&&v.path||'');});
  if(Number(o.version)!==2026111602||keys.indexOf('javdb3AuthDiag')<0||keys.indexOf('javdb3Filters')<0||keys.indexOf('javdb3RankHub')<0)
    throw new Error('JavDB Test56 页面或版本号不一致');
  if(s.indexOf('3ce263e38a6851c60cd0ec2a8680327477f6604d')<0)
    throw new Error('JavDB Test56 主程序没有绑定正确运行版本');
  return s;
})()