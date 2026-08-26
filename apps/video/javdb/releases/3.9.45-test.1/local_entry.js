/* JavDB v3 3.9.45-test.1 Local-First Product/UI overlay entry */
var JavDBLocal=(function(){
var VERSION='3.9.45-test.1',BUILD=2026082601;
var ROOT='hiker://files/rules/asset-core-local/javdb-v3-test/b2026082601/';
var ENTRY=ROOT+'local_entry.js',UI=ROOT+'product_ui_patch.js';
var BASE_ROOT='hiker://files/rules/asset-core-local/javdb-v3-test/b2026082501/';
var BASE_BUILDER=BASE_ROOT+'local_bundle_builder.js';
var BASE_BREF='2361fbbfc21c540191495b979b30a6828adfe9c1';
var BASE_BPATH='apps/video/javdb/releases/3.9.44-test.1/local_bundle_builder.js';
var UI_REF='d22dde89479cfff74b5b1f04dce55ef6068dcf70';
var UI_PATH='apps/video/javdb/releases/3.9.45-test.1/product_ui_patch.js';
var UI_MARK='3.9.45-test.1';
var PATCH_CACHE='';
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t);}
function urls(ref,path){return['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+ref+'/'+path,'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+ref+'/'+path,'https://github.com/huoguotiankong/asset-core-7f3/raw/'+ref+'/'+path];}
function ensureFile(local,ref,path,marker){
  if(fileExist(local)){
    try{var old=String(readFile(local)||'');if(!bad(old)&&(!marker||old.indexOf(marker)>=0))return local;}catch(_e){}
    try{deleteFile(local);}catch(_e2){}
  }
  var us=urls(ref,path),es=[];
  for(var i=0;i<us.length;i++){
    try{
      var s=String(fetch(us[i],{timeout:6500,headers:{'Cache-Control':'public, max-age=31536000, immutable'}})||'');
      if(bad(s)||(marker&&s.indexOf(marker)<0))throw new Error('无效响应');
      writeFile(local,s);if(!fileExist(local))throw new Error('写入失败');
      return local;
    }catch(e){es.push((i+1)+':'+String(e.message||e));}
  }
  throw new Error(path+' 下载失败：'+es.join(' | '));
}
function req(p){var u=getPath(p),r=null;try{r=require(u);}catch(e0){try{deleteCache(u);}catch(e1){}r=require(u);}return r;}
function builder(){
  ensureFile(BASE_BUILDER,BASE_BREF,BASE_BPATH,'3.9.44-test.1');
  req(BASE_BUILDER);
  if(typeof JavDBLocalBuilder!=='object'||typeof JavDBLocalBuilder.load!=='function')throw new Error('JavDB 基础 Local Builder 未导出');
  return JavDBLocalBuilder;
}
function uiPatch(force){
  if(force){try{if(fileExist(UI))deleteFile(UI);}catch(_e){}PATCH_CACHE='';}
  if(PATCH_CACHE)return PATCH_CACHE;
  ensureFile(UI,UI_REF,UI_PATH,UI_MARK);
  var s=String(readFile(UI)||'');
  if(bad(s)||s.indexOf(UI_MARK)<0||s.indexOf('Product / UI overhaul overlay')<0)throw new Error('JavDB Product/UI Overlay 校验失败');
  PATCH_CACHE=s;return s;
}
function baseLoad(){var b=builder(),x=b.load(),r=x&&x.runtime;if(!r||typeof r.core!=='function'||String(r.localFirstVersion||'')!=='3.9.44-test.1')throw new Error('JavDB 3.9.44 Local-First 基础 Runtime 未就绪');return{builder:b,pack:x,runtime:r};}
function module(){
  var base=baseLoad(),r=base.runtime,p=uiPatch(false);
  function core(call){var c='eval('+JSON.stringify(p)+');'+String(call||'');return r.core(c);}
  return{
    version:VERSION,build:BUILD,localFirstVersion:VERSION,localFirstBuild:BUILD,productUiVersion:VERSION,productUiBuild:BUILD,
    baseVersion:String(r.localFirstVersion||''),baseBuild:Number(r.localFirstBuild||0),
    core:core,
    custom:function(key){return r.custom(key);},
    playback:function(){return r.playback();},
    customData:function(){return r.customData();},
    localBundleMeta:base.pack&&base.pack.meta?base.pack.meta:null
  };
}
function info(){
  try{
    var b=builder(),m=b.meta(),uiReady=false;
    try{uiReady=fileExist(UI)&&String(readFile(UI)||'').indexOf(UI_MARK)>=0;}catch(_e){uiReady=false;}
    return{version:VERSION,build:BUILD,ready:!!m&&uiReady,uiReady:uiReady,baseReady:!!m,baseMeta:m||{},uiRef:UI_REF};
  }catch(e){return{version:VERSION,build:BUILD,ready:false,uiReady:false,baseReady:false,error:String(e.message||e),uiRef:UI_REF};}
}
function rebuild(){
  uiPatch(true);
  var b=builder();b.reset();var m=b.install(true);
  try{deleteCache(getPath(b.runtime));}catch(_e){}
  return{ui:true,base:m};
}
function statusPage(){
  setPageTitle('JavDB · 本地化诊断');
  var d=[],x=info(),m=x.baseMeta||{};
  d.push({title:'JavDB v3 '+VERSION,desc:'Build '+BUILD+' · Local-First Product/UI Overlay',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
  d.push({title:x.uiReady?'新版 UI Overlay 已就绪':'新版 UI Overlay 未就绪',desc:'UI Ref '+String(x.uiRef||'').slice(0,12),url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  d.push({title:x.baseReady?'基础 Runtime 已就绪':'基础 Runtime 未就绪',desc:x.baseReady?('Base '+String(m.version||'3.9.44-test.1')+' · '+String(m.sources||0)+' 源 · '+String(m.bytes||0)+' bytes'):String(x.error||'首次打开主程序会自动安装'),url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  d.push({title:'业务基线',desc:'Stable 3.9.42 / Build2026082301 · API / 登录 / 官方播放继续继承',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  d.push({col_type:'line_blank'});
  d.push({title:'重建本地运行包',desc:'重新安装固定版本基础 Runtime 与新版 UI Overlay',url:$('#noLoading#').lazyRule(function(){try{var E='hiker://files/rules/asset-core-local/javdb-v3-test/b2026082601/local_entry.js',u=getPath(E);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}JavDBLocal.rebuild();refreshPage(false);return'toast://JavDB 本地运行包已重建';}catch(e){return'toast://重建失败：'+String(e.message||e);}}),col_type:'text_1',extra:{lineVisible:false}});
  d.push({title:'复制诊断摘要',desc:'不包含 Token / Cookie / Authorization',url:$('#noLoading#').lazyRule(function(){var E='hiker://files/rules/asset-core-local/javdb-v3-test/b2026082601/local_entry.js',u=getPath(E);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}var x=JavDBLocal.info(),m=x.baseMeta||{};return'copy://JavDB Product UI '+x.version+' Build'+x.build+' ready='+x.ready+' ui='+x.uiReady+' uiRef='+String(x.uiRef||'')+' base='+String(m.version||'')+' baseBuild='+String(m.build||'')+' sources='+String(m.sources||0)+' bytes='+String(m.bytes||0);}),col_type:'text_1',extra:{lineVisible:false}});
  setResult(d);
}
return{version:VERSION,build:BUILD,module:module,info:info,rebuild:rebuild,statusPage:statusPage,builder:builder,uiPatch:uiPatch,entry:ENTRY};
})();
