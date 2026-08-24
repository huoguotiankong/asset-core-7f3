/* rule-repo RC22 Light Sync Scheduler 1.0 */
var RuleRepoSyncV1=(function(){
var CATALOG_FILE='hiker://files/rules/asset-core-local/rule-repo-test/channel_catalog_v2.json';
function clone(o){try{return JSON.parse(JSON.stringify(o));}catch(e){return o;}}
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Request\s+(?:failed|error)|Fetch\s+(?:failed|error)|Network\s+(?:failed|error)|Timeout\b|ETIMEDOUT\b|ECONN|ENOTFOUND\b|Forbidden\b|Unauthorized\b|Rate\s*limit\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t)||/^\{\s*"(?:message|error)"\s*:/i.test(t);}
function parseManifest(t){if(bad(t))return null;try{var x=JSON.parse(String(t));return x&&Array.isArray(x.items)?x:null;}catch(e){return null;}}
function parseCatalog(t){if(bad(t))return null;try{var x=JSON.parse(String(t));return x&&x.apps&&typeof x.apps==='object'?x:null;}catch(e){return null;}}
function saveManifest(R,m){if(!m)return false;try{setItem(R.cacheKey,JSON.stringify(m));setItem(R.cacheTsKey,String(Date.now()));if(R.manifestRevisionKey&&m.revision)setItem(R.manifestRevisionKey,String(m.revision));if(R.manifestProbeTsKey)setItem(R.manifestProbeTsKey,String(Date.now()));return true;}catch(e){return false;}}
function saveCatalog(c){if(!c)return false;try{writeFile(CATALOG_FILE,JSON.stringify(c));return fileExist(CATALOG_FILE);}catch(e){return false;}}
function hydrate(R,c){var a=c&&c.apps||{},n=0;for(var id in a)if(Object.prototype.hasOwnProperty.call(a,id)){try{var it=R.findById(id,false),m=a[id];if(it&&m&&Array.isArray(m.channels)&&m.channels.length){R.saveFastChannelCache(it,clone(m));n++;}}catch(e){}}return n;}
function fetchPair(R){var repo=String(R.repo||'huoguotiankong/asset-core-7f3'),ts=Date.now(),base='https://raw.githubusercontent.com/'+repo+'/main/',reqs=[{url:base+'manifest.json?_ls='+ts,options:{timeout:4200,headers:{'Cache-Control':'no-cache, no-store, max-age=0'}}},{url:base+'apps/tools/rule-repo/channel_catalog_snapshot.json?_ls='+ts,options:{timeout:4200,headers:{'Cache-Control':'no-cache, no-store, max-age=0'}}}],rs=null,m=null,c=null,errs=[];
 try{if(typeof batchFetch==='function')rs=batchFetch(reqs);}catch(e){errs.push('batch:'+String(e.message||e));}
 if(rs&&rs.length){m=parseManifest(rs[0]);c=parseCatalog(rs[1]);}
 if(!rs||!rs.length){try{m=parseManifest(fetch(reqs[0].url,reqs[0].options));}catch(e1){errs.push('manifest:'+String(e1.message||e1));}try{c=parseCatalog(fetch(reqs[1].url,reqs[1].options));}catch(e2){errs.push('catalog:'+String(e2.message||e2));}}
 return{manifest:m,catalog:c,errors:errs};}
function lightSync(R){var oldCatalog=null;try{if(fileExist(CATALOG_FILE))oldCatalog=parseCatalog(readFile(CATALOG_FILE));}catch(e0){}var p=fetchPair(R),mo=saveManifest(R,p.manifest),co=saveCatalog(p.catalog),cat=p.catalog||oldCatalog,hn=cat?hydrate(R,cat):0,ok=!!(mo||co);return{ok:ok,mode:'light-sync-v1',manifest:{ok:mo,revision:String(p.manifest&&p.manifest.revision||'')},channelCatalog:{ok:co,revision:String(cat&&cat.revision||'')},hydrated:hn,icons:{deferred:true},installIndex:{deferred:true},errors:p.errors||[]};}
function syncIconsBatch(R,limit){limit=Math.max(1,Math.min(4,Number(limit||3)));var items=R.items(false),done=0,ok=0,fail=0;for(var i=0;i<items.length&&done<limit;i++){var it=items[i],p='';try{p=R.localIconFile?R.localIconFile(it):'';}catch(e0){}var valid=false;try{if(p&&fileExist(p)){if(/\.svg(?:$|\?)/i.test(String(p))){var s=String(readFile(p,0)||'').replace(/^\uFEFF/,'').trim();valid=/^<svg\b/i.test(s)||/^<\?xml[\s\S]*<svg\b/i.test(s);}else valid=true;}}catch(e1){}if(valid)continue;done++;try{var r=R.localizeIcon(it,true);if(r)ok++;else fail++;}catch(e2){fail++;}}
 return{total:done,ok:ok,fail:fail,remaining:Math.max(0,items.length-ok)};}
function apply(R){if(!R||typeof R.home!=='function')throw new Error('HikerRuleRepo未导出');if(R.__rc22LightSync)return R;var baseStatic=R.workspaceStaticAction,baseStatics=R.workspaceStaticActions;
 R.__rc22LightSync=true;R.version='3.5.6-rc22';R.build=412;R.channel='test';R.releaseLabel='Single Workspace 16.5 · Light Sync Scheduler';R.localFirstRuntimeVersion='16.5';R.fastHomeVersion='16.5.0';R.isTestChannel=function(){return true;};
 R.syncLocalIcons=function(items){return{ok:0,fail:0,total:Array.isArray(items)?items.length:0,deferred:true};};
 R.syncManifest=function(){return lightSync(this);};
 R.lightSync=function(){return lightSync(this);};
 R.syncIconsBatch=function(limit){return syncIconsBatch(this,limit);};
 R.workspaceStaticAction=function(kind){if(String(kind||'')!=='sync')return typeof baseStatic==='function'?baseStatic.call(this,kind):'hiker://empty';return $('#noLoading#').lazyRule(function(){var loading=false;try{showLoading('正在轻同步…');loading=true;var F='hiker://files/rules/asset-core-local/rule-repo-test/shell_loader_v5.js',u=getPath(F);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}RuleRepoLocal.load();var O='hiker://files/rules/asset-core-local/rule-repo-test/sync_scheduler_v1.js',ou=getPath(O);try{require(ou);}catch(e2){try{deleteCache(ou);}catch(e3){}require(ou);}RuleRepoSyncV1.apply(HikerRuleRepo);var x=HikerRuleRepo.syncManifest();hideLoading();loading=false;if(x&&x.ok){try{refreshPage(false);}catch(e4){}return'toast://轻同步完成：版本目录 '+String(x.channelCatalog&&x.channelCatalog.revision||'已更新');}return'toast://同步失败，继续使用本地目录';}catch(e){if(loading)try{hideLoading();}catch(e5){}return'toast://轻同步失败：'+String(e.message||e);}});};
 R.workspaceStaticActions=function(){var a=typeof baseStatics==='function'?baseStatics.call(this):{};a=a||{};a.sync=this.workspaceStaticAction('sync');return a;};
 return R;}
return{version:'1.0.0',apply:apply,lightSync:lightSync,syncIconsBatch:syncIconsBatch};
})();
