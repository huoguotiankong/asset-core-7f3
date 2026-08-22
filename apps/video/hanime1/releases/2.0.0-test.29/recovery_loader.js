/* Hanime1 Test29 recovery: rebuild on last bootable Test26, skip Test27/Test28 UI modules */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.26/recovery_loader.js?hanime_recovery=29',{headers:{'Cache-Control':'no-cache'}},20029);
var missing=[];
if(typeof HanimeCore!=='object')missing.push('HanimeCore');
if(typeof HanimeProvider!=='object')missing.push('HanimeProvider');
if(typeof HanimePages!=='object')missing.push('HanimePages');
if(typeof HanimeUI9!=='object')missing.push('HanimeUI9');
if(typeof HanimeLayout12!=='object')missing.push('HanimeLayout12');
if(missing.length)throw new Error('Test29 runtime preflight missing: '+missing.join(', '));
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.28/replies28.js?hanime_mod=29r',{headers:{'Cache-Control':'no-cache'}},20029);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.28/creator28.js?hanime_mod=29c',{headers:{'Cache-Control':'no-cache'}},20029);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.29/ui29.js?hanime_mod=29u',{headers:{'Cache-Control':'no-cache'}},20029);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.29/settings29.js?hanime_mod=29s',{headers:{'Cache-Control':'no-cache'}},20029);
HanimePages.build='2.0.0-test.29';
HanimeCore.build='2.0.0-test.29';
HanimeProvider.build='2.0.0-test.29';
})();
