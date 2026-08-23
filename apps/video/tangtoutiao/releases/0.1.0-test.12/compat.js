/* 汤头条 0.1.0-test.12 Core compatibility / proven PWA CBC image path */
var TangTouTiaoCoreV020=(function(){
  var C=TangTouTiaoCoreV019;
  var IMG_JS=$.toString(function(){
    var FileUtil=Packages.com.example.hikerview.utils.FileUtil,bytes=FileUtil.toBytes(input);
    function u8(v){return v<0?v+256:v;}function starts(a,b){if(!a||a.length<b.length)return false;for(var i=0;i<b.length;i++)if(u8(a[i])!==b[i])return false;return true;}
    function isImage(a){return !!(a&&a.length>=4&&(starts(a,[255,216,255])||starts(a,[137,80,78,71])||starts(a,[71,73,70,56])||starts(a,[66,77])||(a.length>=12&&starts(a,[82,73,70,70])&&u8(a[8])===87&&u8(a[9])===69&&u8(a[10])===66&&u8(a[11])===80)));}
    var out=bytes,mode='plain';
    if(!isImage(bytes))try{var key=new javax.crypto.spec.SecretKeySpec(new java.lang.String('f5d965df75336270').getBytes('UTF-8'),'AES'),iv=new javax.crypto.spec.IvParameterSpec(new java.lang.String('97b60394abc2fbe1').getBytes('UTF-8')),cipher=javax.crypto.Cipher.getInstance('AES/CBC/PKCS5Padding');cipher.init(2,key,iv);var dec=cipher.doFinal(bytes);if(isImage(dec)){out=dec;mode='aes-cbc-pwa';}}catch(e){}
    try{setItem('ttt_last_image_diag',JSON.stringify({time:Date.now(),ok:isImage(out),mode:mode,input:bytes?bytes.length:0,output:out?out.length:0}));}catch(e2){}
    return FileUtil.toInputStream(out);
  });
  function image(raw){var u=C.imageCandidate(raw);if(!u)return'';try{setItem('ttt_last_image_policy',JSON.stringify({time:Date.now(),mode:'pwa-proven-cbc-inline',url:String(u).substring(0,180)}));}catch(e){}return String(u)+'@js='+IMG_JS;}
  function fix(x){if(!x||typeof x!=='object')return x;if(x.coverRaw)x.cover=image(x.coverRaw);var m=x.raw&&x.raw.member;if(m&&(m.thumb||m.thumb_url))x.avatar=image(m.thumb||m.thumb_url);return x;}
  var oi=C.item,on=C.normalize,od=C.detailItem,oc=C.comicList,or=C.rankCreators;
  C.item=function(x){return fix(oi(x));};
  C.normalize=function(r,k){var a=on(r,k)||[];for(var i=0;i<a.length;i++)fix(a[i]);return a;};
  C.detailItem=function(r,f){return fix(od(r,f));};
  C.comicList=function(r){var a=oc(r)||[];for(var i=0;i<a.length;i++)fix(a[i]);return a;};
  C.rankCreators=function(r){var a=or(r)||[];for(var i=0;i<a.length;i++)fix(a[i]);return a;};
  C.imageUrl=image;C.version='0.1.0-test.12';return C;
})();
TangTouTiaoCoreV019=TangTouTiaoCoreV020;
try{TangTouTiaoCoreV017=TangTouTiaoCoreV020;}catch(e){}
