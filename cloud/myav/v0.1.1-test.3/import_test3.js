(function(){
  var old='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/131c8e03cdc40d6c9a5b1788050f5963ff272fd5/apps/video/myav/myav_remote_test_v2_b10202.txt';
  var s=String(fetch(old,{timeout:8000})||'');
  if(!s||s.indexOf('b10202')<0||s.indexOf('0.1.1-test.2')<0)throw new Error('MyAv Test2 基础规则读取失败');
  s=s.replace(/2026092420/g,'2026092423')
     .replace(/b10202/g,'b10203')
     .replace(/9a8db2505e8e76522769ffaa5407aeb747eb71a5/g,'9bce0b2471f58f73c5abc0b4484b022e808fb18a')
     .replace(/apps\/video\/myav\/releases\/0\.1\.1-test\.2\/local_entry\.js/g,'apps/video/myav/releases/0.1.1-test.3/local_entry.js')
     .replace(/0\.1\.1-test\.2/g,'0.1.1-test.3')
     .replace(/MyAv Test2 Entry/g,'MyAv Test3 Entry');
  return s;
})()
