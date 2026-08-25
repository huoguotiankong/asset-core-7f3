/* 我的规则仓库 3.5.6-rc32 - Direct Payload Import */
var RuleRepoRC32=(function(){
var VERSION='3.5.6-rc32',BUILD=422;
var REF_FILE='hiker://files/rules/asset-core-local/rule-repo-test/import_ref_catalog_v1.json';
var DIAG_KEY='hc_repo_import_diag_v2';
function parse(s){try{var x=JSON.parse(String(s||''));return x&&typeof x==='object'?x:null;}catch(e){return null;}}
function sha(s){s=String(s||'').trim();return /^[0-9a-f]{40}$/i.test(s)?s:'';}
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Request\s+(?:failed|error)|Fetch\s+(?:failed|error)|Network\s+(?:failed|error)|Timeout\b|ETIMEDOUT\b|ECONN|ENOTFOUND\b|Forbidden\b|Unauthorized\b|Rate\s*limit\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t)||/^\{\s*"(?:message|error)"\s*:/i.test(t);}
function isRule(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !bad(t)&&t.indexOf('海阔视界')===0&&t.length>80;}
function refs(){try{if(!fileExist(REF_FILE))return null;var x=parse(readFile(REF_FILE));return x&&x.refs&&typeof x.refs==='object'?x.refs:null;}catch(e){return null;}}
function refOf(x,item){var r=sha(x&&x.importRef)||sha(item&&item.importRef)||sha(x&&x.ref)||sha(item&&item.ref);if(r)return r;var p=String(x&&x.path||item&&item.path||'').replace(/^\/+/,'');var m=refs();return sha(m&&m[p]);}
function canDirect(x){if(!x||!x.path)return false;var c=String(x.codec||'').trim();return !c&&/\.txt(?:$|\?)/i.test(String(x.path||''));}
function urls(R,path,ref){var repo=String(R&&R.repo||'huoguotiankong/asset-core-7f3'),p=String(path||'').replace(/^\/+/,'');if(ref){return[
 'https://raw.githubusercontent.com/'+repo+'/'+ref+'/'+p,
 'https://github.com/'+repo+'/raw/'+ref+'/'+p,
 'https://cdn.jsdelivr.net/gh/'+repo+'@'+ref+'/'+p
];}
var ts=Date.now();return[
 'https://raw.githubusercontent.com/'+repo+'/main/'+p+'?_import='+ts,
 'https://github.com/'+repo+'/raw/main/'+p+'?_import='+ts,
 'https://cdn.jsdelivr.net/gh/'+repo+'@main/'+p+'?_import='+ts
];}
function saveDiag(o){try{setItem(DIAG_KEY,JSON.stringify(o||{}));}catch(e){}}
function fetchRule(R,path,ref){
 var us=urls(R,path,ref),start=Date.now(),rs=null,i,t,err=[];
 if(typeof batchFetch==='function'){
  try{
   var reqs=[];for(i=0;i<us.length;i++)reqs.push({url:us[i],options:{timeout:2600,headers:{'Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'}}});
   rs=batchFetch(reqs);
   for(i=0;i<(rs||[]).length;i++){t=String(rs[i]==null?'':rs[i]);if(isRule(t)){saveDiag({time:Date.now(),elapsed:Date.now()-start,mode:'batch-fixed-payload',mirror:i+1,bytes:t.length,ref:ref||'main',path:path});return t;}}
  }catch(e0){err.push('batch:'+String(e0.message||e0));}
 }
 for(i=0;i<us.length;i++){
  try{t=String(fetch(us[i],{timeout:1800,headers:{'Cache-Control':'no-cache, no-store, max-age=0',Pragma:'no-cache'}})||'');if(isRule(t)){saveDiag({time:Date.now(),elapsed:Date.now()-start,mode:'seq-fixed-payload',mirror:i+1,bytes:t.length,ref:ref||'main',path:path});return t;}err.push((i+1)+':invalid');}catch(e1){err.push((i+1)+':'+String(e1.message||e1));}
 }
 saveDiag({time:Date.now(),elapsed:Date.now()-start,mode:'failed',ref:ref||'main',path:path,error:err.join(' | ')});
 throw new Error('规则正文三镜像均不可用：'+err.join(' | '));
}
function record(R,item){try{if(typeof R.recordRecent==='function')R.recordRecent(item);}catch(e){}try{if(typeof R.recordInstalled==='function')R.recordInstalled(item);}catch(e2){}try{if(typeof R.recordImportHistory==='function')R.recordImportHistory(item);}catch(e3){}}
function testOf(x){var a=x&&x.channels||[];for(var i=0;i<a.length;i++)if(String(a[i]&&a[i].channel||'')==='test')return a[i];return null;}
function buildOf(x){var t=testOf(x);return Number(t&&t.build||0);}
function currentMeta(){return{schema:4,id:'rule-repo',name:'我的规则仓库',namingPolicy:'rule-repo-split-name-exception',versionPolicy:'stable-test-local-lineage-v1',updatedAt:'2026-08-25 13:55',channels:[{channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.5',build:389,displayVersion:'Stable 3.5.5 · Build 389 · 恢复稳定推荐',path:'apps/tools/rule-repo/rule_repo_remote_v355.txt',mode:'remote',updatedAt:'2026-08-24',recommended:true,desc:'已验证稳定基线'},{channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:VERSION,baseVersion:'3.5.5',targetVersion:'3.5.6',build:BUILD,displayVersion:'Test '+VERSION+' · Build '+BUILD+' · Direct Payload Import',path:'apps/tools/rule-repo/rule_repo_test_v169.txt',mode:'remote-local-first-native-require',updatedAt:'2026-08-25',recommended:false,desc:'固定 ref 三镜像并行抓取规则正文，直接返回 home_rule payload'}]};}
function apply(R){
 if(!R||typeof R.importRule!=='function')throw new Error('规则仓 Runtime 不完整');
 if(R.__rc32DirectPayload){R.version=VERSION;R.build=BUILD;return R;}
 var baseImport=R.importRule,baseNative=R.nativeImportUrl,baseFast=R.fastItemState,baseCache=R.fastChannelCache,baseChannel=R.channelMeta;
 R.__rc32DirectPayload=true;R.version=VERSION;R.build=BUILD;R.channel='test';R.releaseLabel='Single Workspace 18.4 · Direct Payload Import';R.localFirstRuntimeVersion='18.4';R.fastHomeVersion='18.4.0';R.isTestChannel=function(){return true;};
 R.importRule=function(raw){
  var x,item,ref,text;
  try{x=typeof raw==='string'?JSON.parse(raw):raw;x=x&&x.raw?x.raw:x;if(canDirect(x)){item=this.normalizeItem(x,0);ref=refOf(x,item);text=fetchRule(this,x.path||item.path,ref);record(this,item);return text;}}catch(e){return'toast://导入失败：'+String(e.message||e);}
  return baseImport.call(this,raw);
 };
 R.nativeImportUrl=function(raw){var x;try{x=typeof raw==='string'?JSON.parse(raw):raw;x=x&&x.raw?x.raw:x;if(canDirect(x))return'';}catch(e){}return typeof baseNative==='function'?baseNative.call(this,raw):'';};
 R.importRefOf=function(raw){try{var x=typeof raw==='string'?JSON.parse(raw):raw;x=x&&x.raw?x.raw:x;return refOf(x,this.normalizeItem(x,0));}catch(e){return'';}};
 R.lastImportDiag=function(){try{return parse(getItem(DIAG_KEY,'{}'))||{};}catch(e){return{};}};
 var oldFast=baseFast,oldCache=baseCache,oldChannel=baseChannel,oldFallback=R.ruleRepoChannelFallback;
 function selfMeta(){var x=null;try{if(typeof oldFallback==='function')x=oldFallback.call(R);}catch(e){}return x&&buildOf(x)>=BUILD?x:currentMeta();}
 R.ruleRepoChannelFallback=function(){return selfMeta();};
 R.fastChannelCache=function(item){if(String(item&&item.id||'')==='rule-repo')return{schema:17,time:Date.now(),revision:'self-direct-'+buildOf(selfMeta()),sig:'rule-repo-self-direct',meta:selfMeta()};return oldCache.call(this,item);};
 R.channelMeta=function(item){if(String(item&&item.id||'')==='rule-repo')return selfMeta();return oldChannel.call(this,item);};
 R.fastItemState=function(item){var s=oldFast.call(this,item);if(String(item&&item.id||'')==='rule-repo'){s=s||{};s.installed=true;s.channel='test';s.installedVersion=VERSION;s.installedBuild=BUILD;var meta=selfMeta(),t=testOf(meta),tb=Number(t&&t.build||0);s.targetChannel='test';s.targetVersion=String(t&&t.version||VERSION);s.targetBuild=tb||BUILD;s.update=(tb||BUILD)>BUILD;s.updateKnown=true;s.recognized=true;}return s;};
 return R;
}
return{version:'1.0.0',apply:apply,refOf:function(path){var m=refs();return sha(m&&m[String(path||'').replace(/^\/+/,'')]);},lastDiag:function(){try{return parse(getItem(DIAG_KEY,'{}'))||{};}catch(e){return{};}}};
})();
