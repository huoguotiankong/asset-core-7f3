/* JavDB v3 3.9.49-test.1 · flattened runtime + VIP warm seek */
var JavDBLocal=(function(){
var VERSION='3.9.49-test.1',BUILD=2026092203;
var ROOT='hiker://files/rules/asset-core-local/javdb-v3-test/b2026092203/';
var ENTRY=ROOT+'local_entry.js',UI=ROOT+'product_ui_patch7.js',UPFILE=ROOT+'jav_playback_upgrade_11001.js';
var BASE_ROOT='hiker://files/rules/asset-core-local/javdb-v3-test/b2026082501/';
var BASE_BUILDER=BASE_ROOT+'local_bundle_builder.js';
var BASE_BREF='2361fbbfc21c540191495b979b30a6828adfe9c1';
var BASE_BPATH='apps/video/javdb/releases/3.9.44-test.1/local_bundle_builder.js';
var UI_REF='10f182e75bbfd0ee89cb4f41c2f0606a678a05e0';
var UI_PATH='apps/video/javdb/releases/3.9.45-test.7/product_ui_patch7.js';
var UP_REF='8a8a3ead9dc234bb26bd9251907ae2794a0e65c5';
var UP_PATH='shared/jav-playback/releases/1.1.0-test.1/upgrade.js';
var CACHE_UI='',CACHE_UP=null,VIP_WARM=[];
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t);}
function urls(ref,path){return['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+ref+'/'+path,'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+ref+'/'+path,'https://github.com/huoguotiankong/asset-core-7f3/raw/'+ref+'/'+path];}
function ensureFile(local,ref,path,marker){
  if(fileExist(local)){try{var old=String(readFile(local)||'');if(!bad(old)&&old.indexOf(marker)>=0)return local;}catch(_e){}try{deleteFile(local);}catch(_e2){}}
  var us=urls(ref,path),es=[],i,s='';
  for(i=0;i<us.length;i++){
    try{s=String(fetch(us[i],{timeout:6500,headers:{'Cache-Control':'public, max-age=31536000, immutable'}})||'');if(bad(s)||s.indexOf(marker)<0)throw new Error('无效响应');writeFile(local,s);if(!fileExist(local))throw new Error('写入失败');return local;}
    catch(e){es.push((i+1)+':'+String(e.message||e));}
  }
  throw new Error(path+' 下载失败：'+es.join(' | '));
}
function req(p){var u=getPath(p),r=null;try{r=require(u);}catch(e0){try{deleteCache(u);}catch(e1){}r=require(u);}return r;}
function builder(){
  ensureFile(BASE_BUILDER,BASE_BREF,BASE_BPATH,'3.9.44-test.1');
  req(BASE_BUILDER);
  if(typeof JavDBLocalBuilder!=='object'||typeof JavDBLocalBuilder.load!=='function')throw new Error('JavDB Base Builder 未导出');
  return JavDBLocalBuilder;
}
function uiPatch(force){
  if(force){try{if(fileExist(UI))deleteFile(UI);}catch(_e){}CACHE_UI='';}
  if(CACHE_UI)return CACHE_UI;
  ensureFile(UI,UI_REF,UI_PATH,'3.9.45-test.7');
  CACHE_UI=String(readFile(UI)||'');
  if(bad(CACHE_UI)||CACHE_UI.indexOf('3.9.45-test.7')<0)throw new Error('JavDB UI7 校验失败');
  return CACHE_UI;
}
function upgrade(force){
  if(force){try{if(fileExist(UPFILE))deleteFile(UPFILE);}catch(_e){}CACHE_UP=null;}
  if(CACHE_UP)return CACHE_UP;
  ensureFile(UPFILE,UP_REF,UP_PATH,'1.1.0-test.1');
  CACHE_UP=req(UPFILE);
  if(!CACHE_UP||typeof CACHE_UP.apply!=='function'||String(CACHE_UP.version||'')!=='1.1.0-test.1')throw new Error('JAV Playback Upgrade 1.1.0-test.1 校验失败');
  return CACHE_UP;
}
function baseLoad(){
  var b=builder(),x=b.load(),r=x&&x.runtime;
  if(!r||typeof r.core!=='function'||String(r.localFirstVersion||'')!=='3.9.44-test.1')throw new Error('JavDB 3.9.44 Local-First Base Runtime 未就绪');
  return{builder:b,pack:x,runtime:r};
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
  for(k in v){if(!Object.prototype.hasOwnProperty.call(v,k)||keys.indexOf(k)>=0)continue;try{m=findMagnet(v[k],depth+1,seen);if(m)return m;}catch(_e3){}}
  return '';
}
function action115(magnet){
  return{title:'调用115',js:$.toString(function(m){
    m=String(m||'').replace(/&amp;/gi,'&').trim();
    if(!m||m.indexOf('magnet:?')!==0)return'toast://未识别到磁力链接';
    return'hiker://page/115Offline?rule=115.简&page=fypage&add='+encodeURIComponent(m);
  },magnet)};
}
function cleanText(s){return String(s==null?'':s).replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();}
function sizeGb(n){n=Number(n||0);if(!(n>0))return'';var g=n/1024,v=g>=10?g.toFixed(1):g.toFixed(2);v=v.replace(/\.00$/,'').replace(/(\.\d)0$/,'$1');return v+'G';}
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
  var i,j,x,ex,old,keep,m,a,d;
  for(i=0;i<items.length;i++){
    x=items[i];if(!x||typeof x!=='object')continue;
    m=findMagnet(x,0,[]);if(!m)continue;
    d=magnetMeta(x);if(d)x.desc=d;
    ex=x.extra;if(!ex||typeof ex!=='object'){ex={};x.extra=ex;}
    old=ex.longClick;if(!(old instanceof Array))old=[];keep=[];
    for(j=0;j<old.length;j++){a=old[j];if(a&&String(a.title||'').indexOf('115')>=0)continue;keep.push(a);}
    ex.longClick=[action115(m)].concat(keep);
  }
  return items;
}
function isM3u8(u){u=String(u||'');return /\.m3u8(?:[?#;]|$)/i.test(u)||/#(?:isM3u8|m3u8)#/i.test(u);}
function directHttp(u){return /^https?:\/\//i.test(String(u||'').trim());}
function splitMediaUrl(x){
  x=String(x||'').replace(/#(?:isVideo=true|isM3u8|m3u8|pre|noPre)#/gi,'');
  var hs={},m=x.match(/;\{([^}]*)\}$/),body='',ps=[],i,p,k;
  if(m){body=m[1];x=x.substring(0,m.index);ps=body.split('&&');for(i=0;i<ps.length;i++){p=ps[i].split('@');if(p.length>1){k=p.shift();hs[k]=p.join('@').replace(/；；/g,';');}}}
  return{url:x,headers:hs};
}
function mergedHeaders(a,b){var h={},k;if(a&&typeof a==='object')for(k in a)if(Object.prototype.hasOwnProperty.call(a,k))h[k]=a[k];if(b&&typeof b==='object')for(k in b)if(Object.prototype.hasOwnProperty.call(b,k)&&h[k]==null)h[k]=b[k];return h;}
function seekAction(raw,headers,name){
  return{title:'流畅拖动播放',js:$.toString(function(u,h,n){
    try{
      var x=String(u||'').replace(/#(?:isVideo=true|isM3u8|m3u8|pre|noPre)#/gi,''),hs={},m=x.match(/;\{([^}]*)\}$/),ps=[],i,p,k;
      if(m){ps=m[1].split('&&');x=x.substring(0,m.index);for(i=0;i<ps.length;i++){p=ps[i].split('@');if(p.length>1){k=p.shift();hs[k]=p.join('@').replace(/；；/g,';');}}}
      if(h&&typeof h==='object')for(k in h)if(Object.prototype.hasOwnProperty.call(h,k))hs[k]=h[k];
      var pth=cacheM3u8(x,{headers:hs},n);return pth?String(pth):String(u||'');
    }catch(e){return String(u||'');}
  },raw,headers||{},name)};
}
function seekJsonAction(raw,movieId){
  return{title:'流畅拖动播放',js:$.toString(function(spec,mid){
    function split(x){
      x=String(x||'').replace(/#(?:isVideo=true|isM3u8|m3u8|pre|noPre)#/gi,'');
      var hs={},m=x.match(/;\{([^}]*)\}$/),ps=[],i,p,k;
      if(m){ps=m[1].split('&&');x=x.substring(0,m.index);for(i=0;i<ps.length;i++){p=ps[i].split('@');if(p.length>1){k=p.shift();hs[k]=p.join('@').replace(/；；/g,';');}}}
      return{url:x,headers:hs};
    }
    try{
      var o=JSON.parse(String(spec||'')),us=o.urls instanceof Array?o.urls:[],hs=o.headers instanceof Array?o.headers:[],i,k,x,hh,n,p;
      for(i=0;i<us.length;i++){
        if(!/\.m3u8(?:[?#;]|$)|#(?:isM3u8|m3u8)#/i.test(String(us[i]||'')))continue;
        x=split(us[i]);hh={};if(hs[i]&&typeof hs[i]==='object')for(k in hs[i])if(Object.prototype.hasOwnProperty.call(hs[i],k))hh[k]=hs[i][k];
        for(k in x.headers)if(Object.prototype.hasOwnProperty.call(x.headers,k)&&hh[k]==null)hh[k]=x.headers[k];
        n='javdb_vip_'+String(mid||'movie').replace(/[^0-9A-Za-z_-]/g,'_')+'_'+i+'_'+String(md5(x.url)).substring(0,12)+'.m3u8';
        try{p=cacheM3u8(x.url,{headers:hh},n);if(p)us[i]=String(p);}catch(_e){}
      }
      o.urls=us;return JSON.stringify(o);
    }catch(e){return String(spec||'');}
  },raw,movieId||'movie')};
}
function rawAction(raw){return{title:'原始VIP播放',js:$.toString(function(u){return String(u||'');},raw)};}
function addVipLongClicks(x,raw,headers,name){
  x.extra=x.extra&&typeof x.extra==='object'?x.extra:{};
  var a=x.extra.longClick instanceof Array?x.extra.longClick:[],keep=[],i,t;
  for(i=0;i<a.length;i++){t=String(a[i]&&a[i].title||'');if(t==='流畅拖动播放'||t==='原始VIP播放')continue;keep.push(a[i]);}
  x.extra.longClick=[seekAction(raw,headers,name),rawAction(raw)].concat(keep);
}
function cacheName(movieId,index,url){return'javdb_vip_'+String(movieId||'movie').replace(/[^0-9A-Za-z_-]/g,'_')+'_'+index+'_'+String(md5(String(url||''))).substring(0,12)+'.m3u8';}
function patchVip(items){
  VIP_WARM=[];
  if(!(items instanceof Array))return items;
  var p=typeof MY_PARAMS==='object'&&MY_PARAMS?MY_PARAMS:{},movieId=String(p.jdb3_id||p.id||'movie'),i,x,u,o,hs,s,name,id;
  for(i=0;i<items.length;i++){
    x=items[i];if(!x||typeof x!=='object'||typeof x.url!=='string')continue;u=String(x.url||'').trim();if(!u)continue;
    if(u.charAt(0)==='{'){
      try{o=JSON.parse(u);}catch(_e0){o=null;}
      if(o&&o.urls instanceof Array&&o.urls.some(function(v){return isM3u8(v);})){
        x.extra=x.extra&&typeof x.extra==='object'?x.extra:{};
        id=x.extra.id||('javdb-vip-json:'+movieId+':'+i);x.extra.id=id;
        var la=x.extra.longClick instanceof Array?x.extra.longClick:[],lk=[],lj;
        for(lj=0;lj<la.length;lj++){var lt=String(la[lj]&&la[lj].title||'');if(lt==='流畅拖动播放'||lt==='原始VIP播放')continue;lk.push(la[lj]);}
        x.extra.longClick=[seekJsonAction(u,movieId),rawAction(u)].concat(lk);
      }
      continue;
    }
    if(!directHttp(u)||!isM3u8(u))continue;
    s=splitMediaUrl(u);hs=mergedHeaders(x.extra&&typeof x.extra==='object'?(x.extra.headers||x.extra.header||{}):{},s.headers);
    name=cacheName(movieId,i,s.url);x.extra=x.extra&&typeof x.extra==='object'?x.extra:{};id=x.extra.id||('javdb-vip:'+movieId+':'+i);x.extra.id=id;
    addVipLongClicks(x,u,hs,name);
    VIP_WARM.push({id:id,url:s.url,headers:hs,name:name,raw:u});
  }
  return items;
}
function warmVip(){
  var q=VIP_WARM instanceof Array?VIP_WARM.slice(0,2):[];
  for(var i=0;i<q.length;i++)(function(t){
    try{
      if(typeof http!=='object'||typeof http.fetch!=='function')return;
      http.fetch(t.url).headers(t.headers||{}).success(function(){
        try{var p=cacheM3u8(t.url,{headers:t.headers||{}},t.name);if(p)updateItem(t.id,{url:String(p)});}catch(_e){}
      }).error(function(){}).start();
    }catch(_e2){}
  })(q[i]);
}
function capture(run,patch,after){
  var oldSet=null,got=null,hooked=false,err=null,ret=null;
  try{oldSet=setResult;var cap=function(v){got=v;};setResult=cap;hooked=(setResult===cap);}catch(e){hooked=false;}
  if(!hooked)return run();
  try{ret=run();}catch(e2){err=e2;}finally{try{setResult=oldSet;}catch(_e){}}
  if(err)throw err;
  if(got instanceof Array){got=patch(got);var out=oldSet(got);try{if(after)after(got);}catch(_e2){}return out;}
  if(got!=null)return oldSet(got);
  return ret;
}
function module(){
  var base=baseLoad(),r=base.runtime,p=uiPatch(false),play=null;
  function playback(){
    if(play)return play;
    var up=upgrade(false),baseSdk=r.playback();
    play=up.apply(baseSdk,{localReentry:true,icon123:String(base.builder.icon123||'')});
    if(!play||String(play.version||'')!=='1.1.0-test.1'||play.providers().length<6)throw new Error('JAV Playback 1.1.0-test.1 preflight failed');
    return play;
  }
  function runCore(call){return r.core('eval('+JSON.stringify(p)+');'+String(call||''));}
  function core(call){
    var s=String(call||'').replace(/\s+/g,'');
    if(s==='JDB.playPage();'||s==='JDB.playPage()')return capture(function(){return runCore(call);},patchVip,warmVip);
    return runCore(call);
  }
  function custom(key){
    if(key==='javdb3ExternalPlay'){playback();return runCore('JDB.externalPlayPage();');}
    if(key==='javdb3Magnets')return capture(function(){return r.custom(key);},patchMagnets,null);
    return r.custom(key);
  }
  return{
    version:VERSION,build:BUILD,localFirstVersion:VERSION,localFirstBuild:BUILD,
    productUiVersion:'3.9.45-test.7',productUiBuild:2026082904,
    playbackVersion:'1.1.0-test.1',playbackBuild:11001,
    baseVersion:String(r.localFirstVersion||''),baseBuild:Number(r.localFirstBuild||0),
    flattenedRuntime:true,vipWarmSeek:true,magnetMetaV2:true,magnet115LongPress:true,
    core:core,custom:custom,playback:playback,customData:function(){return r.customData();},localBundleMeta:base.pack&&base.pack.meta?base.pack.meta:null
  };
}
function info(){
  try{
    var b=builder(),m=b.meta(),u=false,pb=false;
    try{u=fileExist(UI)&&String(readFile(UI)||'').indexOf('3.9.45-test.7')>=0;}catch(_e){}
    try{pb=fileExist(UPFILE)&&String(readFile(UPFILE)||'').indexOf('1.1.0-test.1')>=0;}catch(_e2){}
    return{version:VERSION,build:BUILD,ready:!!m&&u,ui:u,playback:pb,baseReady:!!m,baseMeta:m||{},flattenedRuntime:true,vipWarmSeek:true,magnetMetaV2:true,magnet115LongPress:true};
  }catch(e){return{version:VERSION,build:BUILD,ready:false,error:String(e.message||e),flattenedRuntime:true,vipWarmSeek:true};}
}
function rebuild(){uiPatch(true);upgrade(true);var b=builder(),m=b.meta();if(!m)m=b.install(false);return{ui:true,playback:true,base:m};}
function statusPage(){
  setPageTitle('JavDB · 本地化诊断');
  var d=[],x=info();
  d.push({title:'JavDB v3 '+VERSION,desc:'Build '+BUILD+' · Flattened Runtime + VIP Warm Seek',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
  d.push({title:x.baseReady?'基础 Runtime 已就绪':'基础 Runtime 未就绪',desc:x.baseReady?'Base 3.9.44-test.1 · 直接装配 UI7':'首次打开会自动安装',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  d.push({title:'VIP 首屏',desc:'移除 3.9.48 的同步 cacheM3u8 点击阻塞；页面先显示、原始地址可立即起播',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  d.push({title:'VIP 拖动',desc:'页面显示后后台预热前两条 HLS；完成后无感替换成本地 m3u8 索引；长按可强制流畅拖动/原始播放',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  d.push({title:'磁链',desc:'大小 / 高清 / 4K / 字幕 + 长按第一项调用115',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  d.push({title:'Stable 保护',desc:'Stable 3.9.42 / Latest 未修改',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  setResult(d);
}
return{version:VERSION,build:BUILD,module:module,info:info,rebuild:rebuild,statusPage:statusPage,entry:ENTRY,builder:builder,patch:uiPatch,upgrade:upgrade};
})();
