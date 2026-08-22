/* Hanime1 Test31: Test30 plus selector hardening */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.30/recovery_loader.js?hanime_test=31base',{headers:{'Cache-Control':'no-cache'}},20031);
if(typeof HanimeCore!=='object'||typeof HanimeProvider!=='object'||typeof HanimePages!=='object'||typeof HanimeUI9!=='object')throw new Error('Test31 runtime preflight failed');
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.31/patch31.js?hanime_mod=31p',{headers:{'Cache-Control':'no-cache'}},20031);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.31/settings31.js?hanime_mod=31s',{headers:{'Cache-Control':'no-cache'}},20031);
HanimePages.build='2.0.0-test.31';HanimeCore.build='2.0.0-test.31';HanimeProvider.build='2.0.0-test.31';
})();