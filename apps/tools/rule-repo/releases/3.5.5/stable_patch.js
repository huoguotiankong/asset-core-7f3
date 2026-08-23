/* 我的规则仓库 v3.5.5 Stable - promoted from 3.5.5-rc3 */
(function(R){
var baseFallback=R.ruleRepoChannelFallback;
R.version='3.5.5';
R.build=389;
R.channel='stable';
R.releaseLabel='Single Workspace 13.2.3 · Stable · Icon Delivery 1.1 · Delivery Protocol 2.0';
R.baseStableVersion='3.5.5';
R.baseStableBuild=389;
R.targetVersion='3.5.5';
R.updatedAt='2026-08-23';
R.iconDeliveryVersion='1.1.0';
R.updateProtocolVersion='2.0.4';
R.workspaceSyncRefreshVersion='13.2.1';

/* Stable 永远不能继承 Test 持久状态命名空间。 */
R.cacheKey='hc_repo_manifest_v3';
R.cacheTsKey='hc_repo_manifest_v3_ts';
R.recentKey='hc_repo_recent_v3';
R.favKey='hc_repo_favs_v3';
R.installedKey='hc_repo_installed_v3';
R.searchHistoryKey='hc_repo_search_history_v3';
R.importHistoryKey='hc_repo_import_history_v3';
R.statePrefix='hc_repo_v3_';
R.isTestChannel=function(){return false;};

/* 动作故障恢复重新绑定 Stable Bootstrap，禁止串入 Test。 */
R.workspaceBootstrapUrl='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/bootstrap_v155.js';
R.workspaceBootstrapCache=155;

R.ruleRepoChannelFallback=function(){
 var data=baseFallback.call(this),list=data&&data.channels||[],icon='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg';
 var stable=null,test=null;
 for(var i=0;i<list.length;i++){if(String(list[i].channel||'')==='stable')stable=list[i];else if(String(list[i].channel||'')==='test')test=list[i];}
 if(!stable){stable={channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',icon:icon};list.unshift(stable);}
 stable.version='3.5.5';stable.build=389;stable.displayVersion='Stable 3.5.5 · Build 389 · Shell 1.5.5';stable.path='apps/tools/rule-repo/rule_repo_remote_v355.txt';stable.mode='remote';stable.updatedAt='2026-08-23';stable.recommended=true;stable.desc='RC3 用户明确晋级 · 图标交付与云端发布协议强化正式版';stable.highlights=['程序卡/版本卡/底栏图标统一 CDN','同步后即时刷新','Remote Manager 2.0.4 元数据容错','原子发布基线'];stable.icon=icon;
 if(!test){test={channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',icon:icon};list.push(test);}
 test.version='3.5.5-test.1';test.baseVersion='3.5.5';test.targetVersion='3.5.5';test.build=390;test.displayVersion='Test 3.5.5-test.1 · Build 390 · Stable-aligned';test.path='apps/tools/rule-repo/rule_repo_test_v136.txt';test.mode='remote';test.updatedAt='2026-08-23';test.recommended=false;test.desc='Stable 3.5.5 同基线测试快照 · 下一轮开发干净起点';test.highlights=['业务/UI 与 Stable 3.5.5 对齐','Test 独立状态','Updater 2.0.4','Stable 回退链保留'];test.icon=icon;
 if(data){data.updatedAt='2026-08-23 22:30';data.channels=list;}
 return data;
};
if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
