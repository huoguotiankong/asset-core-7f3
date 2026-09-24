(function(){
  var u='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/1457d5c4b85c1b914a79f817b61040fd077240f3/apps/tools/magnetjun/magnetjun_remote_test_v2_b10102.txt';
  var s=String(fetch(u,{timeout:8000})||'');
  if(!s||s.indexOf('2026092502')<0||s.indexOf('磁力君.简')<0||s.indexOf('1.0.0-test.2')<0)throw new Error('磁力君.简 Test2 规则读取失败');
  return s;
})()