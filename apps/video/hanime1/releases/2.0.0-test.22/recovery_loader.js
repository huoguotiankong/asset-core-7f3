/* Hanime1 Test22 recovery: Test21 behavior + visible diagnostic layer */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.21/recovery_loader.js?hanime_recovery=22',{headers:{'Cache-Control':'no-cache'}},20022);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.22/patch_avatar_diag.js?hanime_diag=22',{headers:{'Cache-Control':'no-cache'}},20022);
HanimePages.build='2.0.0-test.22';
HanimeCore.build='2.0.0-test.22';
HanimeProvider.build='2.0.0-test.22';
})();