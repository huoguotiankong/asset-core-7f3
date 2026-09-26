/* ACFAN 0.2.0-test.6 image pipeline */
var ACFAN6Image=(function(){
  var C=ACFAN6Core,P=ACFAN6Protocol;
  function strip(u){u=C.s(u).trim().replace(/\\\//g,'/');var marks=['@js=','@headers=','@Referer=','@Cookie='];for(var i=0;i<marks.length;i++){var p=u.indexOf(marks[i]);if(p>=0)u=u.substring(0,p);}return u;}
  function discoverDomain(){var d=C.s(getItem(C.K.imgDomain,'')).replace(/\/+$/,'');if(d)return d;for(var i=0;i<C.configUrls.length;i++){try{var raw=fetch(C.configUrls[i]+'?_='+Date.now(),{timeout:2200,headers:{'User-Agent':C.ua,'Accept':'application/json,*/*','Cache-Control':'no-cache'}}),j=P.safeJson(raw),x=C.deep(j||{},['imgDomain','imageDomain','cdnDomain'],0);if(typeof x==='string'&&/^https?:\/\//i.test(x)){d=C.s(x).replace(/\/+$/,'');setItem(C.K.imgDomain,d);return d;}}catch(e){}}return'';}
  function plain(raw,domain){var u=strip(raw);if(!u)return'';if(u.indexOf('//')===0)u='https:'+u;if(/^(?:data:|hiker:|file:)/i.test(u)||/^https?:\/\//i.test(u))return u;var d=C.s(domain||'').replace(/\/+$/,'')||discoverDomain();return d?d+'/'+u.replace(/^\/+/, ''):u;}
  function thumb(url){if(getItem(C.K.imageQuality,'480')==='original')return url;if(!/\.asigoo\.com\//i.test(url)||/_480(?:[?#]|$)/i.test(url))return url;var q=url.indexOf('?');return q>=0?url.substring(0,q)+'_480'+url.substring(q):url+'_480';}
  function headers(){return{'User-Agent':C.dalvik,'Referer':''};}
  function render(raw,domain,original){var p=plain(raw,domain);if(!p)return'';if(/^(?:data:|hiker:|file:)/i.test(p))return p;if(!/\.asigoo\.com\//i.test(p))return p;var target=original?p:thumb(p),cache='hiker://files/cache/acfan_t6_image/'+P.md5(target)+'.img',abs='';try{if(fileExist(cache))return getPath(cache);abs=getPath(cache);}catch(e0){}try{return $(target,headers()).image(function(cacheAbs){return $.require('acfanT6Image?rule=ACFAN·T6').decode(cacheAbs);},abs);}catch(e){C.diag('IMAGE_PIPELINE_FAIL',target+' | '+C.s(e.message||e));return target+'@Referer=';}}
  return{plain:plain,url:function(raw,domain){return render(raw,domain,false);},original:function(raw,domain){return render(raw,domain,true);},headers:headers};
})();
