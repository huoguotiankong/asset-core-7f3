/* Hanime1 Test30: build from promoted Stable 2.0.0 / Test29 baseline */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0/recovery_loader.js?hanime_test=30base',{headers:{'Cache-Control':'no-cache'}},20030);
var missing=[];if(typeof HanimeCore!=='object')missing.push('HanimeCore');if(typeof HanimeProvider!=='object')missing.push('HanimeProvider');if(typeof HanimePages!=='object')missing.push('HanimePages');if(typeof HanimeUI9!=='object')missing.push('HanimeUI9');if(typeof HanimeUI10!=='object')missing.push('HanimeUI10');if(typeof HanimeLayout12!=='object')missing.push('HanimeLayout12');if(missing.length)throw new Error('Test30 runtime preflight missing: '+missing.join(', '));
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.30/replies30.js?hanime_mod=30r',{headers:{'Cache-Control':'no-cache'}},20030);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.30/library30.js?hanime_mod=30l',{headers:{'Cache-Control':'no-cache'}},20030);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.30/account30.js?hanime_mod=30a',{headers:{'Cache-Control':'no-cache'}},20030);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.30/ui30.js?hanime_mod=30u',{headers:{'Cache-Control':'no-cache'}},20030);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.30/settings30.js?hanime_mod=30s',{headers:{'Cache-Control':'no-cache'}},20030);
HanimePages.build='2.0.0-test.30';HanimeCore.build='2.0.0-test.30';HanimeProvider.build='2.0.0-test.30';
})();