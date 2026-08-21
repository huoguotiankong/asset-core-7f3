/* 我的规则仓库 v3.5.0-rc10 - candidate identity + contract gate */
(function(R){
R.version='3.5.0-rc10';
R.build=361;
R.channel='candidate';
R.releaseChannel=R.isTestChannel&&R.isTestChannel()?'test':'candidate';
R.releaseLabel='Candidate 3.5.0-rc10';
if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
