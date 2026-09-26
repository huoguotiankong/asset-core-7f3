/* ACFAN 0.2.1-test.7 image pipeline */
var ACFAN7Image=(function(){
  var C=ACFAN7Core,P=ACFAN7Protocol;
  function strip(u){u=C.s(u).trim().replace(/\\\//g,'/');var marks=['@js=','@headers=','@Referer=','@Cookie='];for(var i=0;i<marks.length;i++){var p=u.indexOf(marks[i]);if(p>=0)u=u.substring(0,p);}return u;}
  function discoverDomain(){var d=C.s(getItem(C.K.imgDomain,'')).replace(/\/+$/,'');return d||C.s(C.imageCdn).replace(/\/+$/,'');}
  function plain(raw,domain){var u=strip(raw);if(!u)return'';if(u.indexOf('//')===0)u='https:'+u;if(/^(?:data:|hiker:|file:)/i.test(u)||/^https?:\/\//i.test(u))return u;var d=C.s(domain||'').replace(/\/+$/,'')||discoverDomain();if(/^\/?jhimage\//i.test(u))d=C.s(C.imageCdn).replace(/\/+$/,'');return d?d+'/'+u.replace(/^\/+/, ''):u;}
  function thumb(url){if(getItem(C.K.imageQuality,'480')==='original')return url;if(!/\.asigoo\.com\//i.test(url)||/_480(?:[?#]|$)/i.test(url))return url;var q=url.indexOf('?');return q>=0?url.substring(0,q)+'_480'+url.substring(q):url+'_480';}
  function headers(){return{'User-Agent':C.dalvik,'Referer':''};}
  function encrypted(p,raw){return /\.asigoo\.com\//i.test(p)||/cdn\.ukaim\.com\//i.test(p)||/^\/?jhimage\//i.test(C.s(raw));}
  function render(raw,domain,original){var p=plain(raw,domain);if(!p)return'';try{setItem('acfan_t7_image_raw',C.s(raw).slice(0,1000));setItem('acfan_t7_image_resolved',p.slice(0,1200));}catch(dx){}if(/^(?:data:|hiker:|file:)/i.test(p))return p;if(!encrypted(p,raw))return p;var target=original?p:thumb(p),cache='hiker://files/cache/acfan_t7_image/'+P.md5(target)+'.jpg',abs='';try{if(fileExist(cache))return getPath(cache);abs=getPath(cache);}catch(e0){}try{var out=$(target,headers()).image(function(cacheAbs){return $.require('acfanT7Image?rule=ACFAN·T7').image(cacheAbs);},abs);try{setItem('acfan_t7_image_rendered',C.s(out).slice(0,1200));}catch(dx2){}return out;}catch(e){try{setItem('acfan_t7_image_error',C.s(e.message||e).slice(0,800));}catch(dx3){}C.diag('IMAGE_PIPELINE_FAIL',target+' | '+C.s(e.message||e));return target+'@Referer=';}}
  return{plain:plain,url:function(raw,domain){return render(raw,domain,false);},original:function(raw,domain){return render(raw,domain,true);},headers:headers};
})();
