/* 51吃瓜 0.1.0 Stable - promoted from Test5 */
(function(){
  if(typeof Cg51Core!=='object'||typeof Cg51RemoteRuntime!=='object')throw new Error('51chigua stable base runtime missing');
  var C=Cg51Core,R=Cg51RemoteRuntime;
  C.version='0.1.0';C.build=10106;C.channel='stable';
  C.bootstrap='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/51chigua/bootstrap_stable_v1_b10106.js?v=10106';
  R.version='0.1.0';R.build=10106;R.channel='stable';
  R.module=function(){return R;};
})();
