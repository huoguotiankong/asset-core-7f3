/* Hanime1 Test17 recovery loader: Test16 verified chain + uploader works patch */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.16/recovery_loader.js?hanime_recovery=17',{headers:{'Cache-Control':'no-cache'}},20017);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.17/patch_creator.js?hanime_patch=17',{headers:{'Cache-Control':'no-cache'}},20017);
HanimePages.build='2.0.0-test.17';
HanimeCore.build='2.0.0-test.17';
HanimeProvider.build='2.0.0-test.17';
})();
