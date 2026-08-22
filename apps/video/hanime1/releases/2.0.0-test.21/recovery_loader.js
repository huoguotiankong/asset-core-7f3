/* Hanime1 Test21 recovery: verified Test17 runtime + exact Han1mePlus avatar DOM grouping */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.17/recovery_loader.js?hanime_recovery=21',{headers:{'Cache-Control':'no-cache'}},20021);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.21/patch_avatar.js?hanime_patch=21',{headers:{'Cache-Control':'no-cache'}},20021);
HanimePages.build='2.0.0-test.21';
HanimeCore.build='2.0.0-test.21';
HanimeProvider.build='2.0.0-test.21';
})();