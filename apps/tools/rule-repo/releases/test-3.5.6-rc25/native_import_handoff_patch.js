/* 我的规则仓库 3.5.6-rc25 - Native Import Handoff */
var RuleRepoRC25=(function(){
  var VERSION='3.5.6-rc25',BUILD=415;
  var CATALOG='hiker://files/rules/asset-core-local/rule-repo-test/channel_catalog_v2.json';
  var MANIFEST_KEY='hc_repo_manifest_v3';
  var MANIFEST_TS_KEY='hc_repo_manifest_v3_ts';
  function selfMeta(){return{schema:4,id:'rule-repo',name:'我的规则仓库',updatedAt:'2026-08-25 00:33',channels:[
    {channel:'stable',label:'正式版',id:'rule-repo',name:'我的规则仓库',version:'3.5.5',build:389,displayVersion:'正式版 3.5.5 · Build 389',path:'apps/tools/rule-repo/rule_repo_remote_v355.txt',mode:'remote',updatedAt:'2026-08-24',recommended:true},
    {channel:'test',label:'测试版',id:'rule-repo-test',name:'我的规则仓库·测试版',version:VERSION,build:BUILD,displayVersion:'测试版 '+VERSION+' · Build '+BUILD,path:'apps/tools/rule-repo/rule_repo_test_v162.txt',mode:'remote-local-first',updatedAt:'2026-08-25',recommended:false,baseVersion:'3.5.5',targetVersion:'3.5.6'}
  ]};}
  function parse(s){try{var x=JSON.parse(String(s||''));return x&&typeof x==='object'?x:null;}catch(e){return null;}}
  function saveJson(path,o){try{writeFile(path,JSON.stringify(o));return fileExist(path);}catch(e){return false;}}
  function patchCatalog(){try{if(!fileExist(CATALOG))return false;var c=parse(fetch(CATALOG));if(!c)return false;c.apps=c.apps||{};c.apps['rule-repo']=selfMeta();return saveJson(CATALOG,c);}catch(e){return false;}}
  function patchManifest(){try{var m=parse(getItem(MANIFEST_KEY,''));if(!m||!Array.isArray(m.items))return false;for(var i=0;i<m.items.length;i++){var x=m.items[i]||{};if(String(x.id||'')==='rule-repo'){x.version='Stable 3.5.5 / Test '+VERSION;x.desc='Stable 3.5.5 保持冻结；Test '+VERSION+' 保留 Local-First、轻同步与本地图标包，并将普通程序导入改为海阔原生 home_rule_url 交接，规则仓库不再在 lazyRule 内串行下载完整规则。';x.updatedAt='2026-08-25';}else if(String(x.id||'')==='rule-repo-test-upgrade'){x.name='规则仓库 RC25 升级';x.version='Test '+VERSION+' · Build'+BUILD;x.desc='仅用于从 RC24 覆盖升级到 RC25。RC25 修复导入小程序时前台长时间阻塞：普通 Remote/Test/Stable 规则改由海阔原生导入器直接读取版本化 Shell。';x.path='apps/tools/rule-repo/rule_repo_test_v162.txt';x.updatedAt='2026-08-25';}}setItem(MANIFEST_KEY,JSON.stringify(m));setItem(MANIFEST_TS_KEY,String(Date.now()));return true;}catch(e){return false;}}
  function nativeUrl(R,x,item){var p=String(x&&x.path||'').replace(/^\/+/,''),repo=String(R&&R.repo||'huoguotiankong/asset-core-7f3'),v=encodeURIComponent(String(item&&item.version||x&&x.version||BUILD));return'https://cdn.jsdelivr.net/gh/'+repo+'@main/'+p+'?v='+v;}
  function nativeMouth(R,x,item){return'海阔视界，首页频道合集￥home_rule_url￥'+nativeUrl(R,x,item);}
  function canNative(x){if(!x||!x.path)return false;var c=String(x.codec||'').trim();if(c)return false;return /\.txt(?:$|\?)/i.test(String(x.path||''));}
  function apply(R){
    if(!R||typeof R.importRule!=='function')throw new Error('HikerRuleRepo未导出');
    if(R.__rc25NativeImport){R.version=VERSION;R.build=BUILD;return R;}
    var baseImport=R.importRule,baseFast=R.fastChannelCache,baseSync=R.syncManifest,baseLight=R.lightSync;
    R.__rc25NativeImport=true;R.version=VERSION;R.build=BUILD;R.channel='test';R.releaseLabel='Single Workspace 16.8 · Native Import Handoff';R.localFirstRuntimeVersion='16.8';R.fastHomeVersion='16.8.0';R.isTestChannel=function(){return true;};
    R.ruleRepoChannelFallback=function(){return selfMeta();};
    R.fastChannelCache=function(item){if(String(item&&item.id||'')==='rule-repo')return{schema:10,time:Date.now(),revision:'self-rc25',sig:this.channelCacheSignature?this.channelCacheSignature(item):'rule-repo',meta:selfMeta()};return typeof baseFast==='function'?baseFast.call(this,item):null;};
    R.importRule=function(raw){
      var x;
      try{x=typeof raw==='string'?JSON.parse(raw):raw;x=x&&x.raw?x.raw:x;if(canNative(x)){
        var item=this.normalizeItem(x,0);this.recordRecent(item);this.recordInstalled(item);this.recordImportHistory(item);return nativeMouth(this,x,item);
      }}catch(e){return'toast://导入准备失败：'+String(e.message||e);}
      return baseImport.call(this,raw);
    };
    R.nativeImportUrl=function(raw){var x=typeof raw==='string'?JSON.parse(raw):raw;x=x&&x.raw?x.raw:x;return canNative(x)?nativeMouth(this,x,this.normalizeItem(x,0)):'';};
    R.syncManifest=function(){var z=typeof baseSync==='function'?baseSync.call(this):{ok:false};patchCatalog();patchManifest();return z;};
    R.lightSync=function(){var z=typeof baseLight==='function'?baseLight.call(this):(typeof baseSync==='function'?baseSync.call(this):{ok:false});patchCatalog();patchManifest();return z;};
    patchCatalog();patchManifest();
    return R;
  }
  return{version:'1.0.0',apply:apply,selfMeta:selfMeta,nativeMouth:nativeMouth};
})();
