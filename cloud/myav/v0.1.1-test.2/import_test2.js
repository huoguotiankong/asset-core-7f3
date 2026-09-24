(function(){
  var u='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/131c8e03cdc40d6c9a5b1788050f5963ff272fd5/apps/video/myav/myav_remote_test_v2_b10202.txt';
  var s=String(fetch(u,{timeout:8000})||'');
  if(!s||s.indexOf('0.1.1-test.2')<0||s.indexOf('b10202')<0)throw new Error('MyAv 0.1.1-test.2 规则读取失败');
  return s;
})()
