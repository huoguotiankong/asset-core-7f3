/* Hanime1 Test34: device-driven rollback of replies + account/filter/search/creator fixes over Test33 */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.33/recovery_loader.js?hanime_test=34base',{headers:{'Cache-Control':'no-cache'}},20034);
var missing=[];if(typeof HanimeCore!=='object')missing.push('HanimeCore');if(typeof HanimeProvider!=='object')missing.push('HanimeProvider');if(typeof HanimePages!=='object')missing.push('HanimePages');if(typeof HanimeUI9!=='object')missing.push('HanimeUI9');if(typeof HanimeLayout12!=='object')missing.push('HanimeLayout12');if(missing.length)throw new Error('Test34 runtime preflight missing: '+missing.join(', '));
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.34/community34.js?hanime_mod=34c',{headers:{'Cache-Control':'no-cache'}},20034);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.34/account34.js?hanime_mod=34a',{headers:{'Cache-Control':'no-cache'}},20034);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.34/creator34.js?hanime_mod=34r',{headers:{'Cache-Control':'no-cache'}},20034);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.34/library34.js?hanime_mod=34l',{headers:{'Cache-Control':'no-cache'}},20034);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.34/search34.js?hanime_mod=34q',{headers:{'Cache-Control':'no-cache'}},20034);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.34/settings34.js?hanime_mod=34s',{headers:{'Cache-Control':'no-cache'}},20034);
HanimePages.build='2.0.0-test.34';HanimeCore.build='2.0.0-test.34';HanimeProvider.build='2.0.0-test.34';
})();
