/* Hanime1 Test20 recovery: verified Test17 runtime + context-bound real avatar patch */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.17/recovery_loader.js?hanime_recovery=20',{headers:{'Cache-Control':'no-cache'}},20020);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.20/patch_avatar.js?hanime_patch=20',{headers:{'Cache-Control':'no-cache'}},20020);
HanimePages.build='2.0.0-test.20';
HanimeCore.build='2.0.0-test.20';
HanimeProvider.build='2.0.0-test.20';
})();