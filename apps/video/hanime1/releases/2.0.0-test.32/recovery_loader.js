/* Hanime1 Test32: device-driven account/replies/creator/filter fixes over Test31 */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.31/recovery_loader.js?hanime_test=32base',{headers:{'Cache-Control':'no-cache'}},20032);
var missing=[];if(typeof HanimeCore!=='object')missing.push('HanimeCore');if(typeof HanimeProvider!=='object')missing.push('HanimeProvider');if(typeof HanimePages!=='object')missing.push('HanimePages');if(typeof HanimeUI9!=='object')missing.push('HanimeUI9');if(typeof HanimeLayout12!=='object')missing.push('HanimeLayout12');if(missing.length)throw new Error('Test32 runtime preflight missing: '+missing.join(', '));
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.32/account32.js?hanime_mod=32a',{headers:{'Cache-Control':'no-cache'}},20032);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.32/community32.js?hanime_mod=32c',{headers:{'Cache-Control':'no-cache'}},20032);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.32/creator32.js?hanime_mod=32r',{headers:{'Cache-Control':'no-cache'}},20032);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.32/library_ui32.js?hanime_mod=32l',{headers:{'Cache-Control':'no-cache'}},20032);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.32/settings32.js?hanime_mod=32s',{headers:{'Cache-Control':'no-cache'}},20032);
HanimePages.build='2.0.0-test.32';HanimeCore.build='2.0.0-test.32';HanimeProvider.build='2.0.0-test.32';
})();
