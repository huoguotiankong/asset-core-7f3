/* Hanime1 Test38: targeted fixes over device-validated Test37 */
(function(){
var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/';
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.37/recovery_loader.js?hanime_test=38base',{headers:{'Cache-Control':'no-cache'}},20038);
var missing=[];if(typeof HanimeCore!=='object')missing.push('HanimeCore');if(typeof HanimeProvider!=='object')missing.push('HanimeProvider');if(typeof HanimePages!=='object')missing.push('HanimePages');if(typeof HanimeUI9!=='object')missing.push('HanimeUI9');if(typeof HanimeLayout12!=='object')missing.push('HanimeLayout12');if(missing.length)throw new Error('Test38 runtime preflight missing: '+missing.join(', '));
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.38/community38.js?hanime_mod=38c',{headers:{'Cache-Control':'no-cache'}},20038);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.38/account38.js?hanime_mod=38a',{headers:{'Cache-Control':'no-cache'}},20038);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.38/search38.js?hanime_mod=38q',{headers:{'Cache-Control':'no-cache'}},20038);
require(ROOT+'apps/video/hanime1/releases/2.0.0-test.38/settings38.js?hanime_mod=38s',{headers:{'Cache-Control':'no-cache'}},20038);
HanimePages.build='2.0.0-test.38';HanimeCore.build='2.0.0-test.38';HanimeProvider.build='2.0.0-test.38';
})();
