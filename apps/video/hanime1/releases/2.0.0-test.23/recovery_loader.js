/* Hanime1 Test23 recovery: verified Test17 data path + built-in XPath avatar layer */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.17/recovery_loader.js?hanime_recovery=23',{headers:{'Cache-Control':'no-cache'}},20023);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.23/patch_avatar_xpath.js?hanime_xpath=23',{headers:{'Cache-Control':'no-cache'}},20023);
HanimePages.build='2.0.0-test.23';
HanimeCore.build='2.0.0-test.23';
HanimeProvider.build='2.0.0-test.23';
})();