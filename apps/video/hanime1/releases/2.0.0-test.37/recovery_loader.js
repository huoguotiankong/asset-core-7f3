/* Hanime1 Test37: self-contained recovery modules over device-proven Test32 */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.32/recovery_loader.js?hanime_test=37base',{headers:{'Cache-Control':'no-cache'}},20037);
var missing=[];if(typeof HanimeCore!=='object')missing.push('HanimeCore');if(typeof HanimeProvider!=='object')missing.push('HanimeProvider');if(typeof HanimePages!=='object')missing.push('HanimePages');if(typeof HanimeUI9!=='object')missing.push('HanimeUI9');if(typeof HanimeLayout12!=='object')missing.push('HanimeLayout12');if(missing.length)throw new Error('Test37 runtime preflight missing: '+missing.join(', '));
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.37/account37.js?hanime_mod=37a',{headers:{'Cache-Control':'no-cache'}},20037);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.37/creator37.js?hanime_mod=37c',{headers:{'Cache-Control':'no-cache'}},20037);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.37/library37.js?hanime_mod=37l',{headers:{'Cache-Control':'no-cache'}},20037);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.37/search37.js?hanime_mod=37q',{headers:{'Cache-Control':'no-cache'}},20037);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.37/settings37.js?hanime_mod=37s',{headers:{'Cache-Control':'no-cache'}},20037);
HanimePages.build='2.0.0-test.37';HanimeCore.build='2.0.0-test.37';HanimeProvider.build='2.0.0-test.37';
})();
