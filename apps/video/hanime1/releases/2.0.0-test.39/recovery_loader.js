/* Hanime1 Test39: focused repairs over Test38 */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.38/recovery_loader.js?hanime_test=39base',{headers:{'Cache-Control':'no-cache'}},20039);
var missing=[];if(typeof HanimeCore!=='object')missing.push('HanimeCore');if(typeof HanimeProvider!=='object')missing.push('HanimeProvider');if(typeof HanimePages!=='object')missing.push('HanimePages');if(typeof HanimeUI9!=='object')missing.push('HanimeUI9');if(typeof HanimeLayout12!=='object')missing.push('HanimeLayout12');if(missing.length)throw new Error('Test39 runtime preflight missing: '+missing.join(', '));
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.39/community39.js?hanime_mod=39c',{headers:{'Cache-Control':'no-cache'}},20039);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.39/account39.js?hanime_mod=39a',{headers:{'Cache-Control':'no-cache'}},20039);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.39/library39.js?hanime_mod=39l',{headers:{'Cache-Control':'no-cache'}},20039);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.39/search39.js?hanime_mod=39q',{headers:{'Cache-Control':'no-cache'}},20039);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.39/settings39.js?hanime_mod=39s',{headers:{'Cache-Control':'no-cache'}},20039);
HanimePages.build='2.0.0-test.39';HanimeCore.build='2.0.0-test.39';HanimeProvider.build='2.0.0-test.39';
})();
