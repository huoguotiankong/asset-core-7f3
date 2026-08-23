/* 汤头条 0.1.0-test.4 PlaybackAdapter / APK encrypted-m3u8 proxy */
var TangTouTiaoPlaybackV013=(function(){
  var V='0.1.0-test.4';
  function compactUrl(u){u=String(u||'');return u.length>140?u.substring(0,70)+'…'+u.substring(u.length-50):u;}
  function makeProxy(){
    var code=$.toString(function(){
      function jstr(s){return new java.lang.String(String(s==null?'':s));}
      function bytes(s){return jstr(s).getBytes('UTF-8');}
      function newBytes(n){return java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE,n);}
      function copy(src,sp,dst,dp,len){java.lang.System.arraycopy(src,sp,dst,dp,len);}
      function hexBytes(s){s=String(s||'').trim();if(!s||s.length%2!==0)return null;var a=newBytes(s.length/2);for(var i=0;i<a.length;i++){var v=parseInt(s.substr(i*2,2),16);if(isNaN(v))return null;a[i]=v>127?v-256:v;}return a;}
      function evp(secret,keyLen,ivLen){var pass=bytes(secret),md=java.security.MessageDigest.getInstance('MD5'),need=keyLen+ivLen,all=newBytes(need),pos=0,prev=null;while(pos<need){md.reset();if(prev)md.update(prev);md.update(pass);prev=md.digest();var n=Math.min(prev.length,need-pos);copy(prev,0,all,pos,n);pos+=n;}var key=newBytes(keyLen),iv=newBytes(ivLen);copy(all,0,key,0,keyLen);copy(all,keyLen,iv,0,ivLen);return{key:key,iv:iv};}
      function decrypt(hex,secret){var all=hexBytes(hex);if(!all||all.length<17)throw new Error('m3u8密文不是合法HEX');var iv=newBytes(16),body=newBytes(all.length-16);copy(all,0,iv,0,16);copy(all,16,body,0,body.length);var p=evp(secret,32,16),cipher=javax.crypto.Cipher.getInstance('AES/CFB/NoPadding'),key=new javax.crypto.spec.SecretKeySpec(p.key,'AES');cipher.init(2,key,new javax.crypto.spec.IvParameterSpec(iv));return String(new java.lang.String(cipher.doFinal(body),'UTF-8'));}
      function childProxy(u,base){if(!base||!/\.m3u8(?:\?|$)/i.test(u))return u;return base+'?m3u8=1&u='+encodeURIComponent(base64Encode(u))+'&p='+encodeURIComponent(base64Encode(base))+'&_t='+Date.now();}
      try{
        var remote=base64Decode(decodeURIComponent(String(MY_PARAMS.u||''))),base=base64Decode(decodeURIComponent(String(MY_PARAMS.p||''))),refer=String(getItem('ttt_player_refer','')||''),xauth=String(getItem('ttt_player_xauth','')||''),dekey=String(getItem('ttt_player_dekey','')||'');
        var headers={'User-Agent':'Mozilla/5.0 (Linux; Android 13; HikerView) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36','Accept':'*/*','Cache-Control':'no-cache'};if(refer)headers.Referer=refer;if(xauth)headers['X-Auth']=xauth;
        var raw=String(fetch(remote,{timeout:15000,headers:headers})||''),trim=raw.trim(),plain=trim,mode='plain';
        if(trim.indexOf('#EXTM3U')!==0){if(!dekey)throw new Error('播放器配置缺少 dekey');plain=decrypt(trim,dekey).trim();mode='aes-cfb';}
        if(plain.indexOf('#EXTM3U')!==0)throw new Error('解密结果不是 M3U8：'+plain.substring(0,40));
        var fixed=fixM3u8(remote,plain),lines=String(fixed).split('\n');
        for(var i=0;i<lines.length;i++){
          var line=lines[i];
          if(line.indexOf('#')===0){lines[i]=line.replace(/URI="(https?:\/\/[^\"]+\.m3u8[^\"]*)"/ig,function(_,u){return'URI="'+childProxy(u,base)+'"';});}
          else if(/^https?:\/\//i.test(line)&&/\.m3u8(?:\?|$)/i.test(line))lines[i]=childProxy(line,base);
        }
        setItem('ttt_last_play_diag',JSON.stringify({time:Date.now(),ok:true,mode:mode,dekey:!!dekey,refer:!!refer,remote:String(remote).substring(0,220),length:plain.length}));
        return lines.join('\n');
      }catch(e){setItem('ttt_last_play_diag',JSON.stringify({time:Date.now(),ok:false,error:String(e.message||e),dekey:!!getItem('ttt_player_dekey','')}));return'#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-ENDLIST';}
    });
    return startProxyServer(code);
  }
  function play(payload){
    var x=typeof payload==='string'?JSON.parse(payload):payload||{},src=Array.isArray(x.sources)?x.sources:[];if(!src.length)return'toast://没有可用播放线路';
    try{if(typeof TangTouTiaoProtocolV013==='object')TangTouTiaoProtocolV013.bootstrapSession(false);}catch(e){}
    var proxy=makeProxy(),urls=[],names=[],headers=[];
    for(var i=0;i<src.length;i++){
      var u=String(src[i].url||'').trim();if(!u)continue;var name=String(src[i].name||('线路'+(i+1)));
      if(/\.m3u8(?:\?|$)/i.test(u)){var pu=proxy+'?m3u8=1&u='+encodeURIComponent(base64Encode(u))+'&p='+encodeURIComponent(base64Encode(proxy))+'&_t='+Date.now()+'_'+i;urls.push(pu);headers.push({});}
      else{urls.push(u);headers.push({});}
      names.push(name);
    }
    if(!urls.length)return'toast://没有可用播放线路';
    setItem('ttt_last_play_sources',JSON.stringify({time:Date.now(),title:String(x.title||''),lines:src.map(function(s){return{name:s.name,url:compactUrl(s.url)};})}));
    return JSON.stringify({urls:urls,names:names,headers:headers});
  }
  return{version:V,play:play};
})();
