/* 我的规则仓库·测试版 3.5.4-test.2 - sync refresh hotfix */
(function(R){
var baseFallback=R.ruleRepoChannelFallback;
var baseStaticAction=R.workspaceStaticAction;
R.version='3.5.4-test.2';
R.build=386;
R.channel='test';
R.baseStableVersion='3.5.4';
R.baseStableBuild=384;
R.targetVersion='3.5.4';
R.releaseLabel='Single Workspace 13.2.1 · Sync Refresh';
R.workspaceSyncRefreshVersion='13.2.1';
R.isTestChannel=function(){return true;};
R.ruleRepoChannelFallback=function(){
 var data=baseFallback.call(this),list=data&&data.channels||[];
 for(var i=0;i<list.length;i++)if(String(list[i].channel||'')==='test'){
  list[i].version='3.5.4-test.2';
  list[i].baseVersion='3.5.4';
  list[i].targetVersion='3.5.4';
  list[i].build=386;
  list[i].displayVersion='Test 3.5.4-test.2 · Build 386 · Sync Refresh';
  list[i].path='apps/tools/rule-repo/rule_repo_test_v132.txt';
  list[i].updatedAt='2026-08-23';
  list[i].desc='同步目录后立即重建 Single Workspace，新增程序无需退出页面即可出现';
  list[i].highlights=['同步成功自动刷新页面','修复目录缓存已更新但界面仍显示旧快照','Stable 3.5.4 业务/UI 保持不变','Test 独立状态与回退链保留'];
 }
 return data;
};
R.workspaceStaticAction=function(kind){
 if(String(kind||'')!=='sync')return baseStaticAction.call(this,kind);
 var seed=this.workspaceActionUrl('sync'),spec=this.workspaceCoreSpec();
 return $(seed).lazyRule(function(k,s){
  function loadCore(raw){
   var c=JSON.parse(raw||'{}'),r=null,first='';
   try{r=$.require(String(c.page||''));}catch(e){first=String(e.message||e);}
   if(!r||typeof r.syncManifest!=='function'){
    try{require(String(c.bootstrap||''),{headers:{'Cache-Control':'no-cache'}},Number(c.cache||131));RuleRepoBoot.load();r=HikerRuleRepo;}catch(e2){throw new Error('动作 Core 加载失败'+(first?'（页面模块：'+first+'）':'')+'；Bootstrap：'+String(e2.message||e2));}
   }
   if(!r||typeof r.syncManifest!=='function')throw new Error('动作 Core 接口不完整');
   return r;
  }
  var loading=false;
  try{
   var r=loadCore(s);showLoading('正在同步…');loading=true;
   var x=r.syncManifest();if(r.clearPresenceCache)r.clearPresenceCache();
   hideLoading();loading=false;
   if(!x||!x.ok)return'toast://同步失败，已保留当前目录';
   try{refreshPage(false);}catch(refreshError){}
   return'toast://目录已同步，正在刷新页面';
  }catch(e){if(loading)try{hideLoading();}catch(x){}return'toast://操作失败：'+String(e.message||e);}
 },'sync',spec);
};
if(typeof R.assertRuntimeContract==='function')R.assertRuntimeContract();
})(HikerRuleRepo);
