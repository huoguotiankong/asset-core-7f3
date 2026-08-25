/* Hanime1 2.0.2-test.1 Local-First entry */
var HanimeLocal=(function(){
var VERSION='2.0.2-test.1',BUILD=20101;
var BUILDER='hiker://files/rules/asset-core-local/hanime1-test/b20101/local_bundle_builder.js';
var BREF='2913242b51141961b7d773efa4b2ed57a42108ee';
var BPATH='apps/video/hanime1/releases/2.0.2-test.1/local_bundle_builder.js';
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t);}
function ensure(){if(fileExist(BUILDER))return BUILDER;var us=['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+BREF+'/'+BPATH,'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+BREF+'/'+BPATH,'https://github.com/huoguotiankong/asset-core-7f3/raw/'+BREF+'/'+BPATH],es=[];for(var i=0;i<us.length;i++){try{var s=String(fetch(us[i],{timeout:6000,headers:{'Cache-Control':'public, max-age=31536000, immutable'}})||'');if(bad(s))throw new Error('无效响应');writeFile(BUILDER,s);if(!fileExist(BUILDER))throw new Error('写入失败');return BUILDER;}catch(e){es.push((i+1)+':'+String(e.message||e));}}throw new Error('Hanime1 本地 Builder 下载失败：'+es.join(' | '));}
function req(p){var u=getPath(p);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}}
function builder(){ensure();req(BUILDER);if(typeof HanimeLocalBuilder!=='object'||typeof HanimeLocalBuilder.load!=='function')throw new Error('HanimeLocalBuilder 未导出');return HanimeLocalBuilder;}
function module(){var b=builder(),m=b.load();if(typeof HanimePages!=='object'||String(HanimePages.build||'')!==VERSION)throw new Error('Hanime1 Local-First runtime 未就绪');HanimePages.localBundleMeta=m;return HanimePages;}
function info(){try{var b=builder(),m=b.meta();return{version:VERSION,build:BUILD,ready:!!m,meta:m||{}};}catch(e){return{version:VERSION,build:BUILD,ready:false,error:String(e.message||e)};}}
function rebuild(){var b=builder();b.reset();return b.install(true);}
return{version:VERSION,build:BUILD,module:module,info:info,rebuild:rebuild,builder:builder};
})();
