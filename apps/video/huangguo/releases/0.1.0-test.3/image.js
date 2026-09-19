/* 黄果短剧 0.1.0-test.3 ImageAdapter - crypto-java compatible */
var HuangGuoImageV1=(function(){
  var C=HuangGuoCoreV1,KEY='f5d965df75336270',IV='97b60394abc2fbe1';
  function knownBase64(s){s=String(s||'');return s.indexOf('/9j/')===0||s.indexOf('iVBOR')===0||s.indexOf('R0lGOD')===0||s.indexOf('UklGR')===0;}
  function decode(){var CryptoUtil=$.require('hiker://assets/crypto-java.js'),data=CryptoUtil.Data.parseInputStream(input),b64=data.toBase64(_base64.NO_WRAP);if(knownBase64(b64))return data.toInputStream();try{var key=CryptoUtil.Data.parseUTF8(KEY),iv=CryptoUtil.Data.parseUTF8(IV),dec=CryptoUtil.AES.decrypt(b64,key,{iv:iv,mode:'AES/CBC/NoPadding'}),out=dec.toBase64(_base64.NO_WRAP);if(!knownBase64(out))C.diag('IMAGE_UNKNOWN','', 'decrypted-header-not-known');return CryptoUtil.Data.parseBase64(out,_base64.NO_WRAP).toInputStream();}catch(e){C.diag('IMAGE_DECRYPT_FAIL','',String(e.message||e));return data.toInputStream();}}
  function suffix(){return $().image(function(){return $.require('hgdrama').decodeImage();});}
  function url(pic,ref){pic=String(pic||'');if(!pic)return'';var u=pic;if(ref)u=u+'@Referer='+encodeURIComponent(ref);return u+suffix();}
  return{version:'0.1.0-test.3',url:url,decode:decode};
})();
