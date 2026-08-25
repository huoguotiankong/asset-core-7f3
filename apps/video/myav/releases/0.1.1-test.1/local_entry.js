/* MyAv 0.1.1-test.1 Local-First entry */
var MyAvLocal=(function(){
var VERSION='0.1.1-test.1',BUILD=10201;
var ROOT='hiker://files/rules/asset-core-local/myav-test/b10201/';
var BUILDER=ROOT+'local_bundle_builder.js';
var BREF='62557eefb3007432ca2b36f321ddc0d4ff23c996';
var BPATH='apps/video/myav/releases/0.1.1-test.1/local_bundle_builder.js';
function bad(t){t=String(t==null?'':t).replace(/^\uFEFF/,'').trim();return !t||/^(?:<!doctype|<html|Bad Gateway|Too Many Requests|Service Unavailable|Gateway Timeout|Not Found|Error\b|Exception\b|HTTP\b|Cannot\b|Couldn(?:'|’)t\b)/i.test(t);}
function ensure(){if(fileExist(BUILDER))return BUILDER;var us=['https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/'+BREF+'/'+BPATH,'https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@'+BREF+'/'+BPATH,'https://github.com/huoguotiankong/asset-core-7f3/raw/'+BREF+'/'+BPATH],es=[];for(var i=0;i<us.length;i++){try{var s=String(fetch(us[i],{timeout:6500,headers:{'Cache-Control':'public, max-age=31536000, immutable'}})||'');if(bad(s)||s.indexOf(VERSION)<0)throw new Error('无效响应');writeFile(BUILDER,s);if(!fileExist(BUILDER))throw new Error('写入失败');return BUILDER;}catch(e){es.push((i+1)+':'+String(e.message||e));}}throw new Error('MyAv 本地 Builder 下载失败：'+es.join(' | '));}
function req(p){var u=getPath(p),r=null;try{r=require(u);}catch(e0){try{deleteCache(u);}catch(e1){}r=require(u);}return r;}
function builder(){ensure();req(BUILDER);if(typeof MyAvLocalBuilder!=='object'||typeof MyAvLocalBuilder.load!=='function')throw new Error('MyAvLocalBuilder 未导出');return MyAvLocalBuilder;}
function module(){var x=builder().load(),r=x.runtime;if(!r||typeof r.module!=='function'||String(r.localFirstVersion||'')!==VERSION)throw new Error('MyAv Local-First runtime 未就绪');var m=r.module();if(!m||typeof m.home!=='function'||typeof m.detail!=='function'||typeof m.localPlayback!=='function')throw new Error('MyAv business module preflight failed');return m;}
function info(){try{var b=builder(),m=b.meta(),li=null;if(m){try{var r=req(b.runtime);if(r&&typeof r.module==='function'){var x=r.module();if(x&&typeof x.localInfo==='function')li=x.localInfo();}}catch(e0){}}return{version:VERSION,build:BUILD,ready:!!m,meta:m||{},runtime:li||{}};}catch(e){return{version:VERSION,build:BUILD,ready:false,error:String(e.message||e)};}}
function rebuild(){var b=builder();b.reset();var m=b.install(true);try{deleteCache(getPath(b.runtime));}catch(e){}return m;}
function statusPage(){
  setPageTitle('MyAv · 本地化诊断');
  var d=[],x=info(),m=x.meta||{},r=x.runtime||{},ready=!!x.ready;
  d.push({title:'MyAv '+VERSION,desc:'Build '+BUILD+' · Native Local-First',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
  d.push({title:ready?'本地 Runtime 已就绪':'本地 Runtime 未就绪',desc:ready?('Source '+String(m.sourceRef||'').slice(0,12)+' · '+String(m.sources||0)+' 源 · '+String(m.bytes||0)+' bytes'):String(x.error||'首次打开主程序会自动安装'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
  d.push({title:'共享播放 SDK',desc:ready?String(m.sharedPlayback||'1.0.0-test.4-local'):'等待本地包安装',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  d.push({title:'应用图标',desc:ready?('本地 SVG · '+String(m.appIconPath||'')):'等待本地包安装',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  d.push({title:'业务基线',desc:'Stable 0.1.0 / Build10112 · 23 层业务模块原顺序冻结',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
  d.push({col_type:'blank_block'});
  d.push({title:'重建本地包',desc:'删除 Runtime / 图标后从不可变 Source Ref 重新安装',url:$('#noLoading#').lazyRule(function(){try{var E='hiker://files/rules/asset-core-local/myav-test/b10201/local_entry.js',u=getPath(E);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}MyAvLocal.rebuild();refreshPage(false);return'toast://MyAv 本地包已重建';}catch(e){return'toast://重建失败：'+String(e.message||e);}}),col_type:'text_1',extra:{lineVisible:false}});
  d.push({title:'复制诊断摘要',desc:'不包含 Cookie / Token / Authorization',url:$('#noLoading#').lazyRule(function(){var E='hiker://files/rules/asset-core-local/myav-test/b10201/local_entry.js',u=getPath(E);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}var x=MyAvLocal.info(),m=x.meta||{},r=x.runtime||{};return'copy://MyAv Local-First '+x.version+' Build'+x.build+' ready='+x.ready+' source='+String(m.sourceRef||'')+' sources='+String(m.sources||0)+' bytes='+String(m.bytes||0)+' playback='+String(m.sharedPlayback||'')+' appIcon='+String(m.appIcon||'');}),col_type:'text_1',extra:{lineVisible:false}});
  setResult(d);
}
return{version:VERSION,build:BUILD,module:module,info:info,rebuild:rebuild,statusPage:statusPage,builder:builder};
})();
