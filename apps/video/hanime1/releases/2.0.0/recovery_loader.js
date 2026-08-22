/* Hanime1 Stable 2.0.0: promote immutable Test29 runtime as fallback baseline */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.29/recovery_loader.js?hanime_stable=20000',{headers:{'Cache-Control':'no-cache'}},20029);
if(typeof HanimeCore!=='object'||typeof HanimeProvider!=='object'||typeof HanimePages!=='object'||typeof HanimeUI9!=='object')throw new Error('Hanime1 Stable runtime preflight failed');
require(ROOT+'apps/video/hanime1/releases/2.0.0/settings_stable.js?hanime_stable=20000s',{headers:{'Cache-Control':'no-cache'}},20029);
HanimePages.build='2.0.0';HanimeCore.build='2.0.0';HanimeProvider.build='2.0.0';
})();