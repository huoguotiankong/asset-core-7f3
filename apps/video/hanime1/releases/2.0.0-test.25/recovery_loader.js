/* Hanime1 Test25 recovery: Test24 verified avatar/runtime chain + comment performance patch */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.24/recovery_loader.js?hanime_recovery=25',{headers:{'Cache-Control':'no-cache'}},20025);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.25/patch_comments_perf.js?hanime_perf=25',{headers:{'Cache-Control':'no-cache'}},20025);
HanimePages.build='2.0.0-test.25';
HanimeCore.build='2.0.0-test.25';
HanimeProvider.build='2.0.0-test.25';
})();
