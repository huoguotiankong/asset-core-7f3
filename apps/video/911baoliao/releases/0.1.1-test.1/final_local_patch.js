/* 911爆料 0.1.1-test.1 Test5-derived Native Local-First overlay */
(function(){
  if(typeof Bl911Core!=='object'||typeof Bl911RemoteRuntime!=='object')throw new Error('911爆料 Local-First base runtime missing');
  var C=Bl911Core,R=Bl911RemoteRuntime;
  var VERSION='0.1.1-test.1',BUILD=10201;
  var ROOT='hiker://files/rules/asset-core-local/911baoliao-test/b10201/';
  var META=ROOT+'bundle_meta.json',BOOT=ROOT+'local_bootstrap.js';
  C.version=VERSION;C.build=BUILD;C.bootstrap=getPath(BOOT);C.localFirstVersion=VERSION;C.localFirstBuild=BUILD;C.localRoot=ROOT;
  R.version=VERSION;R.build=BUILD;R.channel='test-local-first';R.localFirstVersion=VERSION;R.localFirstBuild=BUILD;
  function parse(s,d){try{return JSON.parse(String(s||''));}catch(e){return d;}}
  function meta(){try{return fileExist(META)?parse(readFile(META),{}):{};}catch(e){return{};}}
  function add(d,x){d.push(x);}
  function heading(d,t,desc){add(d,{title:'‘‘’’<b>'+t+'</b>',desc:desc||'',col_type:'rich_text',url:'hiker://empty',extra:{lineVisible:false}});}
  R.localFirst=function(){
    try{setPageTitle('911爆料 · 本地化诊断');}catch(e){}
    var d=[],m=meta(),ready=!!(m&&Number(m.build||0)===BUILD),src=Number(m.sources||0),bytes=Number(m.bytes||0),assets=Number(m.assets||0);
    add(d,{title:'911爆料 '+VERSION,desc:'Build '+BUILD+' · Native Local-First',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
    add(d,{title:ready?'本地 Runtime 已就绪':'本地 Runtime 未就绪',desc:ready?('Source '+String(m.sourceRef||'').slice(0,12)+' · '+src+' 源 · '+bytes+' bytes'):String(m.error||'首次打开主程序会自动安装'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
    add(d,{title:'本地 UI 资产',desc:ready?(assets+' 个 SVG · 911程序图标已切本地'):'等待本地包安装',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
    add(d,{title:'业务基线',desc:'Test5 0.1.0-test.5 / Build10105 · /archives 合同、封面解析、媒体交付保持不变',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
    add(d,{title:'点击重入',desc:'收藏等历史 lazyRule 通过本地 Bootstrap Shim 重建当前 Runtime，不再进入 Remote Manager',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
    add(d,{col_type:'blank_block'});
    add(d,{title:'重建本地包',desc:'删除 Runtime / Bootstrap Shim / SVG 后从不可变 Source Ref 重新安装',url:$('#noLoading#').lazyRule(function(){
      try{var e='hiker://files/rules/asset-core-local/911baoliao-test/b10201/local_entry.js',u=getPath(e);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}Bl911Local.rebuild();refreshPage(false);return'toast://911爆料本地包已重建';}catch(ex){return'toast://重建失败：'+String(ex.message||ex);}
    }),col_type:'text_1',extra:{lineVisible:false}});
    add(d,{title:'复制诊断摘要',desc:'不包含 Cookie / Token / Authorization',url:$('#noLoading#').lazyRule(function(){
      var e='hiker://files/rules/asset-core-local/911baoliao-test/b10201/local_entry.js',u=getPath(e);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}var x=Bl911Local.info(),m=x.meta||{};return'copy://911爆料 Local-First '+x.version+' Build'+x.build+' ready='+x.ready+' source='+String(m.sourceRef||'')+' sources='+String(m.sources||0)+' assets='+String(m.assets||0)+' bytes='+String(m.bytes||0)+' rewrites='+String(m.rewrites||0);
    }),col_type:'text_1',extra:{lineVisible:false}});
    setResult(d);
  };
  R.settings=function(){
    try{setPageTitle('设置与诊断');}catch(e){}
    var d=[],b=C.base(),probe=C.request('/',{route:'settings-probe',noRetry:true}),posts=probe.ok?C.parsePosts(probe.html,probe.url):[],cats=probe.ok?C.extractNavLinks(probe.html,probe.url):[],diag=C.lastDiag(),m=meta();
    add(d,{title:'911爆料 · Local-First',desc:VERSION+' · Build '+BUILD,url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
    add(d,{title:'本地化诊断',desc:(m&&Number(m.build||0)===BUILD)?('Runtime ready · '+String(m.sources||0)+' 源 · '+String(m.assets||0)+' 资产'):'本地包状态待确认',col_type:'text_1',url:C.page('bl911LocalFirst'),extra:{lineVisible:false}});
    heading(d,'站点状态','');
    add(d,{title:'当前域名',desc:b,col_type:'text_1',url:'hiker://empty'});
    add(d,{title:'首页探测',desc:(probe.ok?'可访问':'不可访问')+' · HTML '+(probe.html?probe.html.length:0)+' · 真实文章 '+posts.length+' · 分类 '+cats.length,col_type:'text_1',url:'hiker://empty'});
    add(d,{title:'重新探测站点',desc:'按最后有效域名与已验证镜像重新探测',col_type:'text_1',url:$('#noLoading#').lazyRule(function(){try{var M=$.require('bl911'),x=M.core().discoverBase(true);refreshPage(false);return'toast://'+(x.ok?'当前可用：'+x.base:'暂未找到可用域名');}catch(e){return'toast://探测失败：'+String(e.message||e);}}),extra:{lineVisible:false}});
    heading(d,'Parser 合同','');
    add(d,{title:'文章路由',desc:'只接受 /archives/<数字>/',col_type:'text_1',url:'hiker://empty'});
    add(d,{title:'播放交付',desc:'详情已有媒体直接交付；多线路只在合法 article URL 上执行 lazyRule',col_type:'text_1',url:'hiker://empty'});
    heading(d,'本地数据','');
    add(d,{title:'清空浏览历史',desc:C.readList(C.historyKey).length+' 项',col_type:'text_1',url:$('#noLoading#').lazyRule(function(){try{var M=$.require('bl911');M.core().clearHistory();refreshPage(false);return'toast://历史已清空';}catch(e){return'toast://操作失败：'+String(e.message||e);}})});
    add(d,{title:'清空本地收藏',desc:C.readList(C.favoriteKey).length+' 项',col_type:'text_1',url:$('#noLoading#').lazyRule(function(){try{var M=$.require('bl911');M.core().clearFavorites();refreshPage(false);return'toast://收藏已清空';}catch(e){return'toast://操作失败：'+String(e.message||e);}})});
    heading(d,'最近诊断','');
    add(d,{title:diag.stage||'暂无诊断',desc:[diag.route||'',diag.error||'',diag.extra?JSON.stringify(diag.extra):''].filter(function(v){return!!v;}).join(' · '),col_type:'long_text',url:'hiker://empty'});
    heading(d,'版本管理','');
    add(d,{title:'检查程序更新',desc:'由“我的规则仓库”统一管理；当前页不访问 Remote Manager',col_type:'text_1',url:'toast://请在“我的规则仓库”执行轻同步检查更新'});
    setResult(d);
  };
  R.module=function(){return{home:R.home,categoryHub:R.categoryHub,categoryFeed:R.categoryFeed,search:R.search,searchPage:R.searchPage,detail:R.detail,favorites:R.favorites,history:R.history,settings:R.settings,localFirst:R.localFirst};};
})();
