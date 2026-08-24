/* 我的规则仓库 3.5.6-rc12 - Local-First Bootstrap Scope Fix 15.1.2 */
(function(R){
  var baseWorkspaceData=R.workspaceData,baseRuleRepoChannelFallback=R.ruleRepoChannelFallback;
  R.version='3.5.6-rc12';R.build=402;R.channel='test';R.releaseLabel='Single Workspace 15.1.2 · Local-First Bootstrap Scope Fix';R.localFirstRuntimeVersion='15.1.2';
  R.workspaceData=function(items,initialView,initialId){var d=baseWorkspaceData.call(this,items,initialView,initialId);d.ui='Single Workspace 15.1.2';if(d.performance){d.performance.bootstrapBridge='direct-fetch-eval';d.performance.managerBridge='direct-fetch-eval';}return d;};
  R.ruleRepoChannelFallback=function(){var data=baseRuleRepoChannelFallback.call(this),list=data&&data.channels||[],t=null,i;for(i=0;i<list.length;i++)if(String(list[i].channel||'')==='test'){t=list[i];break;}if(!t){t={channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版'};list.push(t);}t.version='3.5.6-rc12';t.baseVersion='3.5.5';t.targetVersion='3.5.6';t.build=402;t.displayVersion='Test 3.5.6-rc12 · Build 402 · Local-First 15.1.2';t.path='apps/tools/rule-repo/rule_repo_test_v148.txt';t.mode='remote-local-first';t.updatedAt='2026-08-24';t.desc='Local-First 首启作用域热修：Bootstrap/Manager 改为同作用域 fetch+eval，不再依赖 require 导出全局变量';t.highlights=['修复 RuleRepoBoot 未定义','Shell 首启直接 fetch+eval Bootstrap','Bootstrap 直接 fetch+eval Local Bundle Manager','RC11 Local-First/本地 channels/图标保持不变'];if(data){data.channels=list;data.updatedAt='2026-08-24 18:30';}return data;};
  if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
