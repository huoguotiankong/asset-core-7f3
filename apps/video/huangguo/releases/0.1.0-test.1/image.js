/* 黄果短剧 0.1.0-test.1 ImageAdapter - AES/CBC/NoPadding + plain-image passthrough */
var HuangGuoImageV1=(function(){
  var C=HuangGuoCoreV1;
  var KEY='f5d965df75336270',IV='97b60394abc2fbe1';
  function plain(bytes){if(!bytes||bytes.length<12)return false;function b(i){return bytes[i]&255;}if(b(0)===255&&b(1)===216&&b(2)===255)return true;if(b(0)===137&&b(1)===80&&b(2)===78&&b(3)===71)return true;if(b(0)===71&&b(1)===73&&b(2)===70&&b(3)===56)return true;if(b(0)===82&&b(1)===73&&b(2)===70&&b(3)===70&&b(8)===87&&b(9)===69&&b(10)===66&&b(11)===80)return true;return false;}
  function decode(){var FileUtil=Packages.com.example.hikerview.utils.FileUtil,bytes=FileUtil.toBytes(input);if(plain(bytes))return FileUtil.toInputStream(bytes);try{var Cipher=Packages.javax.crypto.Cipher,SecretKeySpec=Packages.javax.crypto.spec.SecretKeySpec,IvParameterSpec=Packages.javax.crypto.spec.IvParameterSpec,keyBytes=new java.lang.String(KEY).getBytes('UTF-8'),ivBytes=new java.lang.String(IV).getBytes('UTF-8'),cipher=Cipher.getInstance('AES/CBC/NoPadding');cipher.init(Cipher.DECRYPT_MODE,new SecretKeySpec(keyBytes,'AES'),new IvParameterSpec(ivBytes));var out=cipher.doFinal(bytes);if(!plain(out))C.diag('IMAGE_UNKNOWN','', 'decrypted-bytes-not-known-image');return FileUtil.toInputStream(out);}catch(e){C.diag('IMAGE_DECRYPT_FAIL','',String(e.message||e));return FileUtil.toInputStream(bytes);}}
  function url(pic,ref){pic=String(pic||'');if(!pic)return'';return $(pic,{headers:C.headers(ref||C.origin(pic)+'/')}).image(function(){return $.require('hgdrama').decodeImage();});}
  return{version:'0.1.0-test.1',url:url,decode:decode};
})();
