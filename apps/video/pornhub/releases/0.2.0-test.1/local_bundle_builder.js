/* Pornhub 0.2.0-test.1 standalone Local-First bundle builder */
var PornhubV2LocalBuilder=(function(){
var VERSION='0.2.0-test.1',BUILD=20001,REF='ffeee0e973c23410bbc6466717cd70ffe8b16953';
var ROOT='hiker://files/rules/asset-core-local/pornhub-test/b20001/';
var RUNTIME=ROOT+'runtime_bundle.js',META=ROOT+'bundle_meta.json',ASSET_ROOT=ROOT+'assets/';
var PARTS=[
'apps/video/pornhub/releases/0.2.0-test.1/runtime_parts/01_kernel.part',
'apps/video/pornhub/releases/0.2.0-test.1/runtime_parts/02_store_session_request.part',
'apps/video/pornhub/releases/0.2.0-test.1/runtime_parts/03_parsers_models.part',
'apps/video/pornhub/releases/0.2.0-test.1/runtime_parts/04_providers_actions_playback.part',
'apps/video/pornhub/releases/0.2.0-test.1/runtime_parts/05_ui_helpers.part',
'apps/video/pornhub/releases/0.2.0-test.1/runtime_parts/06_home_search_category_detail.part',
'apps/video/pornhub/releases/0.2.0-test.1/runtime_parts/07_creator_library_account_extras.part',
'apps/video/pornhub/releases/0.2.0-test.1/runtime_parts/08_runtime_export.part'];
var MARKERS={};
MARKERS[PARTS[0]]='Pornhub V2 0.2.0-test.1 standalone Local-First runtime';
MARKERS[PARTS[1]]='var Store={';
MARKERS[PARTS[2]]='var Parser={';
MARKERS[PARTS[3]]='var VideoProvider={';
MARKERS[PARTS[4]]='var UI={';
MARKERS[PARTS[5]]='var Pages={};';
MARKERS[PARTS[6]]='Pages.creator=function';
MARKERS[PARTS[7]]='var Runtime={';
var ASSETS=['account.svg','categories.svg','creators.svg','library.svg','icon.svg','shorts.svg','playlist.svg','gifs.svg','local.svg','favorite.svg','official.svg','subscribe.svg','home.svg','feed.svg','search.svg','comment.svg','history.svg'];
var ASSET_PATHS=[],i;for(i=0;i<ASSETS.length;i++)ASSET_PATHS.push('apps/video/pornhub/assets/'+ASSETS[i]);
var SOURCES=PARTS.concat(ASSET_PATHS);
function bodyOf(v){if(v&&typeof v==='object'){if(v.body!==undefined)return String(v.body||'');if(v.content!==undefined)return String(v.content||'');}return String(v==null?'':v);}
function bad(t){t=bodyOf(t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Request\s+(?:failed|error)|Fetch\s+(?:failed|error)|Network\s+(?:failed|error)|Timeout\b|ETIMEDOUT\b|ECONN|ENOTFOUND\b|Forbidden\b|Unauthorized\b|Rate\s*limit\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t)||/^\{\s*"(?:message|error)"\s*:/i.test(t);}
function valid(path,t){t=bodyOf(t);if(bad(t))return false;if(/\.part$/i.test(path)){var mk=MARKERS[path]||'';return t.length>80&&(!mk||t.indexOf(mk)>=0);}if(/\.svg$/i.test(path))return t.length>40&&t.indexOf('<svg')>=0;return t.length>0;}
function parse(s,d){try{return JSON.parse(String(s||''));}catch(e){return d;}}
function urls(path){return['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+REF+'/'+path,'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+REF+'/'+path,'https://github.com/huoguotiankong/asset-core-7f3/raw/'+REF+'/'+path];}
function one(path){var us=urls(path),es=[];for(var i=0;i<us.length;i++){try{var x=bodyOf(fetch(us[i],{timeout:i===0?5500:7500,headers:{'Cache-Control':'public, max-age=31536000, immutable'}}));if(valid(path,x))return x;es.push((i+1)+':invalid');}catch(e){es.push((i+1)+':'+String(e.message||e));}}throw new Error(path+' 下载失败：'+es.join(' | '));}
function all(paths){var out=[],reqs=[],rs=null,i;for(i=0;i<paths.length;i++)reqs.push({url:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+REF+'/'+paths[i],options:{timeout:6500,headers:{'Cache-Control':'public, max-age=31536000, immutable'}}});try{if(typeof batchFetch==='function')rs=batchFetch(reqs);}catch(e){rs=null;}for(i=0;i<paths.length;i++){var x=rs&&rs[i]!=null?bodyOf(rs[i]):'';if(!valid(paths[i],x))x=one(paths[i]);out.push(x);}return out;}
function mapSources(texts){var m={},i;for(i=0;i<SOURCES.length;i++)m[SOURCES[i]]=texts[i];return m;}
function repoContext(s){s=String(s||'');var keys=['raw.githubusercontent.com/huoguotiankong/asset-core-7f3','cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3','github.com/huoguotiankong/asset-core-7f3/raw','libs/updater/remote_manager.js'],i,x=-1,k='';for(i=0;i<keys.length;i++){var z=s.indexOf(keys[i]);if(z>=0&&(x<0||z<x)){x=z;k=keys[i];}}if(x<0)return'';return k+' @ '+s.substring(Math.max(0,x-80),Math.min(s.length,x+220)).replace(/[\r\n]+/g,' ');}
function buildRuntime(m){var parts=[],i;for(i=0;i<PARTS.length;i++){var src=String(m[PARTS[i]]||'');if(!valid(PARTS[i],src))throw new Error(PARTS[i]+' marker/正文校验失败');parts.push(src);}var runtime=parts.join('\n\n')+'\n';if(runtime.indexOf("var PornhubV2=(function(){")<0||runtime.indexOf('var Runtime={')<0||runtime.indexOf('return Runtime;')<0)throw new Error('Pornhub V2 Runtime 导出合同不完整');var ctx=repoContext(runtime);if(ctx)throw new Error('Runtime 仍残留远程代码/控制面依赖：'+ctx);return runtime;}
function meta(){try{if(!fileExist(META)||!fileExist(RUNTIME))return null;var m=parse(readFile(META),null);if(!m||Number(m.build||0)!==BUILD||String(m.version||'')!==VERSION||String(m.sourceRef||'')!==REF)return null;for(var i=0;i<ASSETS.length;i++)if(!fileExist(ASSET_ROOT+ASSETS[i]))return null;return m;}catch(e){return null;}}
function install(force){var old=meta();if(old&&!force)return old;var tx=all(SOURCES),m=mapSources(tx),runtime=buildRuntime(m),i,p;writeFile(RUNTIME,runtime);if(!fileExist(RUNTIME))throw new Error('Runtime bundle 写入失败');for(i=0;i<ASSETS.length;i++){p=ASSET_ROOT+ASSETS[i];writeFile(p,m[ASSET_PATHS[i]]);if(!fileExist(p))throw new Error(ASSETS[i]+' 写入失败');}var info={schema:1,version:VERSION,build:BUILD,sourceRef:REF,sources:SOURCES.length,parts:PARTS.length,assets:ASSETS.length,bytes:runtime.length,installedAt:Date.now(),runtime:RUNTIME,assetRoot:ASSET_ROOT,architecture:'standalone-product-first-model-first',businessBase:'protocol facts from Stable 0.1.0 / Build10108',normalStartupCodeNetwork:false,remoteResidualGate:true};writeFile(META,JSON.stringify(info));var back=meta();if(!back)throw new Error('bundle meta 回读失败');return back;}
function req(p){var u=getPath(p),r=null;try{r=require(u);}catch(e0){try{deleteCache(u);}catch(e1){}r=require(u);}return r;}
function load(){var m=install(false),r=req(RUNTIME);if((!r||typeof r.module!=='function')&&typeof PornhubV2==='object')r=PornhubV2;if(!r||String(r.localFirstVersion||'')!==VERSION||Number(r.localFirstBuild||0)!==BUILD)throw new Error('Pornhub V2 Local-First runtime preflight failed');var mod=r.module();if(!mod||typeof mod.home!=='function'||typeof mod.detail!=='function'||typeof mod.library!=='function'||typeof mod.play!=='function')throw new Error('Pornhub V2 business module preflight failed');return{meta:m,runtime:r};}
function reset(){try{if(fileExist(RUNTIME))deleteFile(RUNTIME);}catch(e){}try{if(fileExist(META))deleteFile(META);}catch(e2){}for(var i=0;i<ASSETS.length;i++){try{if(fileExist(ASSET_ROOT+ASSETS[i]))deleteFile(ASSET_ROOT+ASSETS[i]);}catch(ex){}}return true;}
return{version:VERSION,build:BUILD,sourceRef:REF,install:install,load:load,meta:meta,reset:reset,runtime:RUNTIME,assetRoot:ASSET_ROOT,sources:SOURCES,parts:PARTS,assets:ASSETS};
})();
