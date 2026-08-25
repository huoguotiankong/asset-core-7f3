/* JavDB v3 3.9.44-test.1 Stable-derived Local-First bundle builder */
var JavDBLocalBuilder=(function(){
var VERSION='3.9.44-test.1',BUILD=2026082501,REF='848879b13bc5de5510af68b6791cc94c6307f198';
var ROOT='hiker://files/rules/asset-core-local/javdb-v3-test/b2026082501/';
var RUNTIME=ROOT+'runtime_bundle.js',META=ROOT+'bundle_meta.json',ICON123=ROOT+'123av.svg';
var CORE=['cloud/javdb/v3.9.41/core_00.txt','cloud/javdb/v3.9.41/core_01.txt','cloud/javdb/v3.9.41/core_02.txt','cloud/javdb/v3.9.41/core_03.txt','cloud/javdb/v3.9.41/core_04.txt','cloud/javdb/v3.9.41/core_05.txt','cloud/javdb/v3.9.41/core_06.txt'];
var CUSTOM=['cloud/javdb/v3.9.41/custom_00.txt','cloud/javdb/v3.9.41/custom_01.txt','cloud/javdb/v3.9.41/custom_02.txt','cloud/javdb/v3.9.41/custom_03.txt','cloud/javdb/v3.9.41/custom_04.txt','cloud/javdb/v3.9.41/custom_04b.txt','cloud/javdb/v3.9.41/custom_05.txt','cloud/javdb/v3.9.41/custom_06.txt','cloud/javdb/v3.9.41/custom_07b.txt'];
var PATCHES=['apps/video/javdb/releases/3.9.42-test.1/app_parity_patch.js','apps/video/javdb/releases/3.9.42-test.2/app_parity_patch2.js','apps/video/javdb/releases/3.9.42-test.3/runtime_scope_patch.js','apps/video/javdb/releases/3.9.42-test.4/actor_ui_patch4.js','apps/video/javdb/releases/3.9.42-test.5/release_patch5.js','apps/video/javdb/releases/3.9.42/stable_patch.js','apps/video/javdb/releases/3.9.44-test.1/final_local_patch.js'];
var SDK2='shared/jav-playback/releases/1.0.0-test.2/index.js',SDK4='shared/jav-playback/releases/1.0.0-test.4/index.js',ICON='shared/jav-playback/assets/123av.svg';
var SOURCES=CORE.concat(CUSTOM).concat(PATCHES).concat([SDK2,SDK4,ICON]);
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Request\s+(?:failed|error)|Fetch\s+(?:failed|error)|Network\s+(?:failed|error)|Timeout\b|ETIMEDOUT\b|ECONN|ENOTFOUND\b|Forbidden\b|Unauthorized\b|Rate\s*limit\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t)||/^\{\s*"(?:message|error)"\s*:/i.test(t);}
function valid(path,t){t=String(t==null?'':t);if(bad(t))return false;if(/\.js$/i.test(path))return t.length>40;if(/\.svg$/i.test(path))return t.length>20&&t.indexOf('<svg')>=0;return t.length>0;}
function parse(s,d){try{return JSON.parse(String(s||''));}catch(e){return d;}}
function urls(path){return['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+REF+'/'+path,'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+REF+'/'+path,'https://github.com/huoguotiankong/asset-core-7f3/raw/'+REF+'/'+path];}
function one(path){var us=urls(path),es=[];for(var i=0;i<us.length;i++){try{var s=String(fetch(us[i],{timeout:i===0?5000:7000,headers:{'Cache-Control':'public, max-age=31536000, immutable'}})||'');if(valid(path,s))return s;es.push((i+1)+':invalid');}catch(e){es.push((i+1)+':'+String(e.message||e));}}throw new Error(path+' 下载失败：'+es.join(' | '));}
function all(paths){var out=[],reqs=[],rs=null,i;for(i=0;i<paths.length;i++)reqs.push({url:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+REF+'/'+paths[i],options:{timeout:6500,headers:{'Cache-Control':'public, max-age=31536000, immutable'}}});try{if(typeof batchFetch==='function')rs=batchFetch(reqs);}catch(e){rs=null;}for(i=0;i<paths.length;i++){var s=rs&&rs[i]!=null?String(rs[i]):'';if(!valid(paths[i],s))s=one(paths[i]);out.push(s);}return out;}
function mapSources(texts){var m={},i;for(i=0;i<SOURCES.length;i++)m[SOURCES[i]]=texts[i];return m;}
function stripExport(src){return String(src||'').replace(/\n?if\(typeof \$!==['"]undefined['"]\)\$\.exports=JAVPlayback;\s*$/,'');}
function buildPlayback(base,top){
  base=stripExport(base);
  if(base.indexOf("1.0.0-test.2")<0)throw new Error('JAV Playback base marker missing');
  if(top.indexOf("1.0.0-test.4")<0)throw new Error('JAV Playback stable marker missing');
  base=base.replace(/var\s+JAVPlayback\s*=/,'JAVPlayback=');
  var mark="  JAVPlayback.version='1.0.0-test.4';",start=top.indexOf(mark),end=top.lastIndexOf('})();');
  if(start<0||end<=start)throw new Error('JAV Playback test.4 overlay extraction failed');
  var body=top.substring(start,end);
  var overlay="\n  JAVPlayback.channel='stable-local';\n"+
    "  JAVPlayback.managerUrl='';\n"+
    "  var local123='"+ICON123.replace(/'/g,"\\'")+"';\n"+
    "  JAVPlayback.providers=function(){return[{id:'missav',name:'MissAV',icon:'https://missav.live/favicon.ico'},{id:'123av',name:'123AV',icon:local123},{id:'jable',name:'Jable',icon:'https://jable.tv/favicon.ico'}];};\n"+
    "  JAVPlayback.resolveMissav=function(code){var items=this.missavSearch(code),names=[],seen={},i,n,key;if(!items.length)return'toast://MissAV 暂无该番号视频';for(i=0;i<items.length;i++){key=items[i].name;seen[key]=(seen[key]||0)+1;n=key+(seen[key]>1?' '+seen[key]:'');names.push(n);}return $(names,1,'MissAV').select(function(items,names,code){var i=names.indexOf(input);if(i<0)return'hiker://empty';try{var sdk=$.require('javdb3').playback();return sdk.resolveMissavVariant(items[i],code);}catch(e){return'toast://MissAV 解析失败：'+String(e.message||e);}},items,names,code);};\n"+
    "  JAVPlayback.providerUrl=function(id,code){return $('#noLoading#').lazyRule(function(id,code){try{var sdk=$.require('javdb3').playback();return sdk.resolve(id,code);}catch(e){return'toast://'+id+' 解析失败：'+String(e.message||e);}},id,code);};\n";
  return "var JAVPlayback;\n(function(){\n  var src="+JSON.stringify(base)+";\n  eval(src);\n  if(!JAVPlayback)throw new Error('JAV Playback base SDK导出失败');\n"+body+overlay+"})();\n";
}
function buildRuntime(m){
  var core='',custom='',i,patches=[];
  for(i=0;i<CORE.length;i++)core+=String(m[CORE[i]]||'');
  for(i=0;i<CUSTOM.length;i++)custom+=String(m[CUSTOM[i]]||'');
  for(i=0;i<PATCHES.length;i++)patches.push(String(m[PATCHES[i]]||''));
  if(core.length<30000)throw new Error('Core bundle length invalid: '+core.length);
  if(custom.length<20000)throw new Error('Custom bundle length invalid: '+custom.length);
  if(patches[0].indexOf('3.9.42-test.1')<0||patches[5].indexOf('3.9.42 Stable')<0||patches[6].indexOf(VERSION)<0)throw new Error('JavDB patch marker validation failed');
  var playback=buildPlayback(m[SDK2],m[SDK4]);
  var head="/* JavDB v3 "+VERSION+" generated Stable 3.9.42 Local-First runtime · "+REF+" */\n"+
    "var JDBCLOUD=(function(){\n"+
    "var VERSION="+JSON.stringify(VERSION)+",BUILD="+BUILD+",SOURCE_REF="+JSON.stringify(REF)+";\n"+
    "var CORE_B64="+JSON.stringify(core)+";\n"+
    "var CUSTOM_B64="+JSON.stringify(custom)+";\n"+
    "var PATCHES="+JSON.stringify(patches)+";\n"+
    "var PLAYBACK_SRC="+JSON.stringify(playback)+";\n"+
    "var PLAY=null;\n"+
    "function ungz(b64){var bs=java.util.Base64.getDecoder().decode(String(b64).replace(/\\s+/g,''));var g=new java.util.zip.GZIPInputStream(new java.io.ByteArrayInputStream(bs));var o=new java.io.ByteArrayOutputStream(),b=java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE,4096),n;while((n=g.read(b))>0)o.write(b,0,n);g.close();return String(new java.lang.String(o.toByteArray(),'UTF-8'));}\n"+
    "function core(call){var c=ungz(CORE_B64),i;eval(c);for(i=0;i<PATCHES.length;i++)eval(PATCHES[i]);eval(call);}\n"+
    "function customData(){return JSON.parse(ungz(CUSTOM_B64));}\n"+
    "function custom(key){if(key==='javdb3ExternalPlay'){var c=ungz(CORE_B64),i;eval(c);for(i=0;i<PATCHES.length;i++)eval(PATCHES[i]);JDB.externalPlayPage();return;}var x=customData();if(!x[key])throw new Error('模块不存在：'+key);eval(x[key]);}\n"+
    "function playback(){if(PLAY)return PLAY;var JAVPlayback;eval(PLAYBACK_SRC);if(!JAVPlayback||String(JAVPlayback.version)!=='1.0.0-test.4')throw new Error('Local JAV Playback SDK preflight failed');PLAY=JAVPlayback;return PLAY;}\n"+
    "return{version:VERSION,build:BUILD,sourceRef:SOURCE_REF,localFirstVersion:VERSION,localFirstBuild:BUILD,core:core,custom:custom,playback:playback,customData:customData};\n"+
    "})();\nif(typeof $!=='undefined')$.exports=JDBCLOUD;\n";
  return head;
}
function meta(){try{if(!fileExist(META)||!fileExist(RUNTIME)||!fileExist(ICON123))return null;var m=parse(readFile(META),null);return m&&Number(m.build||0)===BUILD&&String(m.version||'')===VERSION&&String(m.sourceRef||'')===REF?m:null;}catch(e){return null;}}
function install(force){var old=meta();if(old&&!force)return old;var tx=all(SOURCES),m=mapSources(tx),runtime=buildRuntime(m);writeFile(RUNTIME,runtime);if(!fileExist(RUNTIME))throw new Error('Runtime bundle 写入失败');writeFile(ICON123,m[ICON]);if(!fileExist(ICON123))throw new Error('123AV 图标写入失败');var info={schema:1,version:VERSION,build:BUILD,sourceRef:REF,sources:SOURCES.length,coreFragments:CORE.length,customFragments:CUSTOM.length,patches:PATCHES.length,sharedPlayback:'1.0.0-test.4-local-reentry',bytes:runtime.length,installedAt:Date.now(),runtime:RUNTIME,icon123:ICON123};writeFile(META,JSON.stringify(info));var back=meta();if(!back)throw new Error('bundle meta 回读失败');return back;}
function req(p){var u=getPath(p),r=null;try{r=require(u);}catch(e0){try{deleteCache(u);}catch(e1){}r=require(u);}return r;}
function load(){var m=install(false),r=req(RUNTIME);if((!r||typeof r.core!=='function')&&typeof JDBCLOUD==='object')r=JDBCLOUD;if(!r||String(r.localFirstVersion||'')!==VERSION||Number(r.localFirstBuild||0)!==BUILD)throw new Error('JavDB Local-First runtime preflight failed');return{meta:m,runtime:r};}
function reset(){try{if(fileExist(RUNTIME))deleteFile(RUNTIME);}catch(e){}try{if(fileExist(ICON123))deleteFile(ICON123);}catch(e2){}try{if(fileExist(META))deleteFile(META);}catch(e3){}return true;}
return{version:VERSION,build:BUILD,sourceRef:REF,install:install,load:load,meta:meta,reset:reset,runtime:RUNTIME,icon123:ICON123,sources:SOURCES};
})();
