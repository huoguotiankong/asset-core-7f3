/* Hanime1 Test24 recovery: Test23 XPath avatar engine + Shell/Bootstrap updater recovery */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.23/recovery_loader.js?hanime_recovery=24',{headers:{'Cache-Control':'no-cache'}},20024);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.24/patch_runtime24.js?hanime_runtime=24',{headers:{'Cache-Control':'no-cache'}},20024);
HanimePages.build='2.0.0-test.24';
HanimeCore.build='2.0.0-test.24';
HanimeProvider.build='2.0.0-test.24';
})();
