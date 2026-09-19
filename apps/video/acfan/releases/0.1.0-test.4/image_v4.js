/* ACFAN 0.1.0-test.4 image adapter - APK fields + proven Hiker image contract */
var ACFANImage=(function(){
  var C=ACFANCore,P=ACFANProtocol,CDN='https://cdn.ukaim.com/';
  function abs(raw,domain){var s=C.s(raw).trim().replace(/\\\//g,'/');if(!s)return'';if(/^(?:data:|hiker:|file:)/i.test(s))return s;if(s.indexOf('//')===0)return'https:'+s;if(/^https?:\/\//i.test(s))return s;if(/^\/?jhimage\//i.test(s))return CDN+s.replace(/^\/+/, '');var d=C.s(domain||getItem(C.K.imgDomain,'')).replace(/\/+$/,'');if(!d)d=CDN.replace(/\/+$/,'');return d+'/'+s.replace(/^\/+/, '');}
  function thumb(url){url=C.s(url);if(!/\.asigoo\.com\//i.test(url)||/_480(?:[?#]|$)/i.test(url))return url;var q=url.indexOf('?');return q>=0?url.substring(0,q)+'_480'+url.substring(q):url+'_480';}
  function reqHeaders(){var h=C.s(getItem(C.K.host,'')||C.staticApiHosts[0]).replace(/\/+$/,'');return{'User-Agent':C.ua,'Referer':h?h+'/':'','Origin':h};}
  function render(raw,domain,original){var plain=abs(raw,domain);if(!plain)return'';if(/^(?:data:|hiker:|file:)/i.test(plain))return plain;var target=original?plain:thumb(plain),cache='hiker://files/cache/acfan_t4_img/'+P.md5(target)+'.img',absCache='';try{if(fileExist(cache))return getPath(cache);absCache=getPath(cache);}catch(e0){}try{return $(target,reqHeaders()).image(function(cacheAbs){return $.require('acfanImageDecoderT4?rule=ACFAN·T4').image(cacheAbs);},absCache);}catch(e){C.diag('IMAGE_T4_FAIL',target+' | '+String(e.message||e));return target+'@Referer='+encodeURIComponent(reqHeaders().Referer);}}
  return{abs:abs,url:function(raw,domain){return render(raw,domain,false);},original:function(raw,domain){return render(raw,domain,true);}};
})();
