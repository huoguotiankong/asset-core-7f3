(function(){
  var u='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/31db0645769f12228ed342e0e2160d392f948677/apps/video/myav/myav_remote_test_v3_b10203.txt';
  var s=String(fetch(u,{timeout:8000})||'');
  if(!s||s.indexOf('b10203')<0||s.indexOf('0.1.1-test.3')<0)throw new Error('MyAv Test3 规则读取失败');
  return s;
})()
