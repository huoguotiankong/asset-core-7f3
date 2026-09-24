(function(){
  var u='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/299297dca3c6eca663020d3b5f70e411cf2c8992/apps/tools/magnetjun/magnetjun_remote_test_v1_b10101.txt';
  var s=String(fetch(u,{timeout:8000})||'');
  if(!s||s.indexOf('2026092501')<0||s.indexOf('磁力君.简')<0||s.indexOf('1.0.0-test.1')<0)throw new Error('磁力君.简 Test1 规则读取失败');
  return s;
})()