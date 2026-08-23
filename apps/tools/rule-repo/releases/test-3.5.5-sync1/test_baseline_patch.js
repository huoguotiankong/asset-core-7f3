/* 我的规则仓库·测试版 3.5.5-test.1 - exact Stable 3.5.5 business baseline */
(function(R){
var baseFallback=R.ruleRepoChannelFallback;
R.version='3.5.5-test.1';
R.build=390;
R.channel='test';
R.baseStableVersion='3.5.5';
R.baseStableBuild=389;
R.targetVersion='3.5.5';
R.testBaselineAligned=true;
R.releaseLabel='Single Workspace 13.2.3 · Test Baseline · Delivery Protocol 2.0';
R.isTestChannel=function(){return true;};
R.workspaceBootstrapUrl='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/bootstrap_test_v135.js';
R.workspaceBootstrapCache=135;
R.ruleRepoChannelFallback=function(){
 var data=baseFallback.call(this),list=data&&data.channels||[],icon='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg';
 for(var i=0;i<list.length;i++)if(String(list[i].channel||'')==='test'){
  list[i].version='3.5.5-test.1';list[i].baseVersion='3.5.5';list[i].targetVersion='3.5.5';list[i].build=390;
  list[i].displayVersion='Test 3.5.5-test.1 · Build 390 · Shell 1.0.36';
  list[i].path='apps/tools/rule-repo/rule_repo_test_v136.txt';list[i].mode='remote';list[i].updatedAt='2026-08-23';list[i].recommended=false;
  list[i].desc='Stable 3.5.5 同基线测试快照 · 下一轮功能开发干净起点';
  list[i].highlights=['业务/UI 与 Stable 3.5.5 对齐','Test 独立状态','Remote Manager 2.0.4','Stable 恢复入口保留'];list[i].icon=icon;
 }
 return data;
};
if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
