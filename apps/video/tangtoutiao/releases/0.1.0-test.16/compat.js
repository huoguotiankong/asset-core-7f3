/* 汤头条 0.1.0-test.16 Core final adapter / thumb_cover_str first + proven inline decrypt */
var TangTouTiaoCoreV024=(function(){
  var C=TangTouTiaoCoreV023;
  var IMG_JS=$.toString(function(){
    var FileUtil=Packages.com.example.hikerview.utils.FileUtil,bytes=FileUtil.toBytes(input);
    function u8(v){return v<0?v+256:v;}
    function starts(a,b){if(!a||a.length<b.length)return false;for(var i=0;i<b.length;i++)if(u8(a[i])!==b[i])return false;return true;}
    function isImage(a){return !!(a&&a.length>=4&&(starts(a,[255,216,255])||starts(a,[137,80,78,71])||starts(a,[71,73,70,56])||starts(a,[66,77])||(a.length>=12&&starts(a,[82,73,70,70])&&u8(a[8])===87&&u8(a[9])===69&&u8(a[10])===66&&u8(a[11])===80)));}
    function newBytes(n){return java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE,n);}
    function copy(src,sp,dst,dp,len){java.lang.System.arraycopy(src,sp,dst,dp,len);}
    function hexBytes(s){s=String(s||'').trim();if(!s||s.length%2!==0||!/^[0-9A-Fa-f]+$/.test(s))return null;var a=newBytes(s.length/2);for(var i=0;i<a.length;i++){var v=parseInt(s.substr(i*2,2),16);a[i]=v>127?v-256:v;}return a;}
    function evp(secret,keyLen,ivLen){var pass=new java.lang.String(String(secret)).getBytes('UTF-8'),md=java.security.MessageDigest.getInstance('MD5'),need=keyLen+ivLen,all=newBytes(need),pos=0,prev=null;while(pos<need){md.reset();if(prev)md.update(prev);md.update(pass);prev=md.digest();var n=Math.min(prev.length,need-pos);copy(prev,0,all,pos,n);pos+=n;}var key=newBytes(keyLen),iv=newBytes(ivLen);copy(all,0,key,0,keyLen);copy(all,keyLen,iv,0,ivLen);return{key:key,iv:iv};}
    function cbc(raw){var key=new javax.crypto.spec.SecretKeySpec(new java.lang.String('f5d965df75336270').getBytes('UTF-8'),'AES'),iv=new javax.crypto.spec.IvParameterSpec(new java.lang.String('97b60394abc2fbe1').getBytes('UTF-8')),cipher=javax.crypto.Cipher.getInstance('AES/CBC/PKCS5Padding');cipher.init(2,key,iv);return cipher.doFinal(raw);}
    function legacy(raw){var text=String(new java.lang.String(raw,'UTF-8')).trim(),enc=hexBytes(text);if(!enc||enc.length<17)return null;var iv=newBytes(16),body=newBytes(enc.length-16);copy(enc,0,iv,0,16);copy(enc,16,body,0,body.length);var p=evp('e79465cfbbimgkcusimcuekd3b066a6e',32,16),cipher=javax.crypto.Cipher.getInstance('AES/CFB/NoPadding'),key=new javax.crypto.spec.SecretKeySpec(p.key,'AES');cipher.init(2,key,new javax.crypto.spec.IvParameterSpec(iv));return cipher.doFinal(body);}
    var out=bytes,mode='plain',ok=isImage(bytes);
    if(!ok)try{var a=cbc(bytes);if(isImage(a)){out=a;mode='aes-cbc-pwa';ok=true;}}catch(e1){}
    if(!ok)try{var b=legacy(bytes);if(b&&isImage(b)){out=b;mode='legacy-cfb-app';ok=true;}}catch(e2){}
    try{setItem('ttt_last_image_diag',JSON.stringify({time:Date.now(),ok:ok,mode:mode,input:bytes?bytes.length:0,output:out?out.length:0}));}catch(e3){}
    return FileUtil.toInputStream(out);
  });
  function candidates(raw,x){var a=[],seen={};function add(v){if(!v)return;var cs=C.imageCandidates(v)||[];for(var i=0;i<cs.length;i++)if(!seen[cs[i]]){seen[cs[i]]=1;a.push(cs[i]);}}if(x&&x.raw){add(x.raw.thumb_cover_str);add(x.raw.thumb_cover);add(x.raw.cover);add(x.raw.thumb);add(x.raw.cover_url);add(x.raw.img_url);}add(raw);return a;}
  function image(raw,x){var cs=candidates(raw,x);if(!cs.length)return'';var u=String(cs[0]);try{setItem('ttt_last_image_policy',JSON.stringify({time:Date.now(),mode:'inline-thumb-cover-str-first',candidates:cs.length,first:u.substring(0,180)}));}catch(e){}return u+'@js='+IMG_JS;}
  function fix(it){if(!it||typeof it!=='object')return it;var raw=it.raw||{},pref=raw.thumb_cover_str||raw.thumb_cover||raw.cover||raw.thumb||raw.cover_url||raw.img_url||it.coverRaw;if(pref)it.coverRaw=pref;it.cover=image(pref,it);var m=raw.member;if(m&&(m.thumb||m.thumb_url))it.avatar=image(m.thumb||m.thumb_url,{raw:m});return it;}
  var oi=C.item,on=C.normalize,od=C.detailItem,oc=C.comicList,or=C.rankCreators;
  C.item=function(x){return fix(oi(x));};
  C.normalize=function(r,k){var a=on(r,k)||[];for(var i=0;i<a.length;i++)fix(a[i]);return a;};
  C.detailItem=function(r,f){var it=od(r,f);if(f&&f.coverRaw&&!it.raw.thumb_cover_str&&!it.raw.thumb_cover)it.coverRaw=f.coverRaw;return fix(it);};
  C.comicList=function(r){var a=oc(r)||[];for(var i=0;i<a.length;i++)fix(a[i]);return a;};
  C.rankCreators=function(r){var a=or(r)||[];for(var i=0;i<a.length;i++)fix(a[i]);return a;};
  C.imageUrl=function(raw){return image(raw,null);};C.version='0.1.0-test.16';return C;
})();
TangTouTiaoCoreV023=TangTouTiaoCoreV024;TangTouTiaoCoreV021=TangTouTiaoCoreV024;TangTouTiaoCoreV020=TangTouTiaoCoreV024;TangTouTiaoCoreV019=TangTouTiaoCoreV024;
