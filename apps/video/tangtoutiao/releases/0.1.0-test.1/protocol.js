/* 汤头条 0.1.0-test.1 Protocol / Crypto */
var TangTouTiaoProtocolV010=(function(){
  var VERSION='0.1.0-test.1';
  var SECRET='132f1537f85scxpcm59f7e318b9epa51';
  var SIGN_SALT='e79465cfbb39ckcusimcuekd3b066a6e';
  var DOMAINS=['https://api1.wiimrdys.com/api.php','https://api2.wiimrdys.com/api.php'];
  var UA='Mozilla/5.0 (Linux; Android 13; HikerView) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36';
  function jstr(s){return new java.lang.String(String(s==null?'':s));}
  function bytes(s){return jstr(s).getBytes('UTF-8');}
  function newBytes(n){return java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE,n);}
  function copy(src,srcPos,dst,dstPos,len){java.lang.System.arraycopy(src,srcPos,dst,dstPos,len);}
  function concat(a,b){var o=newBytes(a.length+b.length);copy(a,0,o,0,a.length);copy(b,0,o,a.length,b.length);return o;}
  function hexUpper(a){var s='';for(var i=0;i<a.length;i++){var v=a[i];if(v<0)v+=256;var h=v.toString(16);if(h.length<2)h='0'+h;s+=h;}return s.toUpperCase();}
  function hexBytes(s){s=String(s||'');if(!s||s.length%2!==0)return null;var a=newBytes(s.length/2);for(var i=0;i<a.length;i++){var v=parseInt(s.substr(i*2,2),16);if(isNaN(v))return null;a[i]=v>127?v-256:v;}return a;}
  function digestBytes(name,a){var md=java.security.MessageDigest.getInstance(name);md.update(a);return md.digest();}
  function digestHex(name,s){var a=digestBytes(name,bytes(s)),out='';for(var i=0;i<a.length;i++){var v=a[i];if(v<0)v+=256;var h=v.toString(16);if(h.length<2)h='0'+h;out+=h;}return out;}
  function md5(s){return digestHex('MD5',s);}
  function sha256(s){return digestHex('SHA-256',s);}
  function evp(secret,keyLen,ivLen){var pass=bytes(secret),md=java.security.MessageDigest.getInstance('MD5'),need=keyLen+ivLen,all=newBytes(need),pos=0,prev=null;while(pos<need){md.reset();if(prev)md.update(prev);md.update(pass);prev=md.digest();var n=Math.min(prev.length,need-pos);copy(prev,0,all,pos,n);pos+=n;}var key=newBytes(keyLen),iv=newBytes(ivLen);copy(all,0,key,0,keyLen);copy(all,keyLen,iv,0,ivLen);return{key:key,iv:iv};}
  function encryptText(text){var p=evp(SECRET,32,16),cipher=javax.crypto.Cipher.getInstance('AES/CFB/NoPadding'),key=new javax.crypto.spec.SecretKeySpec(p.key,'AES'),iv=new javax.crypto.spec.IvParameterSpec(p.iv);cipher.init(1,key,iv);var encrypted=cipher.doFinal(bytes(text)),joined=concat(cipher.getIV(),encrypted);return hexUpper(joined);}
  function decryptText(cipherHex){var all=hexBytes(cipherHex);if(!all||all.length<17)throw new Error('响应密文长度异常');var iv=newBytes(16),body=newBytes(all.length-16);copy(all,0,iv,0,16);copy(all,16,body,0,body.length);var p=evp(SECRET,32,16),cipher=javax.crypto.Cipher.getInstance('AES/CFB/NoPadding'),key=new javax.crypto.spec.SecretKeySpec(p.key,'AES');cipher.init(2,key,new javax.crypto.spec.IvParameterSpec(iv));return String(new java.lang.String(cipher.doFinal(body),'UTF-8'));}
  function ts(){var s=String(Math.floor(Date.now()/1000));while(s.length<10)s='0'+s;return s;}
  function wrap(plain){var timestamp=ts(),data=encryptText(plain),src='_ver=v0&data='+data+'&timestamp='+timestamp+SIGN_SALT,sign=md5(sha256(src));return{timestamp:timestamp,data:data,sign:sign,_ver:'v0'};}
  function stableId(key,prefix){var v=getItem(key,'');if(v)return v;v=prefix+String(Date.now())+String(Math.floor(Math.random()*1000000));try{v=md5(v);}catch(e){}setItem(key,v);return v;}
  function common(){var token=getItem('ttt_token',''),oauth=getItem('ttt_oauth_id','')||stableId('ttt_oauth_id','oauth_'),iid=getItem('ttt_iid','')||stableId('ttt_iid','iid_');var brand='Android',model='HikerView';try{brand=String(android.os.Build.BRAND||brand);model=String(android.os.Build.MODEL||model);}catch(e){}return{system_oauth_id:oauth,system_oauth_type:'android',system_app_type:'local',system_token:token,system_version:'9.6.2',app_status:'',new_player:'fx',system_build_aff:'',system_build_id:'a1000',bundle_id:'com.tencent.mm',system_iid:iid,device_brand:brand,device_model:model};}
  function plainBody(payload){var x={},c=common(),k;for(k in payload||{})if(payload.hasOwnProperty(k)&&payload[k]!=null)x[k]=String(payload[k]);for(k in c)if(c.hasOwnProperty(k)&&x[k]==null)x[k]=String(c[k]);return JSON.stringify(x);}
  function decodeResponse(raw){raw=String(raw==null?'':raw).trim();if(!raw)throw new Error('服务器返回空响应');var outer;try{outer=JSON.parse(raw);}catch(e){throw new Error('响应不是JSON：'+raw.substring(0,120));}if(outer&&typeof outer.data==='string'&&/^[0-9A-Fa-f]{34,}$/.test(outer.data)){var dec=decryptText(outer.data);try{return JSON.parse(dec);}catch(e2){return{code:0,data:dec,rawDecrypted:dec};}}return outer;}
  function url(base,path){return String(base).replace(/\/$/,'')+'/'+String(path||'').replace(/^\//,'');}
  function postOnce(base,path,payload){var u=url(base,path),plain=plainBody(payload),body=JSON.stringify(wrap(plain));var raw=fetch(u,{method:'POST',timeout:15000,body:body,headers:{'Content-Type':'application/json; charset=utf-8','User-Agent':UA,Accept:'application/json','Cache-Control':'no-cache'}});var res=decodeResponse(raw);res.__ttt={url:u,domain:base,path:path,requestKeys:Object.keys(payload||{})};return res;}
  function ok(res){if(!res)return false;var c=res.code;if(c==null)c=res.status;if(c==null)return !!res.data;return c===0||c==='0'||c===1||c==='1'||c===200||c==='200'||c===1000||c==='1000';}
  function call(path,payload,opt){opt=opt||{};var preferred=getItem('ttt_domain',''),ds=DOMAINS.slice();if(preferred){ds=ds.filter(function(x){return x!==preferred;});ds.unshift(preferred);}var errs=[];for(var i=0;i<ds.length;i++)try{var r=postOnce(ds[i],path,payload||{});setItem('ttt_domain',ds[i]);if(opt.requireOk&&!ok(r))throw new Error(String(r.msg||r.message||('业务状态 '+r.code)));return r;}catch(e){errs.push(ds[i]+' → '+String(e.message||e));}throw new Error(errs.join('\n'));}
  function probe(){var checks=[['版本/启动','/api/home/getOpenAdsAndVersion',{}],['推荐视频','/api/MvList/featuredAv',{page:1,limit:12}],['短视频','/api/MvList/small',{page:1,limit:12}],['视频分类','/api/MvList/style',{}]],out=[];for(var i=0;i<checks.length;i++){var c=checks[i],t=Date.now();try{var r=call(c[1],c[2]);out.push({name:c[0],ok:true,ms:Date.now()-t,path:c[1],code:r&&r.code,msg:String((r&&(r.msg||r.message))||''),shape:r&&r.data?Object.prototype.toString.call(r.data):''});}catch(e){out.push({name:c[0],ok:false,ms:Date.now()-t,path:c[1],error:String(e.message||e)});}}setItem('ttt_last_probe',JSON.stringify({time:Date.now(),results:out}));return out;}
  return{version:VERSION,domains:DOMAINS,encryptText:encryptText,decryptText:decryptText,wrap:wrap,common:common,call:call,ok:ok,probe:probe};
})();
