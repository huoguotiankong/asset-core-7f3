/* Hanime1 Test18 recovery loader: Test17 verified chain + avatar repair */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.17/recovery_loader.js?hanime_recovery=18',{headers:{'Cache-Control':'no-cache'}},20018);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.18/patch_avatar.js?hanime_patch=18',{headers:{'Cache-Control':'no-cache'}},20018);
HanimePages.build='2.0.0-test.18';
HanimeCore.build='2.0.0-test.18';
HanimeProvider.build='2.0.0-test.18';
})();
