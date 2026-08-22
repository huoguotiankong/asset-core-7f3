/* Hanime1 Test16 recovery loader: Test15 stable recovery + creator/uploader patch */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.15/recovery_loader.js?hanime_recovery=16',{headers:{'Cache-Control':'no-cache'}},20016);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.16/patch_creator.js?hanime_patch=16',{headers:{'Cache-Control':'no-cache'}},20016);
HanimePages.build='2.0.0-test.16';
HanimeCore.build='2.0.0-test.16';
HanimeProvider.build='2.0.0-test.16';
})();
