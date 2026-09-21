/* JavDB v3 3.9.47-test.1 · 115 long-press magnet overlay */
var JavDBBase3946=null;
var JavDBLocal=(function(){
var VERSION='3.9.47-test.1',BUILD=2026092201;
var ROOT='hiker://files/rules/asset-core-local/javdb-v3-test/b2026092201/';
var ENTRY=ROOT+'local_entry.js',BASE_ENTRY=ROOT+'base_3946_entry.js';
var BASE_REF='a4ed0041665583bafb01287d52217eb62742e2d1';
var BASE_PATH='apps/video/javdb/releases/3.9.46-test.1/local_entry.js';
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t);}
function urls(ref,path){return['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+ref+'/'+path,'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+ref+'/'+path,'https://github.com/huoguotiankong/asset-core-7f3/raw/'+ref+'/'+path];}
function ensureFile(local,ref,path,marker){
  if(fileExist(local)){try{var old=String(readFile(local)||'');if(!bad(old)&&old.indexOf(marker)>=0)return local;}catch(_e){}try{deleteFile(local);}catch(_e2){}}
  var us=urls(ref,path),es=[],i,s='';
  for(i=0;i<us.length;i++){try{s=String(fetch(us[i],{timeout:6500,headers:{'Cache-Control':'public, max-age=31536000, immutable'}})||'');if(bad(s)||s.indexOf(marker)<0)throw new Error('无效响应');writeFile(local,s);if(!fileExist(local))throw new Error('写入失败');return local;}catch(e){es.push((i+1)+':'+String(e.message||e));}}
  throw new Error(path+' 下载失败：'+es.join(' | '));
}
function req(p){var u=getPath(p),r=null;try{r=require(u);}catch(e0){try{deleteCache(u);}catch(e1){}r=require(u);}return r;}
function base(){
  if(JavDBBase3946&&typeof JavDBBase3946.module==='function')return JavDBBase3946;
  ensureFile(BASE_ENTRY,BASE_REF,BASE_PATH,'3.9.46-test.1');
  var src=String(readFile(BASE_ENTRY)||''),JavDBLocal=null;
  if(bad(src)||src.indexOf('3.9.46-test.1')<0)throw new Error('JavDB 3.9.46 Base Entry 内容无效');
  eval(src);
  if(!JavDBLocal||typeof JavDBLocal.module!=='function')throw new Error('JavDB 3.9.46 Base Entry 未导出');
  JavDBBase3946=JavDBLocal;
  return JavDBBase3946;
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
function action115(magnet){
  return {title:'调用115',js:$.toString(function(m){
    m=String(m||'').replace(/&amp;/gi,'&').trim();
    if(!m||m.indexOf('magnet:?')!==0)return 'toast://未识别到磁力链接';
    return 'hiker://page/115Offline?rule=115.简&page=fypage&add='+encodeURIComponent(m);
  },magnet)};
}
function patchMagnets(items){
  if(!(items instanceof Array))return items;
  var i,j,x,ex,old,keep,m,a;
  for(i=0;i<items.length;i++){
    x=items[i];if(!x||typeof x!=='object')continue;
    m=findMagnet(x,0,[]);
    if(!m)continue;
    ex=x.extra;if(!ex||typeof ex!=='object'){ex={};x.extra=ex;}
    old=ex.longClick;
    if(!(old instanceof Array))old=[];
    keep=[];
    for(j=0;j<old.length;j++){a=old[j];if(a&&String(a.title||'').indexOf('115')>=0)continue;keep.push(a);}
    ex.longClick=[action115(m)].concat(keep);
  }
  return items;
}
function runMagnets(oldCustom,ctx){
  var oldSet=null,got=null,hooked=false,err=null,ret=null;
  try{oldSet=setResult;var cap=function(v){got=v;};setResult=cap;hooked=(setResult===cap);}catch(e){hooked=false;}
  if(!hooked)return oldCustom.call(ctx,'javdb3Magnets');
  try{ret=oldCustom.call(ctx,'javdb3Magnets');}catch(e2){err=e2;}finally{try{setResult=oldSet;}catch(_e){}}
  if(err)throw err;
  if(got instanceof Array){got=patchMagnets(got);return oldSet(got);}
  if(got!=null)return oldSet(got);
  return ret;
}
function module(){
  var b=base(),m=b.module();
  if(!m||typeof m.custom!=='function')throw new Error('JavDB 3.9.46 Base Module 未就绪');
  var oldCustom=m.custom;
  m.custom=function(key){if(key==='javdb3Magnets')return runMagnets(oldCustom,m);return oldCustom.call(m,key);};
  m.version=VERSION;m.build=BUILD;m.localFirstVersion=VERSION;m.localFirstBuild=BUILD;
  m.magnet115LongPress=true;
  return m;
}
function info(){
  var b=base(),x={};try{x=b.info?b.info():{};}catch(e){x={ready:false,error:String(e.message||e)};}
  x.version=VERSION;x.build=BUILD;x.baseVersion='3.9.46-test.1';x.magnet115LongPress=true;
  return x;
}
function rebuild(){var b=base();return b.rebuild?b.rebuild():true;}
function statusPage(){
  setPageTitle('JavDB · 本地化诊断');
  var d=[],x=info();
  d.push({title:'JavDB v3 '+VERSION,desc:'Build '+BUILD+' · 磁链长按 115 Overlay',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
  d.push({title:x.ready===false?'基础运行层异常':'基础运行层已就绪',desc:x.ready===false?String(x.error||''):('Base '+String(x.baseVersion||'3.9.46-test.1')),url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  d.push({title:'磁链长按',desc:'第一项：调用115 → 115.简 / 115Offline?add=',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
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
