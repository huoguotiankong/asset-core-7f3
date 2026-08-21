/* 我的规则仓库·测试版 3.5.4-test.1 - exact Stable 3.5.4 business baseline */
(function(R){
var baseFallback=R.ruleRepoChannelFallback;
R.version='3.5.4-test.1';
R.build=385;
R.channel='test';
R.baseStableVersion='3.5.4';
R.baseStableBuild=384;
R.targetVersion='3.5.4';
R.testBaselineAligned=true;
R.releaseLabel='Single Workspace 13.2 · Test Baseline';
R.isTestChannel=function(){return true;};
R.workspaceBootstrapUrl='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/bootstrap_test_v131.js';
R.workspaceBootstrapCache=131;
R.ruleRepoChannelFallback=function(){
 var data=baseFallback.call(this),list=data&&data.channels||[];
 for(var i=0;i<list.length;i++)if(String(list[i].channel||'')==='test'){
  list[i].version='3.5.4-test.1';
  list[i].baseVersion='3.5.4';
  list[i].targetVersion='3.5.4';
  list[i].build=385;
  list[i].displayVersion='Test 3.5.4-test.1 · Build 385 · Shell 1.0.31';
  list[i].path='apps/tools/rule-repo/rule_repo_test_v131.txt';
  list[i].updatedAt='2026-08-22';
  list[i].desc='Stable 3.5.4 同基线测试快照 · 下一轮功能开发干净起点';
  list[i].highlights=['业务/UI 与 Stable 3.5.4 对齐','Test 独立状态','Test 独立 Remote Manager','Stable 恢复入口保留'];
 }
 return data;
};
if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
