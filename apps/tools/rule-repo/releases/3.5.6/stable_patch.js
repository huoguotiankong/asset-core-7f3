/* 我的规则仓库 v3.5.6 Stable - promoted from 3.5.6-rc3 */
(function(R){
var baseFallback=R.ruleRepoChannelFallback;
R.version='3.5.6';
R.build=393;
R.channel='stable';
R.releaseLabel='Single Workspace 14.2 · Stable · Verified Device Install Index';
R.baseStableVersion='3.5.6';
R.baseStableBuild=393;
R.targetVersion='3.5.6';
R.updatedAt='2026-08-24';
R.fastHomeVersion='14.2.0-stable';
R.iconDeliveryVersion='1.1.0';
R.updateProtocolVersion='2.0.4';

/* Stable 永远使用正式状态命名空间，禁止继承 Test 状态。 */
R.cacheKey='hc_repo_manifest_v3';
R.cacheTsKey='hc_repo_manifest_v3_ts';
R.recentKey='hc_repo_recent_v3';
R.favKey='hc_repo_favs_v3';
R.installedKey='hc_repo_installed_v3';
R.searchHistoryKey='hc_repo_search_history_v3';
R.importHistoryKey='hc_repo_import_history_v3';
R.statePrefix='hc_repo_v3_';
R.isTestChannel=function(){return false;};

/* 所有恢复动作重新绑定 Stable 1.5.6 Bootstrap。 */
R.workspaceBootstrapUrl='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/bootstrap_v156.js';
R.workspaceBootstrapCache=156;

/* Verified Install Index 首次失败时也必须保持 stable 身份。 */
R.ensureVerifiedInstallIndex=function(items){
 var x=this.readVerifiedInstallIndex();if(x)return x;
 try{return this.refreshVerifiedInstallIndex(items,false);}catch(e){
  return this.saveVerifiedInstallIndex({schema:1,time:Date.now(),revision:'',installed:1,recognized:1,updates:0,unknown:0,apps:{'rule-repo':{installed:true,recognized:true,updateKnown:true,update:false,channel:'stable',installedVersion:String(this.version||''),targetVersion:String(this.version||''),verifiedAt:Date.now(),source:'stable-fallback'}}});
 }
};

R.ruleRepoChannelFallback=function(){
 var data=baseFallback.call(this),list=data&&data.channels||[],icon='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/tools/rule-repo/assets/icon.svg';
 var stable=null,test=null;
 for(var i=0;i<list.length;i++){if(String(list[i].channel||'')==='stable')stable=list[i];else if(String(list[i].channel||'')==='test')test=list[i];}
 if(!stable){stable={channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',icon:icon};list.unshift(stable);}
 stable.version='3.5.6';stable.build=393;stable.displayVersion='Stable 3.5.6 · Build 393 · Verified Install Index 14.2';stable.path='apps/tools/rule-repo/rule_repo_remote_v356.txt';stable.mode='remote';stable.updatedAt='2026-08-24';stable.recommended=true;stable.desc='RC3 用户明确晋级 · Fast Home + 真实设备安装索引正式版';stable.highlights=['首页继续缓存优先零逐项扫描','同步时刷新真实设备安装索引','同名 Stable/Test 使用数值 version 指纹','无法识别版本时不误报更新','Render Guard 保留'];stable.icon=icon;
 if(!test){test={channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',icon:icon};list.push(test);}
 test.version='3.5.6-rc3';test.baseVersion='3.5.5';test.targetVersion='3.5.6';test.build=393;test.displayVersion='Test 3.5.6-rc3 · Build 393 · 晋级来源';test.path='apps/tools/rule-repo/rule_repo_test_v139.txt';test.mode='remote';test.updatedAt='2026-08-24';test.recommended=false;test.desc='Stable 3.5.6 的实装来源，保留用于追溯';test.highlights=['Verified Device Install Index 14.2','Fast Home 14.x','Render Guard','历史测试来源保留'];test.icon=icon;
 if(data){data.updatedAt='2026-08-24 08:41';data.channels=list;}
 return data;
};
if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
