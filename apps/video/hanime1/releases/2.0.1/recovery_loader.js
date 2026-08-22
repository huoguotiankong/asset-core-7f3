/* Hanime1 Stable 2.0.1: promote device-approved Test40 runtime */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.40/recovery_loader.js?hanime_stable=20100',{headers:{'Cache-Control':'no-cache'}},20040);
if(typeof HanimeCore!=='object'||typeof HanimeProvider!=='object'||typeof HanimePages!=='object'||typeof HanimeUI9!=='object'||typeof HanimeLayout12!=='object')throw new Error('Hanime1 Stable 2.0.1 runtime preflight failed');
require(ROOT+'apps/video/hanime1/releases/2.0.1/settings_stable.js?hanime_stable=20100s',{headers:{'Cache-Control':'no-cache'}},20040);
HanimePages.build='2.0.1';HanimeCore.build='2.0.1';HanimeProvider.build='2.0.1';
})();
