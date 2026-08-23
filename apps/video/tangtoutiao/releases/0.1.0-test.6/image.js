/* 汤头条 0.1.0-test.6 ImageDecryptAdapter / APK Glide parity */
var TangTouTiaoImageV015=(function(){
  var V='0.1.0-test.6';
  function newBytes(n){return java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE,n);}
  function copy(src,sp,dst,dp,len){java.lang.System.arraycopy(src,sp,dst,dp,len);}
  function readAll(input){var out=new java.io.ByteArrayOutputStream(),buf=newBytes(8192),n;while((n=input.read(buf))!==-1)out.write(buf,0,n);try{input.close();}catch(e){}return out.toByteArray();}
  function u8(v){return v<0?v+256:v;}
  function starts(a,b){if(!a||a.length<b.length)return false;for(var i=0;i<b.length;i++)if(u8(a[i])!==b[i])return false;return true;}
  function isImage(a){if(!a||a.length<4)return false;if(starts(a,[0xFF,0xD8,0xFF]))return true;if(starts(a,[0x89,0x50,0x4E,0x47]))return true;if(starts(a,[0x47,0x49,0x46,0x38]))return true;if(starts(a,[0x42,0x4D]))return true;if(a.length>=12&&starts(a,[0x52,0x49,0x46,0x46])&&u8(a[8])===0x57&&u8(a[9])===0x45&&u8(a[10])===0x42&&u8(a[11])===0x50)return true;return false;}
  function ascii(a){return String(new java.lang.String(a,'UTF-8')).trim();}
  function hexBytes(s){s=String(s||'').trim();if(!s||s.length%2!==0||!/^[0-9A-Fa-f]+$/.test(s))return null;var a=newBytes(s.length/2);for(var i=0;i<a.length;i++){var v=parseInt(s.substr(i*2,2),16);a[i]=v>127?v-256:v;}return a;}
  function evp(secret,keyLen,ivLen){var pass=new java.lang.String(String(secret)).getBytes('UTF-8'),md=java.security.MessageDigest.getInstance('MD5'),need=keyLen+ivLen,all=newBytes(need),pos=0,prev=null;while(pos<need){md.reset();if(prev)md.update(prev);md.update(pass);prev=md.digest();var n=Math.min(prev.length,need-pos);copy(prev,0,all,pos,n);pos+=n;}var key=newBytes(keyLen),iv=newBytes(ivLen);copy(all,0,key,0,keyLen);copy(all,keyLen,iv,0,ivLen);return{key:key,iv:iv};}
  function legacy(raw){var enc=hexBytes(ascii(raw));if(!enc||enc.length<17)return null;var iv=newBytes(16),body=newBytes(enc.length-16);copy(enc,0,iv,0,16);copy(enc,16,body,0,body.length);var p=evp('e79465cfbbimgkcusimcuekd3b066a6e',32,16),cipher=javax.crypto.Cipher.getInstance('AES/CFB/NoPadding'),key=new javax.crypto.spec.SecretKeySpec(p.key,'AES');cipher.init(2,key,new javax.crypto.spec.IvParameterSpec(iv));return cipher.doFinal(body);}
  function aesCbc(raw){var key=new javax.crypto.spec.SecretKeySpec(new java.lang.String('f5d965df75336270').getBytes('UTF-8'),'AES'),iv=new javax.crypto.spec.IvParameterSpec(new java.lang.String('97b60394abc2fbe1').getBytes('UTF-8')),cipher=javax.crypto.Cipher.getInstance('AES/CBC/PKCS5Padding');cipher.init(2,key,iv);return cipher.doFinal(raw);}
  function decrypt(input){var raw=readAll(input),out=raw,mode='plain';try{if(!isImage(raw)){var a=null;try{a=legacy(raw);}catch(e1){}if(a&&isImage(a)){out=a;mode='legacy-cfb';}else{var b=null;try{b=aesCbc(raw);}catch(e2){}if(b&&isImage(b)){out=b;mode='aes-cbc';}else{out=raw;mode='fallback-raw';}}}try{setItem('ttt_last_image_diag',JSON.stringify({time:Date.now(),ok:isImage(out),mode:mode,input:raw.length,output:out.length}));}catch(e3){}return new java.io.ByteArrayInputStream(out);}catch(e){try{setItem('ttt_last_image_diag',JSON.stringify({time:Date.now(),ok:false,error:String(e.message||e),input:raw?raw.length:0}));}catch(e4){}return new java.io.ByteArrayInputStream(raw||newBytes(0));}}
  return{version:V,decrypt:decrypt};
})();
try{$.exports=TangTouTiaoImageV015;}catch(e){}
