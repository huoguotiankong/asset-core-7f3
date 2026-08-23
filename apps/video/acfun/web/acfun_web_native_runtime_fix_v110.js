/** ACFun Web-Native 1.1.0-web2 - runtime context isolation fix */
(function(){
if(typeof ACFunNext!=='object')throw new Error('ACFunNext missing');
var A=ACFunNext;
A.bootUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_web_v110.js?v=11002';
A.bootVer=11002;
try{if(typeof ACFunWebBoot==='object')ACFunNextBoot=ACFunWebBoot;}catch(e){}
A.runtimeMode='native-ui-web-provider-fallback';
})();
