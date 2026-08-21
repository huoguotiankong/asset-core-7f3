/* 我的规则仓库 v3.5.0-rc9 - candidate identity + contract gate */
(function(R){
R.version='3.5.0-rc9';
R.build=359;
R.releaseChannel=R.isTestChannel&&R.isTestChannel()?'test':'candidate';
R.assertRuntimeContract();
})(HikerRuleRepo);
