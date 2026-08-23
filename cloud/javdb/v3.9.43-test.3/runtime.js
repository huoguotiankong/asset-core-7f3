var JDBCLOUD={
raw:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/',
webraw:'https://github.com/huoguotiankong/asset-core-7f3/raw/refs/heads/main/',
cdn:'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/',
basePath:'cloud/javdb/v3.9.41/',
patch1Path:'apps/video/javdb/releases/3.9.42-test.1/app_parity_patch.js',
patch2Path:'apps/video/javdb/releases/3.9.42-test.2/app_parity_patch2.js',
patch3Path:'apps/video/javdb/releases/3.9.42-test.3/runtime_scope_patch.js',
patch4Path:'apps/video/javdb/releases/3.9.42-test.4/actor_ui_patch4.js',
patch5Path:'apps/video/javdb/releases/3.9.42-test.5/release_patch5.js',
stablePatchPath:'apps/video/javdb/releases/3.9.42/stable_patch.js',
transportPatchPath:'apps/video/javdb/releases/3.9.43-test.3/transport_patch3.js',
remote:function(path,key,marker){
  var s=String(getItem(key,'')||'');
  if(s&&(!marker||s.indexOf(marker)>=0))return s;
  var urls=[this.cdn+path,this.webraw+path,this.raw+path],i,x,last='';
  for(i=0;i<urls.length;i++){
    try{
      x=String(fetch(urls[i],{timeout:12000,headers:{'Cache-Control':'no-cache'}})||'');
      if(x&&(!marker||x.indexOf(marker)>=0)){setItem(key,x);return x;}
      if(x)last='内容校验失败';
    }catch(e){last=String(e.message||e);}
  }
  s=String(getItem(key,'')||'');
  if(s&&(!marker||s.indexOf(marker)>=0))return s;
  throw new Error('JavDB远程模块加载失败：'+path+(last?' · '+last:''));
},
get:function(pre,n,key){
  var s=String(getItem(key,'')||'');if(s)return s;
  var a='',i,k;
  for(i=0;i<n;i++){k=(i<10?'0':'')+i;a+=this.remote(this.basePath+pre+'_'+k+'.txt',key+'_'+k,'');}
  if(!a)throw new Error('JavDB核心分片为空：'+pre);
  setItem(key,a);return a;
},
ungz:function(b64){
  var bs=java.util.Base64.getDecoder().decode(String(b64).replace(/\s+/g,''));
  var g=new java.util.zip.GZIPInputStream(new java.io.ByteArrayInputStream(bs));
  var o=new java.io.ByteArrayOutputStream(),b=java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE,4096),n;
  while((n=g.read(b))>0)o.write(b,0,n);g.close();
  return String(new java.lang.String(o.toByteArray(),'UTF-8'));
},
patch:function(path,key,marker){return this.remote(path,key,marker);},
core:function(call){
  var c=this.ungz(this.get('core',7,'jdb3_cloud_core_3943t3_base3941'));eval(c);
  eval(this.patch(this.patch1Path,'jdb3_patch_3943t3_p1','3.9.42-test.1'));
  eval(this.patch(this.patch2Path,'jdb3_patch_3943t3_p2','3.9.42-test.2'));
  eval(this.patch(this.patch3Path,'jdb3_patch_3943t3_p3','3.9.42-test.3'));
  eval(this.patch(this.patch4Path,'jdb3_patch_3943t3_p4','3.9.42-test.4'));
  eval(this.patch(this.patch5Path,'jdb3_patch_3943t3_p5','3.9.42-test.5'));
  eval(this.patch(this.stablePatchPath,'jdb3_patch_3943t3_stable','3.9.42 Stable'));
  eval(this.patch(this.transportPatchPath,'jdb3_patch_3943t3_transport','3.9.43-test.3'));
  eval(call);
},
customData:function(){
  var s=String(getItem('jdb3_cloud_custom_3943t3_base3941','')||'');
  if(!s){
    s=this.get('custom',5,'jdb3_cloud_custom_head_3943t3_base3941');
    s+=this.remote(this.basePath+'custom_04b.txt','jdb3_custom_3943t3_04b','');
    s+=this.remote(this.basePath+'custom_05.txt','jdb3_custom_3943t3_05','');
    s+=this.remote(this.basePath+'custom_06.txt','jdb3_custom_3943t3_06','');
    s+=this.remote(this.basePath+'custom_07b.txt','jdb3_custom_3943t3_07b','');
    setItem('jdb3_cloud_custom_3943t3_base3941',s);
  }
  return JSON.parse(this.ungz(s));
},
custom:function(key){
  if(key==='javdb3ExternalPlay'){
    var c=this.ungz(this.get('core',7,'jdb3_cloud_core_3943t3_base3941_ext'));eval(c);
    eval(this.patch(this.patch1Path,'jdb3_patch_3943t3_p1_ext','3.9.42-test.1'));
    eval(this.patch(this.patch2Path,'jdb3_patch_3943t3_p2_ext','3.9.42-test.2'));
    eval(this.patch(this.patch3Path,'jdb3_patch_3943t3_p3_ext','3.9.42-test.3'));
    eval(this.patch(this.patch4Path,'jdb3_patch_3943t3_p4_ext','3.9.42-test.4'));
    eval(this.patch(this.patch5Path,'jdb3_patch_3943t3_p5_ext','3.9.42-test.5'));
    eval(this.patch(this.stablePatchPath,'jdb3_patch_3943t3_stable_ext','3.9.42 Stable'));
    eval(this.patch(this.transportPatchPath,'jdb3_patch_3943t3_transport_ext','3.9.43-test.3'));
    JDB.externalPlayPage();return;
  }
  var m=this.customData();if(!m[key])throw new Error('模块不存在：'+key);eval(m[key]);
}
};
