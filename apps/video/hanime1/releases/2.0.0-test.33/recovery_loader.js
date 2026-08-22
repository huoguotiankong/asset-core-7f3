/* Hanime1 Test33: device-driven reply/account/filter/creator iteration over Test32 */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.32/recovery_loader.js?hanime_test=33base',{headers:{'Cache-Control':'no-cache'}},20033);
var missing=[];if(typeof HanimeCore!=='object')missing.push('HanimeCore');if(typeof HanimeProvider!=='object')missing.push('HanimeProvider');if(typeof HanimePages!=='object')missing.push('HanimePages');if(typeof HanimeUI9!=='object')missing.push('HanimeUI9');if(typeof HanimeUI10!=='object')missing.push('HanimeUI10');if(typeof HanimeLayout12!=='object')missing.push('HanimeLayout12');if(missing.length)throw new Error('Test33 runtime preflight missing: '+missing.join(', '));
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.33/account33.js?hanime_mod=33a',{headers:{'Cache-Control':'no-cache'}},20033);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.33/community33.js?hanime_mod=33c',{headers:{'Cache-Control':'no-cache'}},20033);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.33/creator33.js?hanime_mod=33r',{headers:{'Cache-Control':'no-cache'}},20033);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.33/library33.js?hanime_mod=33l',{headers:{'Cache-Control':'no-cache'}},20033);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.33/settings33.js?hanime_mod=33s',{headers:{'Cache-Control':'no-cache'}},20033);
HanimePages.build='2.0.0-test.33';HanimeCore.build='2.0.0-test.33';HanimeProvider.build='2.0.0-test.33';
})();
