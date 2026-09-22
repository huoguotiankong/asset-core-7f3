(function(){
  var old='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/cloud/javdb/v3.9.50-test.1/javdb_v3.9.50_test1_livehls.txt';
  var s=String(fetch(old,{timeout:8000})||'');
  if(!s||s.indexOf('3.9.50-test.1')<0)throw new Error('JavDB 3.9.50 基础规则读取失败');
  s=s.replace(/3\.9\.50-test\.1/g,'3.9.54-test.1')
     .replace(/2026092204/g,'2026092208')
     .replace(/b2026092204/g,'b2026092208')
     .replace(/8474f9b758cff4141a4ab101c34e5eef42190a52/g,'a2de36ec5969b306d777868f70412ddca1e869e7')
     .replace(/apps\/video\/javdb\/releases\/3\.9\.50-test\.1\/local_entry\.js/g,'apps/video/javdb/releases/3.9.54-test.1/local_entry.js');
  return s;
})()
