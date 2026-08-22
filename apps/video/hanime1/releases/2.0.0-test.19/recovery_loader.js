/* Hanime1 Test19 recovery: verified Test17 + safe avatar enrichment */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.17/recovery_loader.js?hanime_recovery=19',{headers:{'Cache-Control':'no-cache'}},20019);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.19/patch_avatar.js?hanime_patch=19',{headers:{'Cache-Control':'no-cache'}},20019);
HanimePages.build='2.0.0-test.19';
HanimeCore.build='2.0.0-test.19';
HanimeProvider.build='2.0.0-test.19';
})();
