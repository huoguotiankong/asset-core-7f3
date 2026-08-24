/* 麻豆传媒 0.1.1-test.1 - Local-First identity/action patch */
(function(C,R){
  if(!C||!R)throw new Error('Madou Local-First base runtime missing');
  C.version='0.1.1-test.1';C.build=10201;
  R.version='0.1.1-test.1';R.build=10201;
  C.bootstrap=getPath('hiker://files/rules/asset-core-local/madou-test/assets/action_bootstrap_b10201.js');
})(MadouCore,MadouRemoteRuntime);
