/* XVideos 0.1.1-test.1 Test7-derived Native Local-First bundle builder */
var XVideosLocalBuilder=(function(){
var VERSION='0.1.1-test.1',BUILD=10201,REF='fe11b01997a0e3ff82885dddca0a36a078c5f774';
var ROOT='hiker://files/rules/asset-core-local/xvideos-test/b10201/';
var RUNTIME=ROOT+'runtime_bundle.js',META=ROOT+'bundle_meta.json',BOOT=ROOT+'local_bootstrap.js',ASSET_ROOT=ROOT+'assets/';
var MODULES=[
'apps/video/xvideos/releases/0.1.0-test.1/core.js',
'apps/video/xvideos/releases/0.1.0-test.1/runtime.js',
'apps/video/xvideos/releases/0.1.0-test.2/core_patch.js',
'apps/video/xvideos/releases/0.1.0-test.2/runtime_patch.js',
'apps/video/xvideos/releases/0.1.0-test.3/core_product_patch.js',
'apps/video/xvideos/releases/0.1.0-test.3/ui_product_patch.js',
'apps/video/xvideos/releases/0.1.0-test.3/route_patch.js',
'apps/video/xvideos/releases/0.1.0-test.4/core_account_patch.js',
'apps/video/xvideos/releases/0.1.0-test.4/ui_account_patch.js',
'apps/video/xvideos/releases/0.1.0-test.5/core_rescue_patch.js',
'apps/video/xvideos/releases/0.1.0-test.5/ui_rescue_patch.js',
'apps/video/xvideos/releases/0.1.0-test.6/core_feature_patch.js',
'apps/video/xvideos/releases/0.1.0-test.6/ui_feature_patch.js',
'apps/video/xvideos/releases/0.1.0-test.7/core_protocol_patch.js',
'apps/video/xvideos/releases/0.1.0-test.7/ui_protocol_patch.js',
'apps/video/xvideos/releases/0.1.1-test.1/final_local_patch.js'];
var MARKERS={};
MARKERS[MODULES[0]]='XVideos Remote Core 0.1.0-test.1 - clean architecture';
MARKERS[MODULES[1]]='XVideos Remote Runtime 0.1.0-test.1';
MARKERS[MODULES[2]]='XVideos Core Patch 0.1.0-test.2 - current video URL/frame-block parser';
MARKERS[MODULES[3]]='XVideos Runtime Patch 0.1.0-test.2';
MARKERS[MODULES[4]]='XVideos Core Product Patch 0.1.0-test.3';
MARKERS[MODULES[5]]='XVideos UI/Product Patch 0.1.0-test.3';
MARKERS[MODULES[6]]='XVideos Test3 generic route patch';
MARKERS[MODULES[7]]='XVideos Account/Pagination Core Patch 0.1.0-test.4';
MARKERS[MODULES[8]]='XVideos Product/Account UI Patch 0.1.0-test.4';
MARKERS[MODULES[9]]='XVideos Core Rescue/Product Patch 0.1.0-test.5';
MARKERS[MODULES[10]]='XVideos UI/Product Rescue Patch 0.1.0-test.5';
MARKERS[MODULES[11]]='XVideos Core Feature Patch 0.1.0-test.6';
MARKERS[MODULES[12]]='XVideos UI Feature Patch 0.1.0-test.6';
MARKERS[MODULES[13]]='XVideos Core Protocol Patch 0.1.0-test.7';
MARKERS[MODULES[14]]='XVideos UI Protocol Patch 0.1.0-test.7';
MARKERS[MODULES[15]]='XVideos 0.1.1-test.1 Test7-derived Native Local-First overlay';
var ASSETS=['account.svg','banner.svg','best.svg','brand.svg','categories.svg','channels.svg','comments.svg','creators.svg','favorite.svg','globe.svg','history.svg','localfav.svg','localhistory.svg','new.svg','play.svg','playlist.svg','profiles.svg','rating.svg','refresh.svg','search.svg','settings.svg','videos.svg','views.svg','watchlater.svg'];
var ASSET_PATHS=[],i;for(i=0;i<ASSETS.length;i++)ASSET_PATHS.push('apps/video/xvideos/assets/'+ASSETS[i]);
var SOURCES=MODULES.concat(ASSET_PATHS);
function bodyOf(v){if(v&&typeof v==='object'){if(v.body!==undefined)return String(v.body||'');if(v.content!==undefined)return String(v.content||'');}return String(v==null?'':v);}
function bad(t){t=bodyOf(t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Request\s+(?:failed|error)|Fetch\s+(?:failed|error)|Network\s+(?:failed|error)|Timeout\b|ETIMEDOUT\b|ECONN|ENOTFOUND\b|Forbidden\b|Unauthorized\b|Rate\s*limit\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t)||/^\{\s*"(?:message|error)"\s*:/i.test(t);}
function valid(path,t){t=bodyOf(t);if(bad(t))return false;if(/\.js$/i.test(path)){var mk=MARKERS[path]||'';return t.length>40&&(!mk||t.indexOf(mk)>=0);}if(/\.svg$/i.test(path))return t.length>40&&t.indexOf('<svg')>=0;return t.length>0;}
function parse(s,d){try{return JSON.parse(String(s||''));}catch(e){return d;}}
function urls(path){return['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+REF+'/'+path,'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+REF+'/'+path,'https://github.com/huoguotiankong/asset-core-7f3/raw/'+REF+'/'+path];}
function one(path){var us=urls(path),es=[];for(var i=0;i<us.length;i++){try{var s=bodyOf(fetch(us[i],{timeout:i===0?5000:7000,headers:{'Cache-Control':'public, max-age=31536000, immutable'}}));if(valid(path,s))return s;es.push((i+1)+':invalid');}catch(e){es.push((i+1)+':'+String(e.message||e));}}throw new Error(path+' 下载失败：'+es.join(' | '));}
function all(paths){var out=[],reqs=[],rs=null,i;for(i=0;i<paths.length;i++)reqs.push({url:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+REF+'/'+paths[i],options:{timeout:7000,headers:{'Cache-Control':'public, max-age=31536000, immutable'}}});try{if(typeof batchFetch==='function')rs=batchFetch(reqs);}catch(e){rs=null;}for(i=0;i<paths.length;i++){var s=rs&&rs[i]!=null?bodyOf(rs[i]):'';if(!valid(paths[i],s))s=one(paths[i]);out.push(s);}return out;}
function mapSources(texts){var m={},i;for(i=0;i<SOURCES.length;i++)m[SOURCES[i]]=texts[i];return m;}
function rep(s,a,b){return String(s).split(a).join(b);}
function q(s){return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");}
function count(s,needle){var n=0,p=0;s=String(s);while((p=s.indexOf(needle,p))>=0){n++;p+=needle.length;}return n;}
function repoContext(s){s=String(s);var keys=['raw.githubusercontent.com/huoguotiankong/asset-core-7f3','cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3','github.com/huoguotiankong/asset-core-7f3/raw','libs/updater/remote_manager.js','bootstrap_test_v1_b10101.js','bootstrap_test_v2_b10102.js','bootstrap_test_v3_b10103.js','bootstrap_test_v4_b10104.js','bootstrap_test_v5_b10105.js','bootstrap_test_v6_b10106.js','bootstrap_test_v7_b10107.js'],i,x=-1,k='';for(i=0;i<keys.length;i++){var z=s.indexOf(keys[i]);if(z>=0&&(x<0||z<x)){x=z;k=keys[i];}}if(x<0)return'';return k+' @ '+s.substring(Math.max(0,x-120),Math.min(s.length,x+300)).replace(/[\r\n]+/g,' ');}
function sanitizeModule(path,src){
  var s=String(src||''),before=s,lb=getPath(BOOT),lr=ROOT,ar=ASSET_ROOT;
  var rawAsset='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/xvideos/assets/';
  var cdnAsset='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/xvideos/assets/';
  var webAsset='https://github.com/huoguotiankong/asset-core-7f3/raw/refs/heads/main/apps/video/xvideos/assets/';
  var webAsset2='https://github.com/huoguotiankong/asset-core-7f3/raw/main/apps/video/xvideos/assets/';
  var rawRoot='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/xvideos/';
  var cdnRoot='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/xvideos/';
  var webRoot='https://github.com/huoguotiankong/asset-core-7f3/raw/refs/heads/main/apps/video/xvideos/';
  var webRoot2='https://github.com/huoguotiankong/asset-core-7f3/raw/main/apps/video/xvideos/';
  var localAssign="C.bootstrap='"+q(lb)+"';";
  s=s.replace(/C\.bootstrap\s*=\s*ROOT\s*\+\s*['"]bootstrap_[^'"]+['"]\s*;/g,localAssign);
  s=s.replace(/C\.bootstrap\s*=\s*['"][^'"]*bootstrap_[^'"]+['"]\s*;/g,localAssign);
  s=s.replace(/https:\/\/raw\.githubusercontent\.com\/huoguotiankong\/asset-core-7f3\/main\/apps\/video\/xvideos\/bootstrap_[A-Za-z0-9_.-]+\.js(?:\?v=[0-9]+)?/g,lb);
  s=s.replace(/https:\/\/cdn\.jsdelivr\.net\/gh\/huoguotiankong\/asset-core-7f3@main\/apps\/video\/xvideos\/bootstrap_[A-Za-z0-9_.-]+\.js(?:\?v=[0-9]+)?/g,lb);
  s=s.replace(/https:\/\/github\.com\/huoguotiankong\/asset-core-7f3\/raw\/(?:refs\/heads\/)?main\/apps\/video\/xvideos\/bootstrap_[A-Za-z0-9_.-]+\.js(?:\?v=[0-9]+)?/g,lb);
  s=rep(s,rawAsset,ar);s=rep(s,cdnAsset,ar);s=rep(s,webAsset,ar);s=rep(s,webAsset2,ar);
  s=rep(s,rawRoot,lr);s=rep(s,cdnRoot,lr);s=rep(s,webRoot,lr);s=rep(s,webRoot2,lr);
  var ctx=repoContext(s);if(ctx)throw new Error(path+' 去远程化后仍有残留：'+ctx);
  return{text:s,rewrites:count(before,'raw.githubusercontent.com/huoguotiankong/asset-core-7f3')+count(before,'cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3')+count(before,'github.com/huoguotiankong/asset-core-7f3/raw')};
}
function assertLocalRuntime(s){var ctx=repoContext(s);if(ctx)throw new Error('Runtime 仍残留远程代码/资产依赖：'+ctx);}
function buildRuntime(m){var parts=[],i,r,total=0;for(i=0;i<MODULES.length;i++){if(!valid(MODULES[i],m[MODULES[i]]))throw new Error(MODULES[i]+' 源码 marker/正文校验失败');r=sanitizeModule(MODULES[i],m[MODULES[i]]);parts.push(r.text);total+=r.rewrites;}var runtime="/* XVideos "+VERSION+" generated Test7 Local-First runtime · "+REF+" */\n"+parts.join('\n\n')+"\n\nvar XVideosLocalRuntime={version:'"+VERSION+"',build:"+BUILD+",sourceRef:'"+REF+"',localFirstVersion:'"+VERSION+"',localFirstBuild:"+BUILD+",module:function(){return XVideosRemoteRuntime.module();},core:function(){return XVideosCore;},runtime:function(){return XVideosRemoteRuntime;}};\nif(typeof $!=='undefined')$.exports=XVideosLocalRuntime;\n";assertLocalRuntime(runtime);return{runtime:runtime,rewrites:total};}
function buildBootstrap(){var rp=q(getPath(RUNTIME));return "/* XVideos "+VERSION+" local Bootstrap Shim */\nvar __XVideosLocalRuntime=require('"+rp+"');\nif((!__XVideosLocalRuntime||typeof __XVideosLocalRuntime.module!=='function')&&typeof XVideosLocalRuntime==='object')__XVideosLocalRuntime=XVideosLocalRuntime;\nif(!__XVideosLocalRuntime||typeof __XVideosLocalRuntime.core!=='function')throw new Error('XVideos Local Runtime unavailable');\nvar XVideosCore=__XVideosLocalRuntime.core();\nvar XVideosRemoteRuntime=__XVideosLocalRuntime.runtime();\nvar XVideosBoot={loadOnly:function(){return __XVideosLocalRuntime;},module:function(){return __XVideosLocalRuntime.module();},info:function(){return{version:'"+VERSION+"',build:"+BUILD+",mode:'local-first'};},check:function(){return{message:'Local-First Test 由我的规则仓库统一检查更新'};},update:function(){return{message:'请在我的规则仓库执行轻同步'};},rollback:function(){return{message:'请从我的规则仓库覆盖上一测试版'};},reinstall:function(){return{message:'请在本地化诊断执行重建本地包'};}};\n";}
function meta(){try{if(!fileExist(META)||!fileExist(RUNTIME)||!fileExist(BOOT))return null;var m=parse(readFile(META),null);if(!m||Number(m.build||0)!==BUILD||String(m.version||'')!==VERSION||String(m.sourceRef||'')!==REF)return null;for(var i=0;i<ASSETS.length;i++)if(!fileExist(ASSET_ROOT+ASSETS[i]))return null;return m;}catch(e){return null;}}
function install(force){var old=meta();if(old&&!force)return old;var tx=all(SOURCES),m=mapSources(tx),built=buildRuntime(m),runtime=built.runtime,boot=buildBootstrap(),i,p;writeFile(RUNTIME,runtime);if(!fileExist(RUNTIME))throw new Error('Runtime bundle 写入失败');writeFile(BOOT,boot);if(!fileExist(BOOT))throw new Error('Local Bootstrap 写入失败');for(i=0;i<ASSETS.length;i++){p=ASSET_ROOT+ASSETS[i];writeFile(p,m[ASSET_PATHS[i]]);if(!fileExist(p))throw new Error(ASSETS[i]+' 写入失败');}var info={schema:2,version:VERSION,build:BUILD,sourceRef:REF,sources:SOURCES.length,modules:MODULES.length,assets:ASSETS.length,bytes:runtime.length,rewrites:built.rewrites,installedAt:Date.now(),runtime:RUNTIME,bootstrap:BOOT,assetRoot:ASSET_ROOT,controlPlane:'local-bootstrap-shim',businessBase:'Test7 0.1.0-test.7 / Build10107',sanitizer:'strict-marker+bootstrap-expression+asset-root+app-root-v4',detailPlaybackBase:'Test5/Test6 verified chain preserved',protocolBase:'Test7 XVideos short-key/XHR/WebView contracts preserved'};writeFile(META,JSON.stringify(info));var back=meta();if(!back)throw new Error('bundle meta 回读失败');return back;}
function req(p){var u=getPath(p),r=null;try{r=require(u);}catch(e0){try{deleteCache(u);}catch(e1){}r=require(u);}return r;}
function load(){var m=install(false),r=req(RUNTIME);if((!r||typeof r.module!=='function')&&typeof XVideosLocalRuntime==='object')r=XVideosLocalRuntime;if(!r||String(r.localFirstVersion||'')!==VERSION||Number(r.localFirstBuild||0)!==BUILD)throw new Error('XVideos Local-First runtime preflight failed');return{meta:m,runtime:r};}
function reset(){try{if(fileExist(RUNTIME))deleteFile(RUNTIME);}catch(e){}try{if(fileExist(BOOT))deleteFile(BOOT);}catch(e2){}try{if(fileExist(META))deleteFile(META);}catch(e3){}for(var i=0;i<ASSETS.length;i++){try{if(fileExist(ASSET_ROOT+ASSETS[i]))deleteFile(ASSET_ROOT+ASSETS[i]);}catch(ex){}}return true;}
return{version:VERSION,build:BUILD,sourceRef:REF,install:install,load:load,meta:meta,reset:reset,runtime:RUNTIME,bootstrap:BOOT,assetRoot:ASSET_ROOT,sources:SOURCES,assets:ASSETS};
})();
