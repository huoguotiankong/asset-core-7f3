/* 色花堂 0.1.0-test.30 / Build 10130 - fast thread fetch path + short-lived shared thread cache */
var SeHuaTangPatchTest30=(function(){
var BASE=SeHuaTangRemoteRuntime,C=SeHuaTangV16Core;
var CACHE_TTL=180000,MAX_CACHE_HTML=3600000;
var K_ID='sht_thread_fast_v30_id',K_TS='sht_thread_fast_v30_ts',K_URL='sht_thread_fast_v30_url',K_HTML='sht_thread_fast_v30_html';
function s(v){return v==null?'':String(v)}
function now(){return new Date().getTime()}
function tid(u){return C.threadId(u)||s(u).replace(/[^a-z0-9]/ig,'').slice(-48)}
function hasThread(h){return /id=["']postlist["']|class=["'][^"']*\bt_fsz\b|class=["'][^"']*\bt_f\b|id=["']postmessage_\d+|class=["'][^"']*\bmessage\b/i.test(s(h))}
function getv(k){try{return s(getVar(k,'')||'')}catch(e){return''}}
function putv(k,v){try{putVar(k,s(v))}catch(e){}}
function cacheRead(u){var id=tid(u),cid=getv(K_ID),ts=Number(getv(K_TS)||0),h=getv(K_HTML),cu=getv(K_URL);if(!id||cid!==id||!h||!hasThread(h)||now()-ts>CACHE_TTL)return null;return{html:h,url:cu||C.toMobile(u),diag:'v30-cache '+h.length}}
function cacheWrite(u,ref,h){h=s(h);if(!h||!hasThread(h)||h.length>MAX_CACHE_HTML)return;putv(K_ID,tid(u));putv(K_TS,String(now()));putv(K_URL,ref||C.toMobile(u));putv(K_HTML,h)}
function fastRequest(u,pc,timeout){try{return s(fetch(u,{headers:C.headers(!!pc,u),timeout:timeout||9000}))}catch(e){return''}}
function makeFastFetcher(oldFetch){return function(url){var mu=C.toMobile(url),pu=C.toPc(url),c=cacheRead(mu),h='',diag=[],t0=now(),t;if(c)return c;
  t=now();h=fastRequest(mu,false,9000);diag.push('m-fetch '+(now()-t)+'ms '+h.length+'/'+(hasThread(h)?'dom':'no'));if(hasThread(h)){cacheWrite(mu,mu,h);return{html:h,url:mu,diag:'v30 '+diag.join('；')+'；total '+(now()-t0)+'ms'}}
  t=now();h=fastRequest(pu,true,9000);diag.push('pc-fetch '+(now()-t)+'ms '+h.length+'/'+(hasThread(h)?'dom':'no'));if(hasThread(h)){cacheWrite(mu,pu,h);return{html:h,url:pu,diag:'v30 '+diag.join('；')+'；total '+(now()-t0)+'ms'}}
  if(oldFetch){t=now();try{var r=oldFetch(mu)||{};diag.push('web-fallback '+(now()-t)+'ms '+s(r.html).length+'/'+(hasThread(r.html)?'dom':'no'));if(hasThread(r.html)){cacheWrite(mu,r.url||mu,r.html);r.diag='v30 '+diag.join('；')+'；total '+(now()-t0)+'ms';return r}}catch(e2){diag.push('web-fallback-error')}}
  return{html:h,url:pu,diag:'v30 '+diag.join('；')+'；total '+(now()-t0)+'ms'}
}}
function module(){var m=BASE.module(),dbg=m._debug||{},oldFetch=dbg.threadFetchMobileV12;m.version='0.1.0-test.30';m.build=10130;m._debug=dbg;m._debug.threadFetchMobileV12=makeFastFetcher(oldFetch);m._debug.threadFastCacheV30={ttl:CACHE_TTL};return m}
var P={version:'0.1.0-test.30',build:10130,module:module};SeHuaTangRemoteRuntime=P;return P;
})();
