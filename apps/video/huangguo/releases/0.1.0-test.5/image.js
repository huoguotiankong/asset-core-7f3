/* 黄果短剧 0.1.0-test.5 ImageAdapter - exact Hiker image suffix decrypt contract */
var HuangGuoImageV1=(function(){
  function suffix(){
    return $().image(function(){
      const CryptoUtil=$.require('hiker://assets/crypto-java.js');
      const key=CryptoUtil.Data.parseUTF8('f5d965df75336270');
      const iv=CryptoUtil.Data.parseUTF8('97b60394abc2fbe1');
      const textData=CryptoUtil.Data.parseInputStream(input).toBase64(_base64.NO_WRAP);
      const decrypted=CryptoUtil.AES.decrypt(textData,key,{iv:iv,mode:'AES/CBC/NoPadding'}).toBase64(_base64.NO_WRAP);
      return CryptoUtil.Data.parseBase64(decrypted,_base64.NO_WRAP).toInputStream();
    });
  }
  function url(pic){pic=String(pic||'').trim();return pic?pic+suffix():'';}
  function decode(){
    const CryptoUtil=$.require('hiker://assets/crypto-java.js');
    const key=CryptoUtil.Data.parseUTF8('f5d965df75336270');
    const iv=CryptoUtil.Data.parseUTF8('97b60394abc2fbe1');
    const textData=CryptoUtil.Data.parseInputStream(input).toBase64(_base64.NO_WRAP);
    const decrypted=CryptoUtil.AES.decrypt(textData,key,{iv:iv,mode:'AES/CBC/NoPadding'}).toBase64(_base64.NO_WRAP);
    return CryptoUtil.Data.parseBase64(decrypted,_base64.NO_WRAP).toInputStream();
  }
  return{version:'0.1.0-test.5',url:url,decode:decode};
})();
