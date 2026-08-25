/* 我的规则仓库 3.5.6-rc28 - Self Update Feed */
var RuleRepoRC28=(function(){
var VERSION='3.5.6-rc28',BUILD=418;
var REPO='huoguotiankong/asset-core-7f3',CHANNELS_PATH='apps/tools/rule-repo/channels.json';
var SELF_FILE='hiker://files/rules/asset-core-local/rule-repo-test/self_channels_v1.json';

function clone(x){try{return JSON.parse(JSON.stringify(x));}catch(e){return x||{};}}
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Request\s+(?:failed|error)|Fetch\s+(?:failed|error)|Network\s+(?:failed|error)|Timeout\b|ETIMEDOUT\b|ECONN|ENOTFOUND\b|Forbidden\b|Unauthorized\b|Rate\s*limit\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t)||/^\{\s*"(?:message|error)"\s*:/i.test(t);}
function parse(t){if(bad(t))return null;try{var x=JSON.parse(String(t));return x&&Number(x.schema||0)>=1&&String(x.id||'')==='rule-repo'&&Array.isArray(x.channels)?x:null;}catch(e){return null;}}
function testOf(x){var a=x&&x.channels||[];for(var i=0;i<a.length;i++)if(String(a[i]&&a[i].channel||'')==='test')return a[i];return null;}
function testBuild(x){var t=testOf(x);return Number(t&&t.build||0);}
function currentMeta(){return{schema:4,id:'rule-repo',name:'我的规则仓库',namingPolicy:'rule-repo-split-name-exception',versionPolicy:'stable-test-local-lineage-v1',updatedAt:'2026-08-25 08:55',channels:[
 {channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.5',build:389,displayVersion:'Stable 3.5.5 · Build 389 · 恢复稳定推荐',path:'apps/tools/rule-repo/rule_repo_remote_v355.txt',mode:'remote',updatedAt:'2026-08-24',recommended:true,desc:'已验证稳定基线'},
 {channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:VERSION,baseVersion:'3.5.5',targetVersion:'3.5.6',build:BUILD,displayVersion:'Test '+VERSION+' · Build '+BUILD+' · Self Update 18.0',path:'apps/tools/rule-repo/rule_repo_test_v165.txt',mode:'remote-local-first-native-require',updatedAt:'2026-08-25',recommended:false,desc:'测试仓自更新独立小通道'}
]};}
function urls(){var ts=Date.now(),p=CHANNELS_PATH;return[
 'https://raw.githubusercontent.com/'+REPO+'/main/'+p+'?_self='+ts,
 'https://github.com/'+REPO+'/raw/main/'+p+'?_self='+ts,
 'https://cdn.jsdelivr.net/gh/'+REPO+'@main/'+p+'?_self='+ts
];}
function choose(rs){var best=null,bb=-1;for(var i=0;i<(rs||[]).length;i++){var x=parse(rs[i]);if(!x)continue;var b=testBuild(x);if(!best||b>bb){best=x;bb=b;}}return best;}
function fetchLatest(){
 var us=urls(),best=null,rs=null,errors=[];
 try{
  if(typeof batchFetch==='function'){
   var reqs=[];for(var i=0;i<us.length;i++)reqs.push({url:us[i],options:{timeout:2600,headers:{'Cache-Control':'no-cache, no-store, max-age=0'}}});
   rs=batchFetch(reqs);best=choose(rs);
  }
 }catch(e0){errors.push('batch:'+String(e0.message||e0));}
 if(!best){
  var seq=[];for(var j=0;j<us.length;j++){try{seq.push(String(fetch(us[j],{timeout:1800,headers:{'Cache-Control':'no-cache, no-store, max-age=0'}})||''));}catch(e1){seq.push('');errors.push((j+1)+':'+String(e1.message||e1));}}
  best=choose(seq);
 }
 if(!best)throw new Error('规则仓自更新三镜像均不可用'+(errors.length?'：'+errors.join(' | '):''));
 return best;
}
function readLocal(){try{if(!fileExist(SELF_FILE))return null;return parse(readFile(SELF_FILE));}catch(e){return null;}}
function save(x){if(!parse(JSON.stringify(x)))throw new Error('规则仓自更新元数据无效');writeFile(SELF_FILE,JSON.stringify(x));var y=readLocal();if(!y)throw new Error('规则仓自更新元数据回读失败');return y;}
function effective(){
 var cur=currentMeta(),local=readLocal();
 if(local&&testBuild(local)>=BUILD)return clone(local);
 return cur;
}
function refresh(){var before=readLocal(),x=save(fetchLatest());if(testBuild(x)<BUILD)x=save(currentMeta());return{ok:true,oldBuild:testBuild(before),build:testBuild(x),meta:clone(x)};}
function newer(meta){return testBuild(meta)>BUILD;}

function apply(R){
 if(!R||typeof R.fastItemState!=='function')throw new Error('规则仓 Runtime 不完整');
 if(R.__rc28SelfUpdate){R.version=VERSION;R.build=BUILD;return R;}
 var baseFastCache=R.fastChannelCache,baseFastItem=R.fastItemState,baseChannelMeta=R.channelMeta,baseWorkspaceAction=R.workspaceAction,baseStatic=R.workspaceStaticAction,baseLight=R.lightSync,baseSync=R.syncManifest;
 R.__rc28SelfUpdate=true;R.version=VERSION;R.build=BUILD;R.channel='test';R.releaseLabel='Single Workspace 18.0 · Self Update Feed';R.localFirstRuntimeVersion='18.0';R.fastHomeVersion='18.0.0';R.isTestChannel=function(){return true;};
 R.ruleRepoChannelFallback=function(){return effective();};
 R.fastChannelCache=function(item){
  if(String(item&&item.id||'')==='rule-repo')return{schema:13,time:Date.now(),revision:'self-feed-'+testBuild(effective()),sig:'rule-repo-self-feed',meta:effective()};
  return baseFastCache.call(this,item);
 };
 R.channelMeta=function(item){
  if(String(item&&item.id||'')==='rule-repo')return effective();
  return typeof baseChannelMeta==='function'?baseChannelMeta.call(this,item):null;
 };
 R.fastItemState=function(item){
  if(String(item&&item.id||'')!=='rule-repo')return baseFastItem.call(this,item);
  var m=effective(),t=testOf(m),tb=Number(t&&t.build||0);
  return{group:true,installed:true,channel:'test',installedVersion:VERSION,installedBuild:BUILD,targetChannel:'test',targetVersion:String(t&&t.version||VERSION),targetBuild:tb||BUILD,update:tb>BUILD,updateKnown:true,recognized:true,ruleVersion:0};
 };
 R.workspaceAction=function(kind,item){
  if(String(kind||'')==='check'&&String(item&&item.id||'')==='rule-repo'){
   return $('#noLoading#').lazyRule(function(){
    var loading=false;try{
     showLoading('正在检查测试仓新版本…');loading=true;
     var F='hiker://files/rules/asset-core-local/rule-repo-test/rc28_self_update_patch.js',u=getPath(F);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}
     if(typeof RuleRepoRC28!=='object')throw new Error('RC28 自更新模块未导出');
     var x=RuleRepoRC28.refresh(),t=x&&x.meta&&x.meta.channels||[],v='',b=0;for(var i=0;i<t.length;i++)if(String(t[i]&&t[i].channel||'')==='test'){v=String(t[i].version||'');b=Number(t[i].build||0);break;}
     hideLoading();loading=false;try{refreshPage(false);}catch(_e){}
     return'toast://测试仓版本已刷新 · '+(v||'--')+' / Build'+b;
    }catch(e){if(loading)try{hideLoading();}catch(_e2){}return'toast://检查失败，继续使用当前版本：'+String(e.message||e);}
   });
  }
  return baseWorkspaceAction.call(this,kind,item);
 };
 function robust(){
  var a={ok:false},b=null;try{a=typeof baseLight==='function'?baseLight.call(R):(typeof baseSync==='function'?baseSync.call(R):{ok:false});}catch(e0){a={ok:false,error:String(e0.message||e0)};}
  try{b=refresh();}catch(e1){b={ok:false,error:String(e1.message||e1)};}
  a=a||{};a.selfUpdate=b;a.ok=!!(a.ok||(b&&b.ok));return a;
 }
 R.lightSync=function(){return robust();};
 R.syncManifest=function(){return robust();};
 R.workspaceStaticAction=function(kind){
  if(String(kind||'')!=='sync')return typeof baseStatic==='function'?baseStatic.call(this,kind):'hiker://empty';
  return $('#noLoading#').lazyRule(function(){
   var loading=false;try{showLoading('正在轻同步目录、图标与测试仓版本…');loading=true;var r=$.require('hiker://page/ruleRepoCore'),x=r.lightSync();hideLoading();loading=false;try{refreshPage(false);}catch(_e){}return x&&x.ok?'toast://轻同步完成':'toast://轻同步失败，继续使用现有本地数据';}catch(e){if(loading)try{hideLoading();}catch(_e2){}return'toast://轻同步失败：'+String(e.message||e);}
  });
 };
 return R;
}
return{version:'1.0.0',apply:apply,refresh:refresh,current:effective,newer:newer,selfMeta:currentMeta};
})();
