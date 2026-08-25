/* 我的规则仓库 3.5.6-rc30 - Immutable Import Fast Path */
var RuleRepoRC30=(function(){
var VERSION='3.5.6-rc30',BUILD=420,RULE='apps/tools/rule-repo/rule_repo_test_v167.txt';
var REF_FILE='hiker://files/rules/asset-core-local/rule-repo-test/import_ref_catalog_v1.json';
function clone(x){try{return JSON.parse(JSON.stringify(x));}catch(e){return x||{};}}
function parse(s){try{var x=JSON.parse(String(s||''));return x&&typeof x==='object'?x:null;}catch(e){return null;}}
function testOf(x){var a=x&&x.channels||[];for(var i=0;i<a.length;i++)if(String(a[i]&&a[i].channel||'')==='test')return a[i];return null;}
function buildOf(x){var t=testOf(x);return Number(t&&t.build||0);}
function currentMeta(){return{schema:4,id:'rule-repo',name:'我的规则仓库',namingPolicy:'rule-repo-split-name-exception',versionPolicy:'stable-test-local-lineage-v1',updatedAt:'2026-08-25 09:21',channels:[
{channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.5',build:389,displayVersion:'Stable 3.5.5 · Build 389 · 恢复稳定推荐',path:'apps/tools/rule-repo/rule_repo_remote_v355.txt',mode:'remote',updatedAt:'2026-08-24',recommended:true,desc:'已验证稳定基线'},
{channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:VERSION,baseVersion:'3.5.5',targetVersion:'3.5.6',build:BUILD,displayVersion:'Test '+VERSION+' · Build '+BUILD+' · Import Fast Path',path:RULE,mode:'remote-local-first-native-require',updatedAt:'2026-08-25',recommended:false,desc:'固定 commit SHA 的不可变导入地址；移除普通导入热路径 @main 分支解析'}
]};}
function effective(){var cur=currentMeta(),feed=null;try{if(typeof RuleRepoRC29==='object'&&typeof RuleRepoRC29.current==='function')feed=RuleRepoRC29.current();}catch(e){}return feed&&buildOf(feed)>=BUILD?clone(feed):cur;}
function currentRefs(){try{if(!fileExist(REF_FILE))return null;var x=parse(fetch(REF_FILE));return x&&x.refs&&typeof x.refs==='object'?x.refs:null;}catch(e){return null;}}
function sha(s){s=String(s||'').trim();return /^[0-9a-f]{40}$/i.test(s)?s:'';}
function refOf(x,item){
  var r=sha(x&&x.importRef)||sha(item&&item.importRef)||sha(x&&x.ref)||sha(item&&item.ref);
  if(r)return r;
  var p=String(x&&x.path||item&&item.path||'').replace(/^\/+/,'');
  var refs=currentRefs();
  return sha(refs&&refs[p]);
}
function canNative(x){if(!x||!x.path)return false;var c=String(x.codec||'').trim();if(c)return false;return /\.txt(?:$|\?)/i.test(String(x.path||''));}
function url(R,x,item,ref){
  var p=String(x&&x.path||item&&item.path||'').replace(/^\/+/,'');
  var repo=String(R&&R.repo||'huoguotiankong/asset-core-7f3');
  return'https://cdn.jsdelivr.net/gh/'+repo+'@'+ref+'/'+p;
}
function mouth(R,x,item,ref){return'海阔视界，首页频道合集￥home_rule_url￥'+url(R,x,item,ref);}
function record(R,item){try{if(typeof R.recordRecent==='function')R.recordRecent(item);}catch(e){}try{if(typeof R.recordInstalled==='function')R.recordInstalled(item);}catch(e2){}try{if(typeof R.recordImportHistory==='function')R.recordImportHistory(item);}catch(e3){}}
function apply(R){
  if(!R||typeof R.importRule!=='function')throw new Error('规则仓 Runtime 不完整');
  if(R.__rc30ImportFast){R.version=VERSION;R.build=BUILD;return R;}
  var baseImport=R.importRule,baseNative=R.nativeImportUrl,baseFast=R.fastItemState,baseCache=R.fastChannelCache,baseChannel=R.channelMeta,baseAction=R.workspaceAction;
  R.__rc30ImportFast=true;R.version=VERSION;R.build=BUILD;R.channel='test';R.releaseLabel='Single Workspace 18.2 · Immutable Import Fast Path';R.localFirstRuntimeVersion='18.2';R.fastHomeVersion='18.2.0';R.isTestChannel=function(){return true;};
  R.ruleRepoChannelFallback=function(){return effective();};
  R.fastChannelCache=function(item){if(String(item&&item.id||'')==='rule-repo')return{schema:15,time:Date.now(),revision:'self-fast-'+buildOf(effective()),sig:'rule-repo-self-fast',meta:effective()};return baseCache.call(this,item);};
  R.channelMeta=function(item){if(String(item&&item.id||'')==='rule-repo')return effective();return typeof baseChannel==='function'?baseChannel.call(this,item):null;};
  R.fastItemState=function(item){if(String(item&&item.id||'')!=='rule-repo')return baseFast.call(this,item);var m=effective(),t=testOf(m),tb=Number(t&&t.build||0);return{group:true,installed:true,channel:'test',installedVersion:VERSION,installedBuild:BUILD,targetChannel:'test',targetVersion:String(t&&t.version||VERSION),targetBuild:tb||BUILD,update:tb>BUILD,updateKnown:true,recognized:true,ruleVersion:0};};
  R.importRule=function(raw){
    var x,item,ref;
    try{x=typeof raw==='string'?JSON.parse(raw):raw;x=x&&x.raw?x.raw:x;if(canNative(x)){item=this.normalizeItem(x,0);ref=refOf(x,item);if(ref){record(this,item);return mouth(this,x,item,ref);}}}catch(e){return'toast://导入准备失败：'+String(e.message||e);}
    return baseImport.call(this,raw);
  };
  R.nativeImportUrl=function(raw){
    var x,item,ref;
    try{x=typeof raw==='string'?JSON.parse(raw):raw;x=x&&x.raw?x.raw:x;if(canNative(x)){item=this.normalizeItem(x,0);ref=refOf(x,item);if(ref)return mouth(this,x,item,ref);}}catch(e){}
    return typeof baseNative==='function'?baseNative.call(this,raw):'';
  };
  R.importRefOf=function(raw){try{var x=typeof raw==='string'?JSON.parse(raw):raw;x=x&&x.raw?x.raw:x;return refOf(x,this.normalizeItem(x,0));}catch(e){return'';}};
  R.workspaceAction=function(kind,item){
    if(String(kind||'')==='check'&&String(item&&item.id||'')==='rule-repo')return $('#noLoading#').lazyRule(function(){var loading=false;try{showLoading('正在检查测试仓新版本…');loading=true;var F='hiker://files/rules/asset-core-local/rule-repo-test/rc30_import_fast_path_patch.js',u=getPath(F);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}if(typeof RuleRepoRC30!=='object')throw new Error('RC30 导入加速层未导出');var m=RuleRepoRC30.current(),t=m&&m.channels||[],v='',b=0;for(var i=0;i<t.length;i++)if(String(t[i]&&t[i].channel||'')==='test'){v=String(t[i].version||'');b=Number(t[i].build||0);break;}hideLoading();loading=false;try{refreshPage(false);}catch(_e){}return'toast://测试仓版本已刷新 · '+(v||'--')+' / Build'+b;}catch(e){if(loading)try{hideLoading();}catch(_e2){}return'toast://检查失败，继续使用当前版本：'+String(e.message||e);}}); 
    return baseAction.call(this,kind,item);
  };
  return R;
}
return{version:'1.0.0',apply:apply,current:effective,selfMeta:currentMeta,refOf:function(path){var refs=currentRefs();return sha(refs&&refs[String(path||'').replace(/^\/+/,'')]);}};
})();
