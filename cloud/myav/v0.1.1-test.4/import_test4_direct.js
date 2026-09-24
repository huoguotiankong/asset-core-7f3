(function(){
  var u='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/170b0dd4f529093567045160e2e9d373b9097dce/apps/video/myav/myav_remote_test_v4_b10204.txt';
  var s=String(fetch(u,{timeout:8000})||'');
  if(!s||s.indexOf('2026092501')<0||s.indexOf('0.1.1-test.4')<0)throw new Error('MyAv Test4 规则读取失败');
  return s;
})()