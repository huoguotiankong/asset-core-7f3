/* 51吃瓜 0.1.1-test.1 Local-First entry */
var Cg51Local=(function(){
var VERSION='0.1.1-test.1',BUILD=10201;
var ROOT='hiker://files/rules/asset-core-local/51chigua-test/b10201/';
var BUILDER=ROOT+'local_bundle_builder.js';
var BREF='bf5c2279691761353f6f50374585af9d5384905f';
var BPATH='apps/video/51chigua/releases/0.1.1-test.1/local_bundle_builder.js';
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t);}
function ensure(){if(fileExist(BUILDER))return BUILDER;var us=['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+BREF+'/'+BPATH,'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+BREF+'/'+BPATH,'https://github.com/huoguotiankong/asset-core-7f3/raw/'+BREF+'/'+BPATH],es=[];for(var i=0;i<us.length;i++){try{var s=String(fetch(us[i],{timeout:6500,headers:{'Cache-Control':'public, max-age=31536000, immutable'}})||'');if(bad(s)||s.indexOf(VERSION)<0||s.indexOf('strict-marker+bootstrap-assignment')<0)throw new Error('无效响应');writeFile(BUILDER,s);if(!fileExist(BUILDER))throw new Error('写入失败');return BUILDER;}catch(e){es.push((i+1)+':'+String(e.message||e));}}throw new Error('51吃瓜本地 Builder 下载失败：'+es.join(' | '));}
function req(p){var u=getPath(p),r=null;try{r=require(u);}catch(e0){try{deleteCache(u);}catch(e1){}r=require(u);}return r;}
function builder(){ensure();req(BUILDER);if(typeof Cg51LocalBuilder!=='object'||typeof Cg51LocalBuilder.load!=='function')throw new Error('Cg51LocalBuilder 未导出');return Cg51LocalBuilder;}
function load(){var x=builder().load(),r=x.runtime;if(!r||typeof r.module!=='function'||String(r.localFirstVersion||'')!==VERSION||Number(r.localFirstBuild||0)!==BUILD)throw new Error('51吃瓜 Local-First runtime 未就绪');return{meta:x.meta,runtime:r};}
function module(){var x=load(),r=x.runtime,m=r.module();m.core=function(){return r.core();};m.runtime=function(){return r.runtime();};m.localInfo=function(){return{version:VERSION,build:BUILD,meta:x.meta||{}};};return m;}
function info(){try{var b=builder(),m=b.meta();return{version:VERSION,build:BUILD,ready:!!m,meta:m||{}};}catch(e){return{version:VERSION,build:BUILD,ready:false,error:String(e.message||e)};}}
function rebuild(){var b=builder();b.reset();var m=b.install(true);try{deleteCache(getPath(b.runtime));}catch(e){}try{deleteCache(getPath(b.bootstrap));}catch(e2){}return m;}
return{version:VERSION,build:BUILD,module:module,load:load,info:info,rebuild:rebuild,builder:builder};
})();
