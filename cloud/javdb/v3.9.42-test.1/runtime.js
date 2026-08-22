var JDBCLOUD={
base:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/cloud/javdb/v3.9.41/',
patchUrl:'https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/javdb/releases/3.9.42-test.1/app_parity_patch.js',
get:function(pre,n,key){var s=getItem(key,'');if(s)return s;var a='';for(var i=0;i<n;i++){var k=(i<10?'0':'')+i;a+=fetch(this.base+pre+'_'+k+'.txt',{timeout:15000});}setItem(key,a);return a;},
ungz:function(b64){var bs=java.util.Base64.getDecoder().decode(String(b64).replace(/\s+/g,''));var g=new java.util.zip.GZIPInputStream(new java.io.ByteArrayInputStream(bs));var o=new java.io.ByteArrayOutputStream(),b=java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE,4096),n;while((n=g.read(b))>0)o.write(b,0,n);g.close();return String(new java.lang.String(o.toByteArray(),'UTF-8'));},
patch:function(){var k='jdb3_patch_3942t1',s=getItem(k,'');if(!s){s=fetch(this.patchUrl,{timeout:15000,headers:{'Cache-Control':'no-cache'}});if(!s||s.indexOf('3.9.42-test.1')<0)throw new Error('JavDB Test补丁加载失败');setItem(k,s);}return s;},
core:function(call){var c=this.ungz(this.get('core',7,'jdb3_cloud_core_3942t1_base3941'));eval(c);eval(this.patch());eval(call);},
customData:function(){var s=getItem('jdb3_cloud_custom_3942t1_base3941','');if(!s){s=this.get('custom',5,'jdb3_cloud_custom_head_3942t1_base3941');s+=fetch(this.base+'custom_04b.txt',{timeout:15000});s+=fetch(this.base+'custom_05.txt',{timeout:15000});s+=fetch(this.base+'custom_06.txt',{timeout:15000});s+=fetch(this.base+'custom_07b.txt',{timeout:15000});setItem('jdb3_cloud_custom_3942t1_base3941',s);}return JSON.parse(this.ungz(s));},
custom:function(key){var m=this.customData();if(!m[key])throw new Error('模块不存在：'+key);eval(m[key]);}
};
