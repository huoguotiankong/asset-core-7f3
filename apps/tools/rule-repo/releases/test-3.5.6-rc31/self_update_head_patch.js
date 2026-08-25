/* 我的规则仓库 3.5.6-rc31 - HEAD-Pinned Self Update + Sync Repair */
var RuleRepoRC31=(function(){
var VERSION='3.5.6-rc31',BUILD=421,RULE='apps/tools/rule-repo/rule_repo_test_v168.txt';
var REPO='huoguotiankong/asset-core-7f3',CHANNELS_PATH='apps/tools/rule-repo/channels.json';
var SELF_FILE='hiker://files/rules/asset-core-local/rule-repo-test/self_channels_v2.json';
var BRIDGE='hiker://files/rules/asset-core-local/rule-repo-test/shell_bridge_v9.js';
function clone(x){try{return JSON.parse(JSON.stringify(x));}catch(e){return x||{};}}
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Request\s+(?:failed|error)|Fetch\s+(?:failed|error)|Network\s+(?:failed|error)|Timeout\b|ETIMEDOUT\b|ECONN|ENOTFOUND\b|Forbidden\b|Unauthorized\b|Rate\s*limit\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t)||/^\{\s*"(?:message|error)"\s*:/i.test(t);}
function parse(t){if(bad(t))return null;try{var x=JSON.parse(String(t));return x&&Number(x.schema||0)>=1&&String(x.id||'')==='rule-repo'&&Array.isArray(x.channels)?x:null;}catch(e){return null;}}
function testOf(x){var a=x&&x.channels||[];for(var i=0;i<a.length;i++)if(String(a[i]&&a[i].channel||'')==='test')return a[i];return null;}
function testBuild(x){var t=testOf(x);return Number(t&&t.build||0);}
function currentMeta(){return{schema:4,id:'rule-repo',name:'我的规则仓库',namingPolicy:'rule-repo-split-name-exception',versionPolicy:'stable-test-local-lineage-v1',updatedAt:'2026-08-25 09:44',channels:[
 {channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.5',build:389,displayVersion:'Stable 3.5.5 · Build 389',path:'apps/tools/rule-repo/rule_repo_remote_v355.txt',mode:'remote',updatedAt:'2026-08-24',recommended:true,desc:'已验证稳定基线'},
 {channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:VERSION,baseVersion:'3.5.5',targetVersion:'3.5.6',build:BUILD,displayVersion:'Test '+VERSION+' · Build '+BUILD+' · HEAD-Pinned Self Feed',path:RULE,mode:'remote-local-first-native-require',updatedAt:'2026-08-25',recommended:false,desc:'GitHub main HEAD 固定后读取 channels；同时修复轻同步错误 page require'}
]};}
function shaFromText(t){try{var x=JSON.parse(String(t||'')),s=String(x&&x.commit&&x.commit.sha||'');return /^[0-9a-f]{40}$/i.test(s)?s:'';}catch(e){return'';}}
function fetchHead(){var ts=Date.now(),urls=[
 'https://api.github.com/repos/'+REPO+'/branches/main?_self='+ts,
 'https://api.github.com/repos/'+REPO+'/commits/main?_self='+ts
],best='',errs=[];
 for(var i=0;i<urls.length;i++){try{var s=String(fetch(urls[i],{timeout:2600,headers:{'Cache-Control':'no-cache, no-store, max-age=0','Accept':'application/vnd.github+json'}})||''),h=shaFromText(s);if(h)return h;errs.push((i+1)+':invalid');}catch(e){errs.push((i+1)+':'+String(e.message||e));}}
 throw new Error('无法取得 main HEAD'+(errs.length?'：'+errs.join(' | '):''));}
function choose(rs){var best=null,bb=-1;for(var i=0;i<(rs||[]).length;i++){var x=parse(rs[i]);if(!x)continue;var b=testBuild(x);if(!best||b>bb){best=x;bb=b;}}return best;}
function fetchPinned(sha){var p=CHANNELS_PATH,urls=[
 'https://raw.githubusercontent.com/'+REPO+'/'+sha+'/'+p,
 'https://github.com/'+REPO+'/raw/'+sha+'/'+p,
 'https://cdn.jsdelivr.net/gh/'+REPO+'@'+sha+'/'+p
],best=null,rs=[],errs=[];
 try{if(typeof batchFetch==='function'){var qs=[];for(var i=0;i<urls.length;i++)qs.push({url:urls[i],options:{timeout:3000,headers:{'Cache-Control':'public, max-age=31536000, immutable'}}});rs=batchFetch(qs)||[];best=choose(rs);}}catch(e0){errs.push('batch:'+String(e0.message||e0));}
 if(!best){for(var j=0;j<urls.length;j++){try{rs.push(String(fetch(urls[j],{timeout:2200})||''));}catch(e1){errs.push((j+1)+':'+String(e1.message||e1));rs.push('');}}best=choose(rs);}
 if(!best)throw new Error('HEAD '+sha.slice(0,8)+' 的 channels 三镜像均不可用'+(errs.length?'：'+errs.join(' | '):''));
 return best;}
function readLocal(){try{if(!fileExist(SELF_FILE))return null;return parse(readFile(SELF_FILE));}catch(e){return null;}}
function save(x){if(!parse(JSON.stringify(x)))throw new Error('自更新元数据无效');writeFile(SELF_FILE,JSON.stringify(x));var y=readLocal();if(!y)throw new Error('自更新元数据回读失败');return y;}
function effective(){var cur=currentMeta(),local=readLocal();return local&&testBuild(local)>=BUILD?clone(local):cur;}
function refresh(){var before=readLocal(),head='',x=null,errs=[];try{head=fetchHead();x=fetchPinned(head);}catch(e0){errs.push(String(e0.message||e0));}
 if(!x){try{if(typeof RuleRepoRC28==='object'&&typeof RuleRepoRC28.refresh==='function'){var z=RuleRepoRC28.refresh();x=z&&z.meta||null;}}catch(e1){errs.push('legacy:'+String(e1.message||e1));}}
 if(!x)throw new Error('测试仓版本刷新失败'+(errs.length?'：'+errs.join(' | '):''));
 if(testBuild(x)<BUILD)x=currentMeta();x=save(x);return{ok:true,oldBuild:testBuild(before),build:testBuild(x),head:head,meta:clone(x)};}
function apply(R){
 if(!R||typeof R.fastItemState!=='function')throw new Error('规则仓 Runtime 不完整');
 if(R.__rc31HeadSelf){R.version=VERSION;R.build=BUILD;return R;}
 var baseFast=R.fastItemState,baseCache=R.fastChannelCache,baseChannel=R.channelMeta,baseAction=R.workspaceAction,baseStatic=R.workspaceStaticAction,baseLight=R.lightSync,baseSync=R.syncManifest;
 R.__rc31HeadSelf=true;R.version=VERSION;R.build=BUILD;R.channel='test';R.releaseLabel='Single Workspace 18.3 · HEAD-Pinned Self Feed';R.localFirstRuntimeVersion='18.3';R.fastHomeVersion='18.3.0';R.isTestChannel=function(){return true;};
 R.ruleRepoChannelFallback=function(){return effective();};
 R.fastChannelCache=function(item){if(String(item&&item.id||'')==='rule-repo')return{schema:15,time:Date.now(),revision:'self-head-'+testBuild(effective()),sig:'rule-repo-self-head',meta:effective()};return baseCache.call(this,item);};
 R.channelMeta=function(item){if(String(item&&item.id||'')==='rule-repo')return effective();return typeof baseChannel==='function'?baseChannel.call(this,item):null;};
 R.fastItemState=function(item){if(String(item&&item.id||'')!=='rule-repo')return baseFast.call(this,item);var m=effective(),t=testOf(m),tb=Number(t&&t.build||0);return{group:true,installed:true,channel:'test',installedVersion:VERSION,installedBuild:BUILD,targetChannel:'test',targetVersion:String(t&&t.version||VERSION),targetBuild:tb||BUILD,update:tb>BUILD,updateKnown:true,recognized:true,ruleVersion:0};};
 R.workspaceAction=function(kind,item){if(String(kind||'')==='check'&&String(item&&item.id||'')==='rule-repo')return $('#noLoading#').lazyRule(function(){var loading=false;try{showLoading('正在读取 main HEAD 并检查测试仓新版本…');loading=true;var F='hiker://files/rules/asset-core-local/rule-repo-test/rc31_self_update_head_patch.js',u=getPath(F);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}if(typeof RuleRepoRC31!=='object')throw new Error('RC31 自更新模块未导出');var x=RuleRepoRC31.refresh(),a=x&&x.meta&&x.meta.channels||[],v='',b=0;for(var i=0;i<a.length;i++)if(String(a[i]&&a[i].channel||'')==='test'){v=String(a[i].version||'');b=Number(a[i].build||0);break;}hideLoading();loading=false;try{refreshPage(false);}catch(_e){}return'toast://测试仓版本已刷新 · '+(v||'--')+' / Build'+b;}catch(e){if(loading)try{hideLoading();}catch(_e2){}return'toast://检查失败，继续使用当前版本：'+String(e.message||e);}});return baseAction.call(this,kind,item);};
 function robust(){var a={ok:false},b=null;try{a=typeof baseLight==='function'?baseLight.call(R):(typeof baseSync==='function'?baseSync.call(R):{ok:false});}catch(e0){a={ok:false,error:String(e0.message||e0)};}try{b=refresh();}catch(e1){b={ok:false,error:String(e1.message||e1)};}a=a||{};a.selfUpdate=b;a.ok=!!(a.ok||(b&&b.ok));return a;}
 R.lightSync=function(){return robust();};R.syncManifest=function(){return robust();};
 R.workspaceStaticAction=function(kind){if(String(kind||'')!=='sync')return typeof baseStatic==='function'?baseStatic.call(this,kind):'hiker://empty';return $('#noLoading#').lazyRule(function(){var loading=false;try{showLoading('正在轻同步目录、图标与测试仓版本…');loading=true;var B='hiker://files/rules/asset-core-local/rule-repo-test/shell_bridge_v9.js',u=getPath(B);if(!fileExist(B))throw new Error('本地 Bridge v9 不存在，请先重新打开测试仓首页');try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}if(typeof RuleRepoBridge!=='object'||typeof RuleRepoBridge.load!=='function')throw new Error('Bridge v9 未导出');var r=RuleRepoBridge.load(),x=r.lightSync();hideLoading();loading=false;try{refreshPage(false);}catch(_e){}return x&&x.ok?'toast://轻同步完成':'toast://轻同步部分失败，已保留现有本地数据';}catch(e){if(loading)try{hideLoading();}catch(_e2){}return'toast://轻同步失败：'+String(e.message||e);}});};
 return R;
}
return{version:'1.0.0',apply:apply,refresh:refresh,current:effective,selfMeta:currentMeta};
})();
