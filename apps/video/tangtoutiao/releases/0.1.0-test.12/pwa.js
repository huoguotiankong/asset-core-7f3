/* 汤头条 0.1.0-test.12 PWA Provider / reference-rule compatible fallback */
var TangTouTiaoPwaV020=(function(){
  var V='0.1.0-test.12';
  var BASE='https://dpi4.tbrapi.org/pwa.php';
  var KEY='7205a6c3883caf95b52db5b534e12ec3';
  var IV='81d7beac44a86f43';
  function bytes(s){return new java.lang.String(String(s==null?'':s)).getBytes('UTF-8');}
  function hex(a){var s='';for(var i=0;i<a.length;i++){var v=a[i];if(v<0)v+=256;var h=v.toString(16);if(h.length<2)h='0'+h;s+=h;}return s.toUpperCase();}
  function hexBytes(s){s=String(s||'').trim();if(!s||s.length%2!==0||!/^[0-9A-Fa-f]+$/.test(s))return null;var a=java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE,s.length/2);for(var i=0;i<a.length;i++){var v=parseInt(s.substr(i*2,2),16);a[i]=v>127?v-256:v;}return a;}
  function cipher(mode,data){var c=javax.crypto.Cipher.getInstance('AES/CFB/NoPadding'),k=new javax.crypto.spec.SecretKeySpec(bytes(KEY),'AES'),iv=new javax.crypto.spec.IvParameterSpec(bytes(IV));c.init(mode,k,iv);return c.doFinal(data);}
  function encrypt(s){return hex(cipher(1,bytes(s)));}
  function decrypt(s){var a=hexBytes(s);if(!a)throw new Error('PWA 响应密文格式异常');return String(new java.lang.String(cipher(2,a),'UTF-8'));}
  function digest(name,s){var md=java.security.MessageDigest.getInstance(name),a=md.digest(bytes(s)),o='';for(var i=0;i<a.length;i++){var v=a[i];if(v<0)v+=256;var h=v.toString(16);if(h.length<2)h='0'+h;o+=h;}return o;}
  function md5(s){return digest('MD5',s);}function sha256(s){return digest('SHA-256',s);}
  function device(){var v=String(getItem('ttt_pwa_device_id','')||'');if(!v){v='hiker_'+md5(String(Date.now())+String(Math.random())).slice(0,16)+'_'+Date.now();setItem('ttt_pwa_device_id',v);}return v;}
  function common(){return{system_oauth_type:'pwa',system_oauth_id:device(),system_oauth_new_id:'',system_version:'3.0.1',system_token:'',system_app_type:'',system_build:'',system_build_id:''};}
  function merge(p){var o={},k;for(k in p||{})if(p.hasOwnProperty(k)&&p[k]!=null)o[k]=String(p[k]);var c=common();for(k in c)if(c.hasOwnProperty(k)&&o[k]==null)o[k]=c[k];return o;}
  function parse(raw,path){var outer=JSON.parse(String(raw||'')),enc=outer&&outer.data;if(typeof enc!=='string'||!enc)throw new Error('PWA 返回缺少 data');var txt=decrypt(enc),obj=JSON.parse(txt);try{setItem('ttt_last_pwa',JSON.stringify({time:Date.now(),path:path,code:String(obj&&obj.code!=null?obj.code:''),schema:schema(obj&&obj.data)}));}catch(e){}return obj;}
  function schema(v,depth){depth=depth||0;if(depth>2)return typeof v;if(Array.isArray(v))return'array['+v.length+']'+(v.length?'> '+schema(v[0],depth+1):'');if(v&&typeof v==='object'){var ks=Object.keys(v).slice(0,12),a=[];for(var i=0;i<ks.length;i++){var x=v[ks[i]];a.push(ks[i]+(Array.isArray(x)?'['+x.length+']':x&&typeof x==='object'?'{...}':':'+typeof x));}return'{'+a.join(',')+'}';}return typeof v;}
  function call(path,payload){var p=merge(payload||{}),plain=JSON.stringify(p),data=encrypt(plain),t=String(Math.floor(Date.now()/1000)),sign=md5(sha256('client=pwa&data='+data+'&timestamp='+t+KEY)),body='client=pwa&timestamp='+t+'&data='+data+'&sign='+sign,url=BASE+'/'+String(path||'').replace(/^\//,'');var raw=fetch(url,{method:'POST',timeout:15000,headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Mozilla/5.0','Cache-Control':'no-cache'},body:body});return parse(raw,path);}
  function shortVideos(page,tag){return call('/api/MvList/smallVideoByTag',{page:String(page||1),tag:String(tag||'recommend')});}
  function search(keyword,page){return call('/api/MvSearch/video',{page:String(page||1),size:'15',keyword:String(keyword||'')});}
  function recommend(page){return call('/api/MvList/recommend',{page:String(page||1),_t:'1'});}
  function style(id,page){return call('/api/MvList/style',{page:String(page||1),size:'15',id:String(id||''),orderBy:'id'});}
  return{version:V,call:call,shortVideos:shortVideos,search:search,recommend:recommend,style:style,schema:schema};
})();
