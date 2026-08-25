/* 我的规则仓库 3.5.6-rc26 - Fast Catalog Check */
var RuleRepoRC26=(function(){
var VERSION='3.5.6-rc26',BUILD=416;
var REFRESH_FILE='hiker://files/rules/asset-core-local/rule-repo-test/catalog_refresh_v1.js';
var SYNC_FILE='hiker://files/rules/asset-core-local/rule-repo-test/sync_scheduler_v4.js';
function req(path,globalName){if(!fileExist(path))throw new Error('本地控制模块不存在：'+path);var u=getPath(path);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}var x=null;try{x=eval(globalName);}catch(e2){}if(!x)throw new Error(globalName+' 未导出');return x;}
function refreshCtl(){return req(REFRESH_FILE,'RuleRepoCatalogRefresh');}
function selfMeta(){try{return refreshCtl().selfMeta();}catch(e){return{schema:4,id:'rule-repo',name:'我的规则仓库',channels:[{channel:'stable',label:'正式版',version:'3.5.5',build:389,path:'apps/tools/rule-repo/rule_repo_remote_v355.txt',recommended:true},{channel:'test',label:'测试版',version:VERSION,build:BUILD,path:'apps/tools/rule-repo/rule_repo_test_v163.txt',recommended:false}]};}}
function summary(meta){var a=[],cs=meta&&meta.channels||[];for(var i=0;i<cs.length;i++){var c=cs[i]||{},lab=String(c.label||c.channel||'版本');a.push(lab+' '+String(c.version||'--'));}return a.slice(0,3).join(' / ');}
function apply(R){
if(!R||typeof R.workspaceAction!=='function')throw new Error('HikerRuleRepo未导出');
if(R.__rc26FastCatalog){R.version=VERSION;R.build=BUILD;return R;}
var baseWorkspaceAction=R.workspaceAction,baseFast=R.fastChannelCache,baseSync=R.syncManifest,baseLight=R.lightSync,baseStatic=R.workspaceStaticAction,baseStatics=R.workspaceStaticActions;
R.__rc26FastCatalog=true;R.version=VERSION;R.build=BUILD;R.channel='test';R.releaseLabel='Single Workspace 16.9 · Fast Catalog Check';R.localFirstRuntimeVersion='16.9';R.fastHomeVersion='16.9.0';R.isTestChannel=function(){return true;};
R.ruleRepoChannelFallback=function(){return selfMeta();};
R.fastChannelCache=function(item){if(String(item&&item.id||'')==='rule-repo')return{schema:11,time:Date.now(),revision:'self-rc26',sig:this.channelCacheSignature?this.channelCacheSignature(item):'rule-repo',meta:selfMeta()};return typeof baseFast==='function'?baseFast.call(this,item):null;};
R.workspaceAction=function(kind,item){
 if(String(kind||'')==='check'){
  var id=String(item&&item.id||'');
  return $('#noLoading#').lazyRule(function(appId){var loading=false;try{showLoading('正在检查云端版本…');loading=true;var F='hiker://files/rules/asset-core-local/rule-repo-test/catalog_refresh_v1.js';if(!fileExist(F))throw new Error('快速版本检查模块不存在，请覆盖升级 RC26');var u=getPath(F);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}if(typeof RuleRepoCatalogRefresh!=='object')throw new Error('快速版本检查模块未导出');var x=RuleRepoCatalogRefresh.refresh(appId);hideLoading();loading=false;try{refreshPage(false);}catch(_e){}var cs=x&&x.meta&&x.meta.channels||[],a=[];for(var i=0;i<cs.length;i++){var c=cs[i]||{};a.push(String(c.label||c.channel||'版本')+' '+String(c.version||'--'));}return'toast://版本目录已更新'+(a.length?' · '+a.slice(0,3).join(' / '):'');}catch(e){if(loading)try{hideLoading();}catch(_e2){}return'toast://检查失败，继续使用现有本地目录：'+String(e.message||e);}},id);
 }
 return baseWorkspaceAction.call(this,kind,item);
};
function robustSync(){var z={ok:false},y=null;try{z=typeof baseLight==='function'?baseLight.call(R):(typeof baseSync==='function'?baseSync.call(R):{ok:false});}catch(e0){z={ok:false,error:String(e0.message||e0)};}try{y=refreshCtl().refresh('rule-repo');}catch(e1){y={ok:false,error:String(e1.message||e1)};}z=z||{};z.catalogRefresh=y;z.ok=!!(z.ok||(y&&y.ok));return z;}
R.syncManifest=function(){return robustSync();};R.lightSync=function(){return robustSync();};
R.workspaceStaticAction=function(kind){if(String(kind||'')!=='sync')return typeof baseStatic==='function'?baseStatic.call(this,kind):'hiker://empty';return $('#noLoading#').lazyRule(function(){var loading=false;try{showLoading('正在轻同步目录与图标包…');loading=true;var S='hiker://files/rules/asset-core-local/rule-repo-test/sync_scheduler_v4.js',F='hiker://files/rules/asset-core-local/rule-repo-test/catalog_refresh_v1.js';var su=getPath(S),fu=getPath(F);try{require(su);}catch(e0){try{deleteCache(su);}catch(e1){}require(su);}var a=typeof RuleRepoSyncV4==='object'?RuleRepoSyncV4.sync():{ok:false};try{require(fu);}catch(e2){try{deleteCache(fu);}catch(e3){}require(fu);}if(typeof RuleRepoCatalogRefresh!=='object')throw new Error('快速目录刷新模块未导出');var b=RuleRepoCatalogRefresh.refresh('rule-repo');hideLoading();loading=false;return(a&&a.ok)||(b&&b.ok)?'toast://轻同步完成；版本目录已刷新':'toast://轻同步失败，继续使用现有本地数据';}catch(e){if(loading)try{hideLoading();}catch(_e){}return'toast://轻同步失败：'+String(e.message||e);}});};
R.workspaceStaticActions=function(){var a=typeof baseStatics==='function'?baseStatics.call(this):{};a=a||{};a.sync=this.workspaceStaticAction('sync');return a;};
try{refreshCtl().ensureSelf();}catch(e4){}
return R;
}
return{version:'1.0.0',apply:apply,selfMeta:selfMeta,summary:summary};
})();
