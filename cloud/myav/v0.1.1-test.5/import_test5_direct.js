(function(){
  var u='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/f358f1f7e0d835d93daa73179c0e52c28ffd119e/apps/video/myav/myav_remote_test_v5_b10205.txt';
  var s=String(fetch(u,{timeout:8000})||'');
  if(!s||s.indexOf('2026092504')<0||s.indexOf('0.1.1-test.5')<0)throw new Error('MyAv Test5 规则读取失败');
  return s;
})()