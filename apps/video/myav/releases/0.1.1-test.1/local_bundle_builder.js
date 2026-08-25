/* MyAv 0.1.1-test.1 Stable-derived Local-First bundle builder */
var MyAvLocalBuilder=(function(){
var VERSION='0.1.1-test.1',BUILD=10201,REF='15bec4419cfdd3f9ad3c7ed756e9ffa12f9b11af';
var ROOT='hiker://files/rules/asset-core-local/myav-test/b10201/';
var RUNTIME=ROOT+'runtime_bundle.js',META=ROOT+'bundle_meta.json',ICON123=ROOT+'123av.svg',APPICON=ROOT+'myav_icon.svg';
var MODULES=[
'apps/video/myav/releases/0.1.0-test.1/core.js',
'apps/video/myav/releases/0.1.0-test.2/image_patch.js',
'apps/video/myav/releases/0.1.0-test.3/core_patch.js',
'apps/video/myav/releases/0.1.0-test.4/core_patch.js',
'apps/video/myav/releases/0.1.0-test.5/core_patch.js',
'apps/video/myav/releases/0.1.0-test.6/core_patch.js',
'apps/video/myav/releases/0.1.0-test.9/core_patch.js',
'apps/video/myav/releases/0.1.0-test.10/core_patch.js',
'apps/video/myav/releases/0.1.0-test.11/core_patch.js',
'apps/video/myav/releases/0.1.0-test.1/runtime.js',
'apps/video/myav/releases/0.1.0-test.2/runtime_patch.js',
'apps/video/myav/releases/0.1.0-test.3/ui_patch.js',
'apps/video/myav/releases/0.1.0-test.4/ui_patch.js',
'apps/video/myav/releases/0.1.0-test.5/ui_patch.js',
'apps/video/myav/releases/0.1.0-test.6/ui_a.js',
'apps/video/myav/releases/0.1.0-test.6/ui_b.js',
'apps/video/myav/releases/0.1.0-test.6/ui_c.js',
'apps/video/myav/releases/0.1.0-test.7/version_patch.js',
'apps/video/myav/releases/0.1.0-test.8/ui_patch.js',
'apps/video/myav/releases/0.1.0-test.9/ui_patch.js',
'apps/video/myav/releases/0.1.0-test.10/ui_patch.js',
'apps/video/myav/releases/0.1.0-test.11/ui_patch.js',
'apps/video/myav/releases/0.1.0/stable_patch.js',
'apps/video/myav/releases/0.1.1-test.1/final_local_patch.js'];
var SDK2='shared/jav-playback/releases/1.0.0-test.2/index.js',SDK4='shared/jav-playback/releases/1.0.0-test.4/index.js';
var ICON_SRC='shared/jav-playback/assets/123av.svg',APPICON_SRC='apps/video/myav/assets/icon.svg';
var SOURCES=MODULES.concat([SDK2,SDK4,ICON_SRC,APPICON_SRC]);
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
  if(base.indexOf('1.0.0-test.2')<0)throw new Error('JAV Playback base marker missing');
  if(top.indexOf('1.0.0-test.4')<0)throw new Error('JAV Playback stable marker missing');
  base=base.replace(/var\s+JAVPlayback\s*=/,'JAVPlayback=');
  var mark="  JAVPlayback.version='1.0.0-test.4';",start=top.indexOf(mark),end=top.lastIndexOf('})();');
  if(start<0||end<=start)throw new Error('JAV Playback test.4 overlay extraction failed');
  var body=top.substring(start,end);
  var overlay="\n  JAVPlayback.channel='stable-local';\n"+
    "  JAVPlayback.managerUrl='';\n"+
    "  var local123='"+ICON123.replace(/'/g,"\\'")+"';\n"+
    "  JAVPlayback.providers=function(){return[{id:'missav',name:'MissAV',icon:'https://missav.live/favicon.ico'},{id:'123av',name:'123AV',icon:local123},{id:'jable',name:'Jable',icon:'https://jable.tv/favicon.ico'}];};\n"+
    "  JAVPlayback.resolveMissav=function(code){var items=this.missavSearch(code),names=[],seen={},i,n,key;if(!items.length)return'toast://MissAV 暂无该番号视频';for(i=0;i<items.length;i++){key=items[i].name;seen[key]=(seen[key]||0)+1;n=key+(seen[key]>1?' '+seen[key]:'');names.push(n);}return $(names,1,'MissAV').select(function(items,names,code){var i=names.indexOf(input);if(i<0)return'hiker://empty';try{var sdk=$.require('myav').localPlayback();return sdk.resolveMissavVariant(items[i],code);}catch(e){return'toast://MissAV 解析失败：'+String(e.message||e);}},items,names,code);};\n"+
    "  JAVPlayback.providerUrl=function(id,code){return $('#noLoading#').lazyRule(function(id,code){try{var sdk=$.require('myav').localPlayback();return sdk.resolve(id,code);}catch(e){return'toast://'+id+' 解析失败：'+String(e.message||e);}},id,code);};\n";
  return "var MyAvLocalPlayback=(function(){\n  var JAVPlayback;\n  var src="+JSON.stringify(base)+";\n  eval(src);\n  if(!JAVPlayback)throw new Error('JAV Playback base SDK导出失败');\n"+body+overlay+"  return JAVPlayback;\n})();\n";
}
function buildRuntime(m){
  var parts=[],i;
  for(i=0;i<MODULES.length-1;i++)parts.push(String(m[MODULES[i]]||''));
  if(parts[0].indexOf('MyAv Remote Core 0.1.0-test.1')<0)throw new Error('MyAv Core marker missing');
  if(parts[9].indexOf('MyAv Remote Runtime 0.1.0-test.1')<0)throw new Error('MyAv Runtime marker missing');
  if(parts[22].indexOf('MyAv 0.1.0 Stable')<0)throw new Error('MyAv Stable marker missing');
  var playback=buildPlayback(m[SDK2],m[SDK4]);
  var finalPatch=String(m[MODULES[MODULES.length-1]]||'');
  if(finalPatch.indexOf(VERSION)<0)throw new Error('MyAv Local overlay marker missing');
  var runtime="/* MyAv "+VERSION+" generated Stable 0.1.0 Local-First runtime · "+REF+" */\n"+
    "var JAVPlaybackManager;\n"+parts.join('\n\n')+'\n\n'+playback+'\n'+finalPatch+"\n"+
    "var MyAvLocalRuntime={version:'"+VERSION+"',build:"+BUILD+",sourceRef:'"+REF+"',localFirstVersion:'"+VERSION+"',localFirstBuild:"+BUILD+",module:function(){var m=MyAvRemoteRuntime.module();m.localPlayback=function(){return MyAvLocalPlayback;};m.localInfo=function(){return{version:'"+VERSION+"',build:"+BUILD+",playback:String(MyAvLocalPlayback.version||''),appIcon:'"+APPICON.replace(/'/g,"\\'")+"'};};return m;},playback:function(){return MyAvLocalPlayback;}};\n"+
    "if(typeof $!=='undefined')$.exports=MyAvLocalRuntime;\n";
  return runtime;
}
function meta(){try{if(!fileExist(META)||!fileExist(RUNTIME)||!fileExist(ICON123)||!fileExist(APPICON))return null;var m=parse(readFile(META),null);return m&&Number(m.build||0)===BUILD&&String(m.version||'')===VERSION&&String(m.sourceRef||'')===REF?m:null;}catch(e){return null;}}
function install(force){var old=meta();if(old&&!force)return old;var tx=all(SOURCES),m=mapSources(tx),runtime=buildRuntime(m);writeFile(RUNTIME,runtime);if(!fileExist(RUNTIME))throw new Error('Runtime bundle 写入失败');writeFile(ICON123,m[ICON_SRC]);if(!fileExist(ICON123))throw new Error('123AV 图标写入失败');writeFile(APPICON,m[APPICON_SRC]);if(!fileExist(APPICON))throw new Error('MyAv 图标写入失败');var info={schema:1,version:VERSION,build:BUILD,sourceRef:REF,sources:SOURCES.length,modules:MODULES.length,stableModules:MODULES.length-1,sharedPlayback:'1.0.0-test.4-local-reentry',appIcon:'local-svg',bytes:runtime.length,installedAt:Date.now(),runtime:RUNTIME,icon123:ICON123,appIconPath:APPICON};writeFile(META,JSON.stringify(info));var back=meta();if(!back)throw new Error('bundle meta 回读失败');return back;}
function req(p){var u=getPath(p),r=null;try{r=require(u);}catch(e0){try{deleteCache(u);}catch(e1){}r=require(u);}return r;}
function load(){var m=install(false),r=req(RUNTIME);if((!r||typeof r.module!=='function')&&typeof MyAvLocalRuntime==='object')r=MyAvLocalRuntime;if(!r||String(r.localFirstVersion||'')!==VERSION||Number(r.localFirstBuild||0)!==BUILD)throw new Error('MyAv Local-First runtime preflight failed');return{meta:m,runtime:r};}
function reset(){try{if(fileExist(RUNTIME))deleteFile(RUNTIME);}catch(e){}try{if(fileExist(ICON123))deleteFile(ICON123);}catch(e2){}try{if(fileExist(APPICON))deleteFile(APPICON);}catch(e3){}try{if(fileExist(META))deleteFile(META);}catch(e4){}return true;}
return{version:VERSION,build:BUILD,sourceRef:REF,install:install,load:load,meta:meta,reset:reset,runtime:RUNTIME,icon123:ICON123,appIcon:APPICON,sources:SOURCES};
})();
