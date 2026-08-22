/* Hanime1 Test35: recover from Test34 regressions by returning to device-proven Test32 base */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.32/recovery_loader.js?hanime_test=35base',{headers:{'Cache-Control':'no-cache'}},20035);
var missing=[];if(typeof HanimeCore!=='object')missing.push('HanimeCore');if(typeof HanimeProvider!=='object')missing.push('HanimeProvider');if(typeof HanimePages!=='object')missing.push('HanimePages');if(typeof HanimeUI9!=='object')missing.push('HanimeUI9');if(typeof HanimeLayout12!=='object')missing.push('HanimeLayout12');if(missing.length)throw new Error('Test35 runtime preflight missing: '+missing.join(', '));
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.35/account35.js?hanime_mod=35a',{headers:{'Cache-Control':'no-cache'}},20035);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.34/creator34.js?hanime_mod=35r',{headers:{'Cache-Control':'no-cache'}},20035);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.35/library35.js?hanime_mod=35l',{headers:{'Cache-Control':'no-cache'}},20035);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.35/search35.js?hanime_mod=35q',{headers:{'Cache-Control':'no-cache'}},20035);
HanimePages.build='2.0.0-test.35';HanimeCore.build='2.0.0-test.35';HanimeProvider.build='2.0.0-test.35';
})();
