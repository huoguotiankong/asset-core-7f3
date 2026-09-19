/* ACFAN 0.1.0-test.3 image adapter - decode all HTTP images safely */
var ACFANImage=(function(){
  var C=ACFANCore,P=ACFANProtocol;
  function abs(raw,domain){var s=C.s(raw).trim().replace(/\\\//g,'/');if(!s)return'';if(/^(?:data:|hiker:|file:)/i.test(s))return s;if(s.indexOf('//')===0)return'https:'+s;if(/^https?:\/\//i.test(s))return s;var d=C.s(domain||getItem(C.K.imgDomain,'')).replace(/\/+$/,'');if(!d)d='https://cdn.ukaim.com';return d+'/'+s.replace(/^\/+/, '');}
  function thumb(url){url=C.s(url);if(!/\.asigoo\.com\//i.test(url)||/_480(?:[?#]|$)/i.test(url))return url;var q=url.indexOf('?');return q>=0?url.substring(0,q)+'_480'+url.substring(q):url+'_480';}
  function render(raw,domain,original){var plain=abs(raw,domain);if(!plain)return'';if(/^(?:data:|hiker:|file:)/i.test(plain))return plain;var target=original?plain:thumb(plain),cache='hiker://files/cache/acfan_t3_img/'+P.md5(target)+'.jpg',absCache='';try{if(fileExist(cache))return getPath(cache);absCache=getPath(cache);}catch(e0){}var headers={'User-Agent':'Dalvik/2.1.0 (Linux; U; Android 11; M2012K10C Build/RP1A.200720.011)','Referer':''};try{return $(target,headers).image(function(cacheAbs){return $.require('acfanImageDecoderT3?rule=ACFAN·T3').image(cacheAbs);},absCache);}catch(e){C.diag('IMAGE_T3_FAIL',target+' | '+String(e.message||e));return target+'@Referer=';}}
  return{abs:abs,url:function(raw,domain){return render(raw,domain,false);},original:function(raw,domain){return render(raw,domain,true);}};
})();
