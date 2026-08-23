/* 汤头条 0.1.0-test.15 Core final adapter / thumb_cover_str first + self-fetch image */
var TangTouTiaoCoreV023=(function(){
  var C=TangTouTiaoCoreV021,MOD='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/tangtoutiao/releases/0.1.0-test.15/image.js?v=10115';
  var PH='hiker://files/cache/tangtoutiao/ttt_img_placeholder_v15.png',HEX='89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D49444154789C6360000000020001E221BC330000000049454E44AE426082';
  function ensure(){try{if(!fileExist(PH))writeHexFile(PH,HEX);}catch(e){}return PH;}
  function candidates(raw,x){var a=[],seen={};function add(v){if(!v)return;var cs=C.imageCandidates(v)||[];for(var i=0;i<cs.length;i++)if(!seen[cs[i]]){seen[cs[i]]=1;a.push(cs[i]);}}if(x&&x.raw){add(x.raw.thumb_cover_str);add(x.raw.thumb_cover);add(x.raw.cover);add(x.raw.thumb);}add(raw);return a;}
  function image(raw,x){var cs=candidates(raw,x);if(!cs.length)return'';try{setItem('ttt_last_image_policy',JSON.stringify({time:Date.now(),mode:'self-fetch-thumb-cover-str-first',candidates:cs.length,first:String(cs[0]).substring(0,180)}));}catch(e0){}try{return $(ensure()).image(function(mod,c){try{var r=$.require(mod).fetchDecrypt(c);if(r){try{closeMe(input);}catch(e){}return r;}}catch(e1){}return input;},MOD,JSON.stringify(cs));}catch(e2){return cs[0];}}
  function fix(it){if(!it||typeof it!=='object')return it;var raw=it.raw||{},pref=raw.thumb_cover_str||raw.thumb_cover||it.coverRaw;if(pref)it.coverRaw=pref;it.cover=image(pref,it);return it;}
  var oi=C.item,on=C.normalize,od=C.detailItem,oc=C.comicList,or=C.rankCreators;
  C.item=function(x){return fix(oi(x));};C.normalize=function(r,k){var a=on(r,k)||[];for(var i=0;i<a.length;i++)fix(a[i]);return a;};C.detailItem=function(r,f){var it=od(r,f);if(f&&f.coverRaw&&!it.raw.thumb_cover_str)it.coverRaw=f.coverRaw;return fix(it);};C.comicList=function(r){var a=oc(r)||[];for(var i=0;i<a.length;i++)fix(a[i]);return a;};C.rankCreators=function(r){var a=or(r)||[];for(var i=0;i<a.length;i++)fix(a[i]);return a;};C.imageUrl=function(raw){return image(raw,null);};C.version='0.1.0-test.15';return C;
})();
TangTouTiaoCoreV021=TangTouTiaoCoreV023;TangTouTiaoCoreV020=TangTouTiaoCoreV023;TangTouTiaoCoreV019=TangTouTiaoCoreV023;
