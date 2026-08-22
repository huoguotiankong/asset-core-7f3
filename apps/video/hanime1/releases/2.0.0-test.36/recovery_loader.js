/* Hanime1 Test36: finalized Test35 recovery modules + correct maintenance/settings binding */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.32/recovery_loader.js?hanime_test=36base',{headers:{'Cache-Control':'no-cache'}},20036);
var missing=[];if(typeof HanimeCore!=='object')missing.push('HanimeCore');if(typeof HanimeProvider!=='object')missing.push('HanimeProvider');if(typeof HanimePages!=='object')missing.push('HanimePages');if(typeof HanimeUI9!=='object')missing.push('HanimeUI9');if(typeof HanimeLayout12!=='object')missing.push('HanimeLayout12');if(missing.length)throw new Error('Test36 runtime preflight missing: '+missing.join(', '));
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.35/account35.js?hanime_mod=36a',{headers:{'Cache-Control':'no-cache'}},20036);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.34/creator34.js?hanime_mod=36r',{headers:{'Cache-Control':'no-cache'}},20036);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.35/library35.js?hanime_mod=36l',{headers:{'Cache-Control':'no-cache'}},20036);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.35/search35.js?hanime_mod=36q',{headers:{'Cache-Control':'no-cache'}},20036);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.36/settings36.js?hanime_mod=36s',{headers:{'Cache-Control':'no-cache'}},20036);
HanimePages.build='2.0.0-test.36';HanimeCore.build='2.0.0-test.36';HanimeProvider.build='2.0.0-test.36';
})();
