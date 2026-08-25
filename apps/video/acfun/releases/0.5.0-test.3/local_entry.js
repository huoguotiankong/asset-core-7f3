/* ACFun 0.5.0-test.3 isolated Local-First entry */
var ACFunLocal=(function(){
var VERSION='0.5.0-test.3',BUILD=50003;
var ROOT='hiker://files/rules/asset-core-local/acfun-test/b50003/';
var BUILDER=ROOT+'local_bundle_builder.js';
var BREF='fc95796ba8393d56f0faa9b9a9b14cd59088e0f3';
var BPATH='apps/video/acfun/releases/0.5.0-test.3/local_bundle_builder.js';
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t);}
function ensure(){if(fileExist(BUILDER))return BUILDER;var us=['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+BREF+'/'+BPATH,'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+BREF+'/'+BPATH,'https://github.com/huoguotiankong/asset-core-7f3/raw/'+BREF+'/'+BPATH],es=[];for(var i=0;i<us.length;i++){try{var s=String(fetch(us[i],{timeout:6000,headers:{'Cache-Control':'public, max-age=31536000, immutable'}})||'');if(bad(s))throw new Error('无效响应');writeFile(BUILDER,s);if(!fileExist(BUILDER))throw new Error('写入失败');return BUILDER;}catch(e){es.push((i+1)+':'+String(e.message||e));}}throw new Error('ACFun Test50003 本地 Builder 下载失败：'+es.join(' | '));}
function req(p){var u=getPath(p);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}}
function builder(){ensure();req(BUILDER);if(typeof ACFunLocalBuilder!=='object'||typeof ACFunLocalBuilder.load!=='function'||Number(ACFunLocalBuilder.build||0)!==BUILD)throw new Error('ACFunLocalBuilder 未导出或版本不符');return ACFunLocalBuilder;}
function module(){var b=builder(),m=b.load();if(typeof ac!=='object'||String(ac.localFirstVersion||'')!==VERSION||Number(ac.localFirstBuild||0)!==BUILD)throw new Error('ACFun Test50003 isolated runtime 未就绪');ac.localBundleMeta=m;return ac;}
function decoderPath(){var b=builder();b.install(false);return b.decoder;}
function info(){try{var b=builder(),m=b.meta();return{version:VERSION,build:BUILD,ready:!!m,meta:m||{}};}catch(e){return{version:VERSION,build:BUILD,ready:false,error:String(e.message||e)};}}
function rebuild(){var b=builder();b.reset();return b.install(true);}
return{version:VERSION,build:BUILD,module:module,decoderPath:decoderPath,info:info,rebuild:rebuild,builder:builder};
})();
