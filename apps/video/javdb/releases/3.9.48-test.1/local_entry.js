/* JavDB v3 3.9.48-test.1 · magnet metadata + VIP HLS seek overlay */
var JavDBBase3947=null;
var JavDBLocal=(function(){
var VERSION='3.9.48-test.1',BUILD=2026092202;
var ROOT='hiker://files/rules/asset-core-local/javdb-v3-test/b2026092202/';
var ENTRY=ROOT+'local_entry.js',BASE_ENTRY=ROOT+'base_3947_entry.js';
var BASE_REF='8641ea42799c34466f3bbf236d7e9b380d81420a';
var BASE_PATH='apps/video/javdb/releases/3.9.47-test.1/local_entry.js';
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t);}
function urls(ref,path){return['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+ref+'/'+path,'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+ref+'/'+path,'https://github.com/huoguotiankong/asset-core-7f3/raw/'+ref+'/'+path];}
function ensureFile(local,ref,path,marker){
  if(fileExist(local)){try{var old=String(readFile(local)||'');if(!bad(old)&&old.indexOf(marker)>=0)return local;}catch(_e){}try{deleteFile(local);}catch(_e2){}}
  var us=urls(ref,path),es=[],i,s='';
  for(i=0;i<us.length;i++){try{s=String(fetch(us[i],{timeout:6500,headers:{'Cache-Control':'public, max-age=31536000, immutable'}})||'');if(bad(s)||s.indexOf(marker)<0)throw new Error('无效响应');writeFile(local,s);if(!fileExist(local))throw new Error('写入失败');return local;}catch(e){es.push((i+1)+':'+String(e.message||e));}}
  throw new Error(path+' 下载失败：'+es.join(' | '));
}
function base(){
  if(JavDBBase3947&&typeof JavDBBase3947.module==='function')return JavDBBase3947;
  ensureFile(BASE_ENTRY,BASE_REF,BASE_PATH,'3.9.47-test.1');
  var src=String(readFile(BASE_ENTRY)||''),JavDBLocal=null;
  if(bad(src)||src.indexOf('3.9.47-test.1')<0)throw new Error('JavDB 3.9.47 Base Entry 内容无效');
  eval(src);
  if(!JavDBLocal||typeof JavDBLocal.module!=='function')throw new Error('JavDB 3.9.47 Base Entry 未导出');
  JavDBBase3947=JavDBLocal;
  return JavDBBase3947;
}
function magnetFromString(v){
  var s=String(v==null?'':v).replace(/&amp;/gi,'&'),m=null,d='';
  m=s.match(/magnet:\?xt=urn:btih:[^"'<>\\\s]+/i);
  if(m)return String(m[0]);
  if(/%3A|%3F|%3D/i.test(s)){try{d=decodeURIComponent(s);m=d.match(/magnet:\?xt=urn:btih:[^"'<>\\\s]+/i);if(m)return String(m[0]).replace(/&amp;/gi,'&');}catch(_e){}}
  return '';
}
function findMagnet(v,depth,seen){
  if(depth>6||v==null)return '';
  var t=typeof v,m='',i,k,keys;
  if(t==='string'||t==='number')return magnetFromString(v);
  if(t!=='object')return '';
  seen=seen||[];
  for(i=0;i<seen.length;i++)if(seen[i]===v)return '';
  seen.push(v);
  keys=['magnet','url','href','link','input','value','js'];
  for(i=0;i<keys.length;i++){k=keys[i];try{if(v[k]!=null){m=findMagnet(v[k],depth+1,seen);if(m)return m;}}catch(_e2){}}
  if(v instanceof Array){for(i=0;i<v.length;i++){m=findMagnet(v[i],depth+1,seen);if(m)return m;}return '';}
  for(k in v){if(!Object.prototype.hasOwnProperty.call(v,k))continue;if(keys.indexOf(k)>=0)continue;try{m=findMagnet(v[k],depth+1,seen);if(m)return m;}catch(_e3){}}
  return '';
}
function cleanText(s){return String(s==null?'':s).replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();}
function sizeGb(n){
  n=Number(n||0);if(!(n>0))return '';
  var g=n/1024,v=g>=10?g.toFixed(1):g.toFixed(2);
  v=v.replace(/\.00$/,'').replace(/(\.\d)0$/,'$1');
  return v+'G';
}
function deepValue(o,keys,depth,seen){
  if(depth>5||o==null||typeof o!=='object')return null;
  seen=seen||[];for(var si=0;si<seen.length;si++)if(seen[si]===o)return null;seen.push(o);
  var i,k,v;
  for(i=0;i<keys.length;i++){k=keys[i];try{if(o[k]!=null&&typeof o[k]!=='object')return o[k];}catch(_e){}}
  if(o instanceof Array){for(i=0;i<o.length;i++){v=deepValue(o[i],keys,depth+1,seen);if(v!=null)return v;}return null;}
  for(k in o){if(!Object.prototype.hasOwnProperty.call(o,k))continue;try{v=deepValue(o[k],keys,depth+1,seen);if(v!=null)return v;}catch(_e2){}}
  return null;
}
function truthy(v){if(v===true||v===1)return true;var s=String(v==null?'':v).toLowerCase().trim();return s==='true'||s==='1'||s==='yes'||s==='hd'||s==='subtitle'||s==='subtitles';}
function magnetMeta(x){
  var title=cleanText(x&&x.title),desc=cleanText(x&&x.desc),parts=desc.split(/\s*·\s*/).filter(Boolean),out=[],i,p,size='',files='',date='',provider='',tail=[];
  for(i=0;i<parts.length;i++){
    p=String(parts[i]||'').trim();if(!p)continue;
    if(!size&&/^\d+(?:\.\d+)?$/.test(p)){size=sizeGb(Number(p));continue;}
    if(!size&&/^\d+(?:\.\d+)?\s*(?:MB|MiB)$/i.test(p)){size=sizeGb(parseFloat(p));continue;}
    if(!size&&/^\d+(?:\.\d+)?\s*(?:GB|GiB|G)$/i.test(p)){size=p.replace(/\s*(?:GB|GiB)$/i,'G');continue;}
    if(!files&&/^\d+\s*文件$/.test(p)){files=p;continue;}
    if(!date&&/^20\d{2}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(p)){date=p;continue;}
    if(!provider&&/PikPak|迅雷|123云盘|光鸭|网盘/i.test(p)&&!/长按/.test(p)){provider=p;continue;}
    tail.push(p);
  }
  var quality=deepValue(x,['quality','video_quality','resolution','is_hd','hd'],0,[]),sub=deepValue(x,['has_subtitle','is_subtitle','subtitle','subtitles','is_chinese_subtitle'],0,[]);
  var is4k=/\[\s*4K\s*\]|\b4K\b/i.test(title)||String(quality||'').toUpperCase().indexOf('4K')>=0;
  var isHd=is4k||/\[\s*(?:HD|FHD|UHD)\s*\]|\b(?:HD|FHD|UHD)\b/i.test(title)||truthy(quality);
  var hasSub=/\[\s*(?:中字|中文字幕|字幕|SUB|CHS|CHT)\s*\]/i.test(title)||truthy(sub);
  if(size)out.push(size);
  if(is4k)out.push('4K');else if(isHd)out.push('高清');
  if(hasSub)out.push('字幕');
  if(files&&files!=='0文件')out.push(files);
  if(date)out.push(date);
  if(provider)out.push(provider);
  for(i=0;i<tail.length;i++)if(out.indexOf(tail[i])<0)out.push(tail[i]);
  return out.join(' · ');
}
function patchMagnets(items){
  if(!(items instanceof Array))return items;
  for(var i=0;i<items.length;i++){
    var x=items[i];if(!x||typeof x!=='object'||!findMagnet(x,0,[]))continue;
    var d=magnetMeta(x);if(d)x.desc=d;
  }
  return items;
}
function isM3u8(u){u=String(u||'');return /\.m3u8(?:[?#;]|$)/i.test(u)||/#(?:isM3u8|m3u8)#/i.test(u);}
function directHttp(u){return /^https?:\/\//i.test(String(u||'').trim());}
function rawFallbackAction(raw){return{title:'原始VIP播放',js:$.toString(function(u){return String(u||'');},raw)};}
function addFallback(x,raw){
  x.extra=x.extra&&typeof x.extra==='object'?x.extra:{};
  var a=x.extra.longClick instanceof Array?x.extra.longClick:[],keep=[],i;
  for(i=0;i<a.length;i++)if(!a[i]||String(a[i].title||'')!=='原始VIP播放')keep.push(a[i]);
  x.extra.longClick=[rawFallbackAction(raw)].concat(keep);
}
function wrapDirectM3u8(raw,movieId,index,headers){
  var name='javdb_vip_'+String(movieId||'movie').replace(/[^0-9A-Za-z_-]/g,'_')+'_'+index+'.m3u8';
  return $('#noLoading#').lazyRule(function(u,h,n){
    function split(x){
      x=String(x||'').replace(/#(?:isVideo=true|isM3u8|m3u8|pre|noPre)#/gi,'');
      var hs={},m=x.match(/;\{([^}]*)\}$/),body='',ps=[],i,p,k;
      if(m){body=m[1];x=x.substring(0,m.index);ps=body.split('&&');for(i=0;i<ps.length;i++){p=ps[i].split('@');if(p.length>1){k=p.shift();hs[k]=p.join('@').replace(/；；/g,';');}}}
      return{url:x,headers:hs};
    }
    try{
      var s=split(u),hh={},k;
      if(h&&typeof h==='object')for(k in h)if(Object.prototype.hasOwnProperty.call(h,k))hh[k]=h[k];
      for(k in s.headers)if(Object.prototype.hasOwnProperty.call(s.headers,k)&&hh[k]==null)hh[k]=s.headers[k];
      var fn=n.replace(/\.m3u8$/i,'')+'_'+String(md5(s.url)).substring(0,12)+'.m3u8';
      var p=cacheM3u8(s.url,{headers:hh},fn);
      if(p)return String(p);
    }catch(e){}
    return String(u||'');
  },raw,headers||{},name);
}
function wrapJsonSpec(raw,movieId){
  return $('#noLoading#').lazyRule(function(spec,mid){
    function split(x){
      x=String(x||'').replace(/#(?:isVideo=true|isM3u8|m3u8|pre|noPre)#/gi,'');
      var hs={},m=x.match(/;\{([^}]*)\}$/),body='',ps=[],i,p,k;
      if(m){body=m[1];x=x.substring(0,m.index);ps=body.split('&&');for(i=0;i<ps.length;i++){p=ps[i].split('@');if(p.length>1){k=p.shift();hs[k]=p.join('@').replace(/；；/g,';');}}}
      return{url:x,headers:hs};
    }
    try{
      var o=JSON.parse(String(spec||'')),us=o.urls instanceof Array?o.urls:[],hs=o.headers instanceof Array?o.headers:[],i,k,s,hh,p,n;
      for(i=0;i<us.length;i++){
        if(!/\.m3u8(?:[?#;]|$)|#(?:isM3u8|m3u8)#/i.test(String(us[i]||'')))continue;
        s=split(us[i]);hh={};if(hs[i]&&typeof hs[i]==='object')for(k in hs[i])if(Object.prototype.hasOwnProperty.call(hs[i],k))hh[k]=hs[i][k];
        for(k in s.headers)if(Object.prototype.hasOwnProperty.call(s.headers,k)&&hh[k]==null)hh[k]=s.headers[k];
        n='javdb_vip_'+String(mid||'movie').replace(/[^0-9A-Za-z_-]/g,'_')+'_'+i+'_'+String(md5(s.url)).substring(0,12)+'.m3u8';
        try{p=cacheM3u8(s.url,{headers:hh},n);if(p)us[i]=String(p);}catch(_e){}
      }
      o.urls=us;return JSON.stringify(o);
    }catch(e){return String(spec||'');}
  },raw,movieId||'movie');
}
function patchVip(items){
  if(!(items instanceof Array))return items;
  var p=typeof MY_PARAMS==='object'&&MY_PARAMS?MY_PARAMS:{},movieId=String(p.jdb3_id||p.id||'movie'),i,x,u,o,changed,hs;
  for(i=0;i<items.length;i++){
    changed=false;x=items[i];if(!x||typeof x!=='object'||typeof x.url!=='string')continue;u=String(x.url||'').trim();if(!u)continue;
    if(u.charAt(0)==='{'){
      try{o=JSON.parse(u);}catch(_e0){o=null;}
      if(o&&o.urls instanceof Array&&o.urls.some(function(v){return isM3u8(v);})){addFallback(x,u);x.url=wrapJsonSpec(u,movieId);changed=true;}
    }else if(directHttp(u)&&isM3u8(u)){
      hs=x.extra&&typeof x.extra==='object'?(x.extra.headers||x.extra.header||{}):{};
      addFallback(x,u);x.url=wrapDirectM3u8(u,movieId,i,hs);changed=true;
    }
    if(changed){x.extra=x.extra&&typeof x.extra==='object'?x.extra:{};if(!x.extra.id)x.extra.id='javdb-vip:'+movieId+':'+i;}
  }
  return items;
}
function capture(run,patch){
  var oldSet=null,got=null,hooked=false,err=null,ret=null;
  try{oldSet=setResult;var cap=function(v){got=v;};setResult=cap;hooked=(setResult===cap);}catch(e){hooked=false;}
  if(!hooked)return run();
  try{ret=run();}catch(e2){err=e2;}finally{try{setResult=oldSet;}catch(_e){}}
  if(err)throw err;
  if(got instanceof Array){got=patch(got);return oldSet(got);}
  if(got!=null)return oldSet(got);
  return ret;
}
function module(){
  var b=base(),m=b.module();
  if(!m||typeof m.custom!=='function'||typeof m.core!=='function')throw new Error('JavDB 3.9.47 Base Module 未就绪');
  var oldCustom=m.custom,oldCore=m.core;
  m.custom=function(key){if(key==='javdb3Magnets')return capture(function(){return oldCustom.call(m,key);},patchMagnets);return oldCustom.call(m,key);};
  m.core=function(call){var s=String(call||'').replace(/\s+/g,'');if(s==='JDB.playPage();'||s==='JDB.playPage()')return capture(function(){return oldCore.call(m,call);},patchVip);return oldCore.call(m,call);};
  m.version=VERSION;m.build=BUILD;m.localFirstVersion=VERSION;m.localFirstBuild=BUILD;
  m.magnetMetaV2=true;m.vipHlsSeekCache=true;
  return m;
}
function info(){
  var b=base(),x={};try{x=b.info?b.info():{};}catch(e){x={ready:false,error:String(e.message||e)};}
  x.version=VERSION;x.build=BUILD;x.baseVersion='3.9.47-test.1';x.magnetMetaV2=true;x.vipHlsSeekCache=true;
  return x;
}
function rebuild(){var b=base();return b.rebuild?b.rebuild():true;}
function statusPage(){
  setPageTitle('JavDB · 本地化诊断');
  var d=[],x=info();
  d.push({title:'JavDB v3 '+VERSION,desc:'Build '+BUILD+' · 磁链元数据 + VIP HLS Seek',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
  d.push({title:x.ready===false?'基础运行层异常':'基础运行层已就绪',desc:x.ready===false?String(x.error||''):('Base '+String(x.baseVersion||'3.9.47-test.1')),url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  d.push({title:'磁链信息增强',desc:'MB 自动换算 G；识别 HD / 4K / 字幕 / 日期 / PikPak；保留 115 长按菜单',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  d.push({title:'VIP 播放优化',desc:'HLS 点击时缓存本地 m3u8 索引并保留 Header；长按可回退“原始VIP播放”',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  d.push({title:'Stable 保护',desc:'Stable 3.9.42 / Latest 未修改',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  setResult(d);
}
return{
  version:VERSION,build:BUILD,module:module,info:info,rebuild:rebuild,statusPage:statusPage,entry:ENTRY,
  builder:function(){var b=base();return b.builder?b.builder():null;},
  patch:function(force){var b=base();return b.patch?b.patch(force):null;},
  upgrade:function(force){var b=base();return b.upgrade?b.upgrade(force):null;}
};
})();