/* 我的规则仓库 3.5.6-rc11 - Channel Truth 15.1.1 */
(function(R){
  var baseWorkspaceData=R.workspaceData,baseRuleRepoChannelFallback=R.ruleRepoChannelFallback;
  R.version='3.5.6-rc11';R.build=401;R.channel='test';R.releaseLabel='Single Workspace 15.1.1 · Local-First Channel Truth';R.localFirstRuntimeVersion='15.1.1';
  R.channelMetaMatchesCatalog=function(item,data){
    if(!data||!Array.isArray(data.channels)||data.channels.length===0)return false;
    var good=0;for(var i=0;i<data.channels.length;i++){var c=data.channels[i]||{};if(String(c.channel||'')&&String(c.version||'')&&String(c.path||''))good++;}
    return good>0;
  };
  R.workspaceData=function(items,initialView,initialId){var d=baseWorkspaceData.call(this,items,initialView,initialId);d.ui='Single Workspace 15.1.1';if(d.performance){d.performance.channelTruth='per-app-channels-authoritative';d.performance.rootManifest='discovery-summary-only';}return d;};
  R.ruleRepoChannelFallback=function(){var data=baseRuleRepoChannelFallback.call(this),list=data&&data.channels||[],t=null,i;for(i=0;i<list.length;i++)if(String(list[i].channel||'')==='test'){t=list[i];break;}if(!t){t={channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版'};list.push(t);}t.version='3.5.6-rc11';t.baseVersion='3.5.5';t.targetVersion='3.5.6';t.build=401;t.displayVersion='Test 3.5.6-rc11 · Build 401 · Local-First 15.1.1';t.path='apps/tools/rule-repo/rule_repo_test_v147.txt';t.mode='remote-local-first';t.updatedAt='2026-08-24';t.desc='Local-First 通道真相热修：根 manifest 只做目录发现，程序 channels.json 作为版本中心权威事实源';t.highlights=['保留 RC10 本地运行包/图标/全量 channels 同步','不再用滞后的根摘要拒绝更高版本 channels','程序级 channels 成为版本中心权威真相','Stable 3.5.5 不变'];if(data){data.channels=list;data.updatedAt='2026-08-24 18:xx';}return data;};
  if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
