/* 汤头条 0.1.0-test.5 ImageAdapter / APK Glide decrypt chain */
var TangTouTiaoImageV014=(function(){
  var V='0.1.0-test.5',LEGACY='e79465cfbbimgkcusimcuekd3b066a6e',CBC_KEY='f5d965df75336270',CBC_IV='97b60394abc2fbe1';
  function newBytes(n){return java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE,n);}
  function copy(src,sp,dst,dp,len){java.lang.System.arraycopy(src,sp,dst,dp,len);}
  function readAll(input){var out=new java.io.ByteArrayOutputStream(),buf=newBytes(8192),n;while((n=input.read(buf))!==-1)out.write(buf,0,n);return out.toByteArray();}
  function u(b){return b<0?b+256:b;}
  function magic(a){if(!a||a.length<4)return false;var b0=u(a[0]),b1=u(a[1]),b2=u(a[2]),b3=u(a[3]);if(b0===0xff&&b1===0xd8)return true;if(b0===0x89&&b1===0x50&&b2===0x4e&&b3===0x47)return true;if(b0===0x47&&b1===0x49&&b2===0x46&&b3===0x38)return true;if(b0===0x42&&b1===0x4d)return true;if(a.length>=12){var s='';for(var i=0;i<12;i++)s+=String.fromCharCode(u(a[i]));if(s.indexOf('RIFF')===0&&s.substring(8,12)==='WEBP')return true;}return false;}
  function ascii(a){try{return String(new java.lang.String(a,'UTF-8')).trim();}catch(e){return'';}}
  function isHex(s){return !!s&&s.length>=34&&s.length%2===0&&/^[0-9A-Fa-f]+$/.test(s);}
  function hexBytes(s){var a=newBytes(s.length/2);for(var i=0;i<a.length;i++){var v=parseInt(s.substr(i*2,2),16);if(isNaN(v))return null;a[i]=v>127?v-256:v;}return a;}
  function bytes(s){return new java.lang.String(String(s)).getBytes('UTF-8');}
  function evp(secret,keyLen,ivLen){var pass=bytes(secret),md=java.security.MessageDigest.getInstance('MD5'),need=keyLen+ivLen,all=newBytes(need),pos=0,prev=null;while(pos<need){md.reset();if(prev)md.update(prev);md.update(pass);prev=md.digest();var n=Math.min(prev.length,need-pos);copy(prev,0,all,pos,n);pos+=n;}var key=newBytes(keyLen),iv=newBytes(ivLen);copy(all,0,key,0,keyLen);copy(all,keyLen,iv,0,ivLen);return{key:key,iv:iv};}
  function legacy(a){var s=ascii(a);if(!isHex(s))return null;var all=hexBytes(s);if(!all||all.length<17)return null;var iv=newBytes(16),body=newBytes(all.length-16);copy(all,0,iv,0,16);copy(all,16,body,0,body.length);var p=evp(LEGACY,32,16),cipher=javax.crypto.Cipher.getInstance('AES/CFB/NoPadding'),key=new javax.crypto.spec.SecretKeySpec(p.key,'AES');cipher.init(2,key,new javax.crypto.spec.IvParameterSpec(iv));return cipher.doFinal(body);}
  function cbc(a){var cipher=javax.crypto.Cipher.getInstance('AES/CBC/PKCS5Padding'),key=new javax.crypto.spec.SecretKeySpec(bytes(CBC_KEY),'AES'),iv=new javax.crypto.spec.IvParameterSpec(bytes(CBC_IV));cipher.init(2,key,iv);return cipher.doFinal(a);}
  function diag(mode,before,after,ok){try{setItem('ttt_last_image_diag',JSON.stringify({time:Date.now(),mode:mode,inputLength:before,outputLength:after,ok:!!ok}));}catch(e){}}
  function decrypt(input){var raw=readAll(input);if(magic(raw)){diag('plain',raw.length,raw.length,true);return new java.io.ByteArrayInputStream(raw);}try{var x=legacy(raw);if(x&&magic(x)){diag('legacy-aes-cfb',raw.length,x.length,true);return new java.io.ByteArrayInputStream(x);}}catch(e1){}try{var y=cbc(raw);if(y&&magic(y)){diag('aes-cbc',raw.length,y.length,true);return new java.io.ByteArrayInputStream(y);}}catch(e2){}diag('raw-fallback',raw.length,raw.length,false);return new java.io.ByteArrayInputStream(raw);}
  return{version:V,decrypt:decrypt};
})();
