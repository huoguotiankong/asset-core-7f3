/* Pornhub 0.2.0-test.1 Local-First entry */
var PornhubV2Local=(function(){
var VERSION='0.2.0-test.1',BUILD=20001;
var ROOT='hiker://files/rules/asset-core-local/pornhub-test/b20001/';
var BUILDER=ROOT+'local_bundle_builder.js';
var BREF='cdc6ea284f3bb839e10c6a26a2d83ae7e1fc599b';
var BPATH='apps/video/pornhub/releases/0.2.0-test.1/local_bundle_builder.js';
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t);}
function ensure(){if(fileExist(BUILDER))return BUILDER;var us=['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+BREF+'/'+BPATH,'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+BREF+'/'+BPATH,'https://github.com/huoguotiankong/asset-core-7f3/raw/'+BREF+'/'+BPATH],es=[];for(var i=0;i<us.length;i++){try{var x=String(fetch(us[i],{timeout:6500,headers:{'Cache-Control':'public, max-age=31536000, immutable'}})||'');if(bad(x)||x.indexOf(VERSION)<0||x.indexOf('PornhubV2LocalBuilder')<0)throw new Error('无效响应');writeFile(BUILDER,x);if(!fileExist(BUILDER))throw new Error('写入失败');return BUILDER;}catch(e){es.push((i+1)+':'+String(e.message||e));}}throw new Error('Pornhub V2 Builder 下载失败：'+es.join(' | '));}
function req(p){var u=getPath(p),r=null;try{r=require(u);}catch(e0){try{deleteCache(u);}catch(e1){}r=require(u);}return r;}
function builder(){ensure();req(BUILDER);if(typeof PornhubV2LocalBuilder!=='object'||typeof PornhubV2LocalBuilder.load!=='function')throw new Error('PornhubV2LocalBuilder 未导出');return PornhubV2LocalBuilder;}
function module(){var x=builder().load(),r=x.runtime;if(!r||typeof r.module!=='function'||String(r.localFirstVersion||'')!==VERSION||Number(r.localFirstBuild||0)!==BUILD)throw new Error('Pornhub V2 Runtime 未就绪');var m=r.module();if(!m||typeof m.home!=='function'||typeof m.searchPage!=='function'||typeof m.detail!=='function'||typeof m.library!=='function'||typeof m.account!=='function'||typeof m.play!=='function')throw new Error('Pornhub V2 business module preflight failed');m.localInfo=function(){return{version:VERSION,build:BUILD,meta:x.meta||{}};};return m;}
function info(){try{var b=builder(),m=b.meta();return{version:VERSION,build:BUILD,ready:!!m,meta:m||{}};}catch(e){return{version:VERSION,build:BUILD,ready:false,error:String(e.message||e)};}}
function rebuild(){var b=builder();b.reset();var m=b.install(true);try{deleteCache(getPath(b.runtime));}catch(e){}return m;}
return{version:VERSION,build:BUILD,module:module,info:info,rebuild:rebuild,builder:builder};
})();
