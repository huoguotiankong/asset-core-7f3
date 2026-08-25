/* Pornhub 0.1.1-test.1 Stable-derived Local-First bundle builder */
var PornhubLocalBuilder=(function(){
var VERSION='0.1.1-test.1',BUILD=10201,REF='9b866985b1882c3b52f770a804ee75c71f447d2e';
var ROOT='hiker://files/rules/asset-core-local/pornhub-test/b10201/';
var RUNTIME=ROOT+'runtime_bundle.js',META=ROOT+'bundle_meta.json',BOOT=ROOT+'local_bootstrap.js',ASSET_ROOT=ROOT+'assets/';
var MODULES=[
'apps/video/pornhub/releases/0.1.0-test.1/core.js',
'apps/video/pornhub/releases/0.1.0-test.2/core_patch.js',
'apps/video/pornhub/releases/0.1.0-test.3/core_patch.js',
'apps/video/pornhub/releases/0.1.0-test.4/core_patch.js',
'apps/video/pornhub/releases/0.1.0-test.5/core_patch.js',
'apps/video/pornhub/releases/0.1.0-test.6/core_patch.js',
'apps/video/pornhub/releases/0.1.0-test.7/core_patch.js',
'apps/video/pornhub/releases/0.1.0-test.1/runtime.js',
'apps/video/pornhub/releases/0.1.0-test.2/ui_patch.js',
'apps/video/pornhub/releases/0.1.0-test.3/ui_patch.js',
'apps/video/pornhub/releases/0.1.0-test.4/ui_patch.js',
'apps/video/pornhub/releases/0.1.0-test.5/ui_patch.js',
'apps/video/pornhub/releases/0.1.0-test.6/ui_patch.js',
'apps/video/pornhub/releases/0.1.0-test.7/ui_patch.js',
'apps/video/pornhub/releases/0.1.0/stable_patch.js',
'apps/video/pornhub/releases/0.1.1-test.1/final_local_patch.js'];
var ASSETS=['account.svg','banner.svg','categories.svg','comment.svg','creators.svg','favorite.svg','feed.svg','gifs.svg','history.svg','home.svg','icon.svg','local.svg','search.svg','shorts.svg','subscribe.svg'];
var ASSET_PATHS=[],i;for(i=0;i<ASSETS.length;i++)ASSET_PATHS.push('apps/video/pornhub/assets/'+ASSETS[i]);
var SOURCES=MODULES.concat(ASSET_PATHS);
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Request\s+(?:failed|error)|Fetch\s+(?:failed|error)|Network\s+(?:failed|error)|Timeout\b|ETIMEDOUT\b|ECONN|ENOTFOUND\b|Forbidden\b|Unauthorized\b|Rate\s*limit\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t)||/^\{\s*"(?:message|error)"\s*:/i.test(t);}
function valid(path,t){t=String(t==null?'':t);if(bad(t))return false;if(/\.js$/i.test(path))return t.length>40;if(/\.svg$/i.test(path))return t.length>40&&t.indexOf('<svg')>=0;return t.length>0;}
function parse(s,d){try{return JSON.parse(String(s||''));}catch(e){return d;}}
function urls(path){return['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+REF+'/'+path,'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+REF+'/'+path,'https://github.com/huoguotiankong/asset-core-7f3/raw/'+REF+'/'+path];}
function one(path){var us=urls(path),es=[];for(var i=0;i<us.length;i++){try{var s=String(fetch(us[i],{timeout:i===0?5000:7000,headers:{'Cache-Control':'public, max-age=31536000, immutable'}})||'');if(valid(path,s))return s;es.push((i+1)+':invalid');}catch(e){es.push((i+1)+':'+String(e.message||e));}}throw new Error(path+' 下载失败：'+es.join(' | '));}
function all(paths){var out=[],reqs=[],rs=null,i;for(i=0;i<paths.length;i++)reqs.push({url:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+REF+'/'+paths[i],options:{timeout:6500,headers:{'Cache-Control':'public, max-age=31536000, immutable'}}});try{if(typeof batchFetch==='function')rs=batchFetch(reqs);}catch(e){rs=null;}for(i=0;i<paths.length;i++){var s=rs&&rs[i]!=null?String(rs[i]):'';if(!valid(paths[i],s))s=one(paths[i]);out.push(s);}return out;}
function mapSources(texts){var m={},i;for(i=0;i<SOURCES.length;i++)m[SOURCES[i]]=texts[i];return m;}
function escRe(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function sanitizeModule(src){
  var s=String(src||''),lb=getPath(BOOT),ar=ASSET_ROOT;
  s=s.replace(/https:\/\/raw\.githubusercontent\.com\/huoguotiankong\/asset-core-7f3\/main\/apps\/video\/pornhub\/assets\//g,ar);
  s=s.replace(/https:\/\/cdn\.jsdelivr\.net\/gh\/huoguotiankong\/asset-core-7f3@main\/apps\/video\/pornhub\/assets\//g,ar);
  s=s.replace(/https:\/\/raw\.githubusercontent\.com\/huoguotiankong\/asset-core-7f3\/main\/apps\/video\/pornhub\/bootstrap_[^'"\\s]+\.js(?:\?v=\d+)?/g,lb);
  s=s.replace(/https:\/\/cdn\.jsdelivr\.net\/gh\/huoguotiankong\/asset-core-7f3@main\/apps\/video\/pornhub\/bootstrap_[^'"\\s]+\.js(?:\?v=\d+)?/g,lb);
  return s;
}
function assertLocalRuntime(s){
  var bads=['raw.githubusercontent.com/huoguotiankong/asset-core-7f3','cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3','github.com/huoguotiankong/asset-core-7f3/raw','libs/updater/remote_manager.js'];
  for(var i=0;i<bads.length;i++)if(String(s).indexOf(bads[i])>=0)throw new Error('Runtime 仍残留远程代码/资产依赖：'+bads[i]);
}
function buildRuntime(m){
  var parts=[],i,s;
  for(i=0;i<MODULES.length;i++){s=sanitizeModule(m[MODULES[i]]);parts.push(s);}
  if(parts[0].indexOf('Pornhub Remote Core 0.1.0-test.1')<0)throw new Error('Pornhub Core marker missing');
  if(parts[7].indexOf('Pornhub Remote Runtime 0.1.0-test.1')<0)throw new Error('Pornhub Runtime marker missing');
  if(parts[14].indexOf('Pornhub 0.1.0 Stable')<0)throw new Error('Pornhub Stable marker missing');
  if(parts[15].indexOf(VERSION)<0)throw new Error('Pornhub Local overlay marker missing');
  var runtime="/* Pornhub "+VERSION+" generated Stable 0.1.0 Local-First runtime · "+REF+" */\n"+parts.join('\n\n')+"\n\n"+
    "var PornhubLocalRuntime={version:'"+VERSION+"',build:"+BUILD+",sourceRef:'"+REF+"',localFirstVersion:'"+VERSION+"',localFirstBuild:"+BUILD+",module:function(){return PornhubRemoteRuntime.module();},core:function(){return PornhubCore;},runtime:function(){return PornhubRemoteRuntime;}};\n"+
    "if(typeof $!=='undefined')$.exports=PornhubLocalRuntime;\n";
  assertLocalRuntime(runtime);return runtime;
}
function buildBootstrap(){
  var rp=getPath(RUNTIME).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  return "/* Pornhub "+VERSION+" local Bootstrap Shim */\n"+
    "var __PornhubLocalRuntime=require('"+rp+"');\n"+
    "if((!__PornhubLocalRuntime||typeof __PornhubLocalRuntime.module!=='function')&&typeof PornhubLocalRuntime==='object')__PornhubLocalRuntime=PornhubLocalRuntime;\n"+
    "if(!__PornhubLocalRuntime||typeof __PornhubLocalRuntime.core!=='function')throw new Error('Pornhub Local Runtime unavailable');\n"+
    "var PornhubCore=__PornhubLocalRuntime.core();\n"+
    "var PornhubRemoteRuntime=__PornhubLocalRuntime.runtime();\n"+
    "var PornhubBoot={loadOnly:function(){return __PornhubLocalRuntime;},module:function(){return __PornhubLocalRuntime.module();},info:function(){return{version:'"+VERSION+"',build:"+BUILD+",mode:'local-first'};},check:function(){return{message:'Local-First Test 由我的规则仓库统一检查更新'};},update:function(){return{message:'请在我的规则仓库执行轻同步'};},rollback:function(){return{message:'请从我的规则仓库切换 Stable'};},reinstall:function(){return{message:'请在本地化诊断执行重建本地包'};}};\n";
}
function meta(){try{if(!fileExist(META)||!fileExist(RUNTIME)||!fileExist(BOOT))return null;var m=parse(readFile(META),null);if(!m||Number(m.build||0)!==BUILD||String(m.version||'')!==VERSION||String(m.sourceRef||'')!==REF)return null;for(var i=0;i<ASSETS.length;i++)if(!fileExist(ASSET_ROOT+ASSETS[i]))return null;return m;}catch(e){return null;}}
function install(force){
  var old=meta();if(old&&!force)return old;
  var tx=all(SOURCES),m=mapSources(tx),runtime=buildRuntime(m),boot=buildBootstrap(),i,p;
  writeFile(RUNTIME,runtime);if(!fileExist(RUNTIME))throw new Error('Runtime bundle 写入失败');
  writeFile(BOOT,boot);if(!fileExist(BOOT))throw new Error('Local Bootstrap 写入失败');
  for(i=0;i<ASSETS.length;i++){p=ASSET_ROOT+ASSETS[i];writeFile(p,m[ASSET_PATHS[i]]);if(!fileExist(p))throw new Error(ASSETS[i]+' 写入失败');}
  var info={schema:1,version:VERSION,build:BUILD,sourceRef:REF,sources:SOURCES.length,modules:MODULES.length,assets:ASSETS.length,bytes:runtime.length,installedAt:Date.now(),runtime:RUNTIME,bootstrap:BOOT,assetRoot:ASSET_ROOT,controlPlane:'local-bootstrap-shim',businessBase:'0.1.0 / Build10108'};
  writeFile(META,JSON.stringify(info));var back=meta();if(!back)throw new Error('bundle meta 回读失败');return back;
}
function req(p){var u=getPath(p),r=null;try{r=require(u);}catch(e0){try{deleteCache(u);}catch(e1){}r=require(u);}return r;}
function load(){var m=install(false),r=req(RUNTIME);if((!r||typeof r.module!=='function')&&typeof PornhubLocalRuntime==='object')r=PornhubLocalRuntime;if(!r||String(r.localFirstVersion||'')!==VERSION||Number(r.localFirstBuild||0)!==BUILD)throw new Error('Pornhub Local-First runtime preflight failed');return{meta:m,runtime:r};}
function reset(){try{if(fileExist(RUNTIME))deleteFile(RUNTIME);}catch(e){}try{if(fileExist(BOOT))deleteFile(BOOT);}catch(e2){}try{if(fileExist(META))deleteFile(META);}catch(e3){}for(var i=0;i<ASSETS.length;i++){try{if(fileExist(ASSET_ROOT+ASSETS[i]))deleteFile(ASSET_ROOT+ASSETS[i]);}catch(ex){}}return true;}
return{version:VERSION,build:BUILD,sourceRef:REF,install:install,load:load,meta:meta,reset:reset,runtime:RUNTIME,bootstrap:BOOT,assetRoot:ASSET_ROOT,sources:SOURCES,assets:ASSETS};
})();
