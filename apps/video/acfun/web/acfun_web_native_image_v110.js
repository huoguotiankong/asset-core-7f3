/** ACFun Web-Native 1.1.0-web2 - self-contained image adapter */
(function(){
if(typeof ACFunNext!=='object')throw new Error('ACFunNext missing');
var A=ACFunNext;
A.image=function(raw,domain){
 var plain=A.absImage(raw,domain);if(!plain)return'';
 if(/^(?:data:|hiker:|file:)/i.test(plain))return plain;
 if(!/\.asigoo\.com\//i.test(plain))return plain+'@Referer=';
 var target=A.__a2ImageTarget?A.__a2ImageTarget(plain):plain,cache='hiker://files/cache/acfun_web_native_img/'+A.md5(target)+'.jpg',abs='';
 try{if(fileExist(cache))return getPath(cache);abs=getPath(cache);}catch(e0){}
 try{return $(target,{'User-Agent':'Dalvik/2.1.0 (Linux; U; Android 11)','Referer':''}).image(function(cacheAbs){return $.require('acfun_web_image_decoder?rule=ACFun·网页版').image(cacheAbs);},abs);}catch(e){return target+'@Referer=';}
};
})();
