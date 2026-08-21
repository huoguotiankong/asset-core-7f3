/* 我的规则仓库 v3.5.4 Stable - promoted from verified 3.5.4-rc7 */
(function(R){
R.version='3.5.4';
R.build=384;
R.channel='stable';
R.releaseLabel='Single Workspace 13.2 · Stable';
R.baseStableVersion='3.5.4';
R.updatedAt='2026-08-22';

/* Stable must never inherit Test persistent-state namespace. */
R.cacheKey='hc_repo_manifest_v3';
R.cacheTsKey='hc_repo_manifest_v3_ts';
R.recentKey='hc_repo_recent_v3';
R.favKey='hc_repo_favs_v3';
R.installedKey='hc_repo_installed_v3';
R.searchHistoryKey='hc_repo_search_history_v3';
R.importHistoryKey='hc_repo_import_history_v3';
R.statePrefix='hc_repo_v3_';
R.isTestChannel=function(){return false;};

/* RC7 action bridge remains unchanged; only its recovery target is rebound to Stable. */
R.workspaceBootstrapUrl='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/bootstrap_v154.js';
R.workspaceBootstrapCache=154;

R.ruleRepoChannelFallback=function(){
 var icon='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg';
 return{schema:4,id:'rule-repo',name:'我的规则仓库',updatedAt:'2026-08-22 00:22',channels:[
  {channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.4',build:384,displayVersion:'Stable 3.5.4 · Build 384 · Shell 1.5.4',path:'apps/tools/rule-repo/rule_repo_remote_v354.txt',mode:'remote',updatedAt:'2026-08-22',recommended:true,desc:'RC7 实机验证晋级 · Single Workspace 13.2 正式稳定版',highlights:['局部滚动与固定五栏','分类原地展开','同页程序详情','程序与版本导入修复','诊断与备份修复'],icon:icon},
  {channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:'3.5.4-rc7',baseVersion:'3.5.3',targetVersion:'3.5.4',build:384,displayVersion:'Test 3.5.4-rc7 · Build 384 · Shell 1.0.30',path:'apps/tools/rule-repo/rule_repo_test_v130.txt',mode:'remote',updatedAt:'2026-08-21',recommended:false,desc:'已完成实机验证并晋级 Stable 3.5.4；保留为本轮测试基线',highlights:['显式规则上下文','Bootstrap 双路恢复','程序与版本导入','诊断与备份修复','下一轮 Test 从 Stable 3.5.4 继续'],icon:icon}
 ]};
};
if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
