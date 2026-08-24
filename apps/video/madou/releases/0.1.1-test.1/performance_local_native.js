/* 麻豆传媒 0.1.1-test.1 - Local-First Performance bridge */
(function(){
  var ASSET='hiker://files/rules/asset-core-local/madou-test/assets/performance_test10.js';
  var src=String(fetch(ASSET)||'');
  var old="var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/madou/';";
  var local="var ROOT='hiker://files/rules/asset-core-local/madou-test/assets/';";
  if(src.indexOf('Test10 - performance-first runtime')<0)throw new Error('麻豆传媒本地 Performance 基线格式错误');
  if(src.indexOf(old)<0)throw new Error('麻豆传媒本地 Performance ROOT 锚点不存在');
  src=src.replace(old,local);
  eval(src);
  if(typeof MadouRemoteRuntime==='undefined'||String(MadouRemoteRuntime.version)!=='0.1.0-test.10')throw new Error('麻豆传媒本地 Performance Runtime 加载失败');
})();
