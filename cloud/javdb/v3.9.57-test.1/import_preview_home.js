(function(){
  var url='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/cloud/javdb/v3.9.57-test.1/javdb_v3.9.57_test1_preview_home.txt';
  var src=String(fetch(url,{timeout:10000,headers:{'Cache-Control':'no-cache'}})||'');
  var marker='￥home_rule￥',i=src.indexOf(marker),rule=null,pages=[],names=[];
  if(i<0)throw new Error('JavDB Test57 规则壳下载失败');
  try{rule=JSON.parse(src.substring(i+marker.length));pages=JSON.parse(rule.pages||'[]');}
  catch(e){throw new Error('JavDB Test57 规则结构异常');}
  for(var j=0;j<pages.length;j++)names.push(String(pages[j]&&pages[j].path||''));
  if(Number(rule.version)!==2026111603||names.indexOf('javdb3Preview')<0||
      names.indexOf('javdb3Filters')<0||names.indexOf('javdb3AuthDiag')<0||names.indexOf('javdb3RankHub')<0)
    throw new Error('JavDB Test57 页面或版本不匹配');
  if(src.indexOf('1e420a7b9d627f0d4c67aa35c717bcbc9cf0757d')<0)
    throw new Error('JavDB Test57 主程序未绑定修复版本');
  return src;
})()