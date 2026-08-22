/* Hanime1 Test40: performance repair over Test39 */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.39/recovery_loader.js?hanime_test=40base',{headers:{'Cache-Control':'no-cache'}},20040);
var missing=[];if(typeof HanimeCore!=='object')missing.push('HanimeCore');if(typeof HanimeProvider!=='object')missing.push('HanimeProvider');if(typeof HanimePages!=='object')missing.push('HanimePages');if(typeof HanimeUI9!=='object')missing.push('HanimeUI9');if(typeof HanimeLayout12!=='object')missing.push('HanimeLayout12');if(missing.length)throw new Error('Test40 runtime preflight missing: '+missing.join(', '));
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.40/performance40.js?hanime_mod=40p',{headers:{'Cache-Control':'no-cache'}},20040);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.40/settings40.js?hanime_mod=40s',{headers:{'Cache-Control':'no-cache'}},20040);
HanimePages.build='2.0.0-test.40';HanimeCore.build='2.0.0-test.40';HanimeProvider.build='2.0.0-test.40';
})();
