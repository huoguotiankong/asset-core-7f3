/* 911爆料 0.1.1-test.1 Test5-derived Native Local-First bundle builder */
var Bl911LocalBuilder=(function(){
var VERSION='0.1.1-test.1',BUILD=10201,REF='be9b1266095b28700be208d365c3bb97e339fa49';
var ROOT='hiker://files/rules/asset-core-local/911baoliao-test/b10201/';
var RUNTIME=ROOT+'runtime_bundle.js',META=ROOT+'bundle_meta.json',BOOT=ROOT+'local_bootstrap.js',ASSET_ROOT=ROOT+'assets/';
var MODULES=[
'apps/video/911baoliao/releases/0.1.0-test.1/core.js',
'apps/video/911baoliao/releases/0.1.0-test.1/runtime.js',
'apps/video/911baoliao/releases/0.1.0-test.2/route_patch.js',
'apps/video/911baoliao/releases/0.1.0-test.3/transport_patch.js',
'apps/video/911baoliao/releases/0.1.0-test.4/content_adapter_patch.js',
'apps/video/911baoliao/releases/0.1.0-test.4/test4_bootstrap_patch.js',
'apps/video/911baoliao/releases/0.1.0-test.5/site_adapter_patch.js',
'apps/video/911baoliao/releases/0.1.0-test.5/runtime_patch.js',
'apps/video/911baoliao/releases/0.1.1-test.1/final_local_patch.js'];
var MARKERS={};
MARKERS[MODULES[0]]='911爆料 Remote Core 0.1.0-test.1';
MARKERS[MODULES[1]]='911爆料 Remote Runtime 0.1.0-test.1';
MARKERS[MODULES[2]]='911爆料 0.1.0-test.2 - Hiker Chinese rule-name route fix';
MARKERS[MODULES[3]]='911爆料 0.1.0-test.3 - CDN/multi-mirror transport hotfix';
MARKERS[MODULES[4]]='911爆料 0.1.0-test.4 - feed/poster/media adapter hardening';
MARKERS[MODULES[5]]='911爆料 0.1.0-test.4 - runtime callback bootstrap pin';
MARKERS[MODULES[6]]='911爆料 0.1.0-test.5 - strict archive/article adapter';
MARKERS[MODULES[7]]='911爆料 0.1.0-test.5 - native playback handoff + strict cards';
MARKERS[MODULES[8]]='911爆料 0.1.1-test.1 Test5-derived Native Local-First overlay';
var ASSETS=['icon.svg'];
var ASSET_PATHS=['apps/video/911baoliao/assets/icon.svg'];
var SOURCES=MODULES.concat(ASSET_PATHS);
function bodyOf(v){if(v&&typeof v==='object'){if(v.body!==undefined)return String(v.body||'');if(v.content!==undefined)return String(v.content||'');}return String(v==null?'':v);}
function bad(t){t=bodyOf(t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Request\s+(?:failed|error)|Fetch\s+(?:failed|error)|Network\s+(?:failed|error)|Timeout\b|ETIMEDOUT\b|ECONN|ENOTFOUND\b|Forbidden\b|Unauthorized\b|Rate\s*limit\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t)||/^\{\s*"(?:message|error)"\s*:/i.test(t);}
function valid(path,t){t=bodyOf(t);if(bad(t))return false;if(/\.js$/i.test(path)){var mk=MARKERS[path]||'';return t.length>40&&(!mk||t.indexOf(mk)>=0);}if(/\.svg$/i.test(path))return t.length>40&&t.indexOf('<svg')>=0;return t.length>0;}
function parse(s,d){try{return JSON.parse(String(s||''));}catch(e){return d;}}
function urls(path){return['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+REF+'/'+path,'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+REF+'/'+path,'https://github.com/huoguotiankong/asset-core-7f3/raw/'+REF+'/'+path];}
function one(path){var us=urls(path),es=[];for(var i=0;i<us.length;i++){try{var s=bodyOf(fetch(us[i],{timeout:i===0?5000:7000,headers:{'Cache-Control':'public, max-age=31536000, immutable'}}));if(valid(path,s))return s;es.push((i+1)+':invalid');}catch(e){es.push((i+1)+':'+String(e.message||e));}}throw new Error(path+' 下载失败：'+es.join(' | '));}
function all(paths){var out=[],reqs=[],rs=null,i;for(i=0;i<paths.length;i++)reqs.push({url:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+REF+'/'+paths[i],options:{timeout:6500,headers:{'Cache-Control':'public, max-age=31536000, immutable'}}});try{if(typeof batchFetch==='function')rs=batchFetch(reqs);}catch(e){rs=null;}for(i=0;i<paths.length;i++){var s=rs&&rs[i]!=null?bodyOf(rs[i]):'';if(!valid(paths[i],s))s=one(paths[i]);out.push(s);}return out;}
function mapSources(texts){var m={},i;for(i=0;i<SOURCES.length;i++)m[SOURCES[i]]=texts[i];return m;}
function rep(s,a,b){return String(s).split(a).join(b);}
function q(s){return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");}
function count(s,needle){var n=0,p=0;s=String(s);while((p=s.indexOf(needle,p))>=0){n++;p+=needle.length;}return n;}
function repoContext(s){s=String(s);var keys=['raw.githubusercontent.com/huoguotiankong/asset-core-7f3','cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3','github.com/huoguotiankong/asset-core-7f3/raw','libs/updater/remote_manager.js','libs/updater/v2.0.2/remote_manager.js'],i,x=-1,k='';for(i=0;i<keys.length;i++){var z=s.indexOf(keys[i]);if(z>=0&&(x<0||z<x)){x=z;k=keys[i];}}if(x<0)return'';return k+' @ '+s.substring(Math.max(0,x-100),Math.min(s.length,x+240)).replace(/[\r\n]+/g,' ');}
function sanitizeModule(path,src){
  var s=String(src||''),before=s,lb=getPath(BOOT),ar=ASSET_ROOT;
  var rawAsset='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/911baoliao/assets/';
  var cdnAsset='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/911baoliao/assets/';
  var webAsset='https://github.com/huoguotiankong/asset-core-7f3/raw/main/apps/video/911baoliao/assets/';
  s=rep(s,rawAsset,ar);s=rep(s,cdnAsset,ar);s=rep(s,webAsset,ar);
  s=rep(s,"icon.svg?v=10105","icon.svg");
  var localAssign="C.bootstrap='"+q(lb)+"';";
  s=s.replace(/C\.bootstrap\s*=\s*'[^']*'\s*;/g,localAssign);
  s=s.replace(/C\.bootstrap\s*=\s*"[^"]*"\s*;/g,localAssign);
  s=s.replace(/https:\/\/raw\.githubusercontent\.com\/huoguotiankong\/asset-core-7f3\/main\/apps\/video\/911baoliao\/bootstrap_[A-Za-z0-9_.-]+\.js(?:\?v=[0-9]+)?/g,lb);
  s=s.replace(/https:\/\/cdn\.jsdelivr\.net\/gh\/huoguotiankong\/asset-core-7f3@main\/apps\/video\/911baoliao\/bootstrap_[A-Za-z0-9_.-]+\.js(?:\?v=[0-9]+)?/g,lb);
  s=s.replace(/https:\/\/github\.com\/huoguotiankong\/asset-core-7f3\/raw\/(?:refs\/heads\/)?main\/apps\/video\/911baoliao\/bootstrap_[A-Za-z0-9_.-]+\.js(?:\?v=[0-9]+)?/g,lb);
  var ctx=repoContext(s);if(ctx)throw new Error(path+' 去远程化后仍有残留：'+ctx);
  return{text:s,rewrites:count(before,'raw.githubusercontent.com/huoguotiankong/asset-core-7f3')+count(before,'cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3')+count(before,'github.com/huoguotiankong/asset-core-7f3/raw')};
}
function assertLocalRuntime(s){var ctx=repoContext(s);if(ctx)throw new Error('Runtime 仍残留远程代码/资产依赖：'+ctx);}
function buildRuntime(m){var parts=[],i,r,total=0;for(i=0;i<MODULES.length;i++){if(!valid(MODULES[i],m[MODULES[i]]))throw new Error(MODULES[i]+' 源码 marker/正文校验失败');r=sanitizeModule(MODULES[i],m[MODULES[i]]);parts.push(r.text);total+=r.rewrites;}var runtime="/* 911爆料 "+VERSION+" generated Test5 Local-First runtime · "+REF+" */\n"+parts.join('\n\n')+"\n\n"+"var Bl911LocalRuntime={version:'"+VERSION+"',build:"+BUILD+",sourceRef:'"+REF+"',localFirstVersion:'"+VERSION+"',localFirstBuild:"+BUILD+",module:function(){return Bl911RemoteRuntime.module();},core:function(){return Bl911Core;},runtime:function(){return Bl911RemoteRuntime;}};\nif(typeof $!=='undefined')$.exports=Bl911LocalRuntime;\n";assertLocalRuntime(runtime);return{runtime:runtime,rewrites:total};}
function buildBootstrap(){var rp=q(getPath(RUNTIME));return "/* 911爆料 "+VERSION+" local Bootstrap Shim */\nvar __Bl911LocalRuntime=require('"+rp+"');\nif((!__Bl911LocalRuntime||typeof __Bl911LocalRuntime.module!=='function')&&typeof Bl911LocalRuntime==='object')__Bl911LocalRuntime=Bl911LocalRuntime;\nif(!__Bl911LocalRuntime||typeof __Bl911LocalRuntime.core!=='function')throw new Error('911爆料 Local Runtime unavailable');\nvar Bl911Core=__Bl911LocalRuntime.core();\nvar Bl911RemoteRuntime=__Bl911LocalRuntime.runtime();\nvar Bl911Boot={loadOnly:function(){return __Bl911LocalRuntime;},module:function(){return __Bl911LocalRuntime.module();},info:function(){return{version:'"+VERSION+"',build:"+BUILD+",mode:'local-first'};},check:function(){return{message:'Local-First Test 由我的规则仓库统一检查更新'};},update:function(){return{message:'请在我的规则仓库执行轻同步'};},rollback:function(){return{message:'请从我的规则仓库切换上一测试版'};},reinstall:function(){return{message:'请在本地化诊断执行重建本地包'};}};\n";}
function meta(){try{if(!fileExist(META)||!fileExist(RUNTIME)||!fileExist(BOOT))return null;var m=parse(readFile(META),null);if(!m||Number(m.build||0)!==BUILD||String(m.version||'')!==VERSION||String(m.sourceRef||'')!==REF)return null;for(var i=0;i<ASSETS.length;i++)if(!fileExist(ASSET_ROOT+ASSETS[i]))return null;return m;}catch(e){return null;}}
function install(force){var old=meta();if(old&&!force)return old;var tx=all(SOURCES),m=mapSources(tx),built=buildRuntime(m),runtime=built.runtime,boot=buildBootstrap(),i,p;writeFile(RUNTIME,runtime);if(!fileExist(RUNTIME))throw new Error('Runtime bundle 写入失败');writeFile(BOOT,boot);if(!fileExist(BOOT))throw new Error('Local Bootstrap 写入失败');for(i=0;i<ASSETS.length;i++){p=ASSET_ROOT+ASSETS[i];writeFile(p,m[ASSET_PATHS[i]]);if(!fileExist(p))throw new Error(ASSETS[i]+' 写入失败');}var info={schema:2,version:VERSION,build:BUILD,sourceRef:REF,sources:SOURCES.length,modules:MODULES.length,assets:ASSETS.length,bytes:runtime.length,rewrites:built.rewrites,installedAt:Date.now(),runtime:RUNTIME,bootstrap:BOOT,assetRoot:ASSET_ROOT,controlPlane:'local-bootstrap-shim',businessBase:'Test5 0.1.0-test.5 / Build10105',sanitizer:'strict-marker+bootstrap-assignment+asset-root-v3',articleContract:'/archives/<numeric-id>/',playbackContract:'Test5 native handoff preserved'};writeFile(META,JSON.stringify(info));var back=meta();if(!back)throw new Error('bundle meta 回读失败');return back;}
function req(p){var u=getPath(p),r=null;try{r=require(u);}catch(e0){try{deleteCache(u);}catch(e1){}r=require(u);}return r;}
function load(){var m=install(false),r=req(RUNTIME);if((!r||typeof r.module!=='function')&&typeof Bl911LocalRuntime==='object')r=Bl911LocalRuntime;if(!r||String(r.localFirstVersion||'')!==VERSION||Number(r.localFirstBuild||0)!==BUILD)throw new Error('911爆料 Local-First runtime preflight failed');return{meta:m,runtime:r};}
function reset(){try{if(fileExist(RUNTIME))deleteFile(RUNTIME);}catch(e){}try{if(fileExist(BOOT))deleteFile(BOOT);}catch(e2){}try{if(fileExist(META))deleteFile(META);}catch(e3){}for(var i=0;i<ASSETS.length;i++){try{if(fileExist(ASSET_ROOT+ASSETS[i]))deleteFile(ASSET_ROOT+ASSETS[i]);}catch(ex){}}return true;}
return{version:VERSION,build:BUILD,sourceRef:REF,install:install,load:load,meta:meta,reset:reset,runtime:RUNTIME,bootstrap:BOOT,assetRoot:ASSET_ROOT,sources:SOURCES,assets:ASSETS};
})();
