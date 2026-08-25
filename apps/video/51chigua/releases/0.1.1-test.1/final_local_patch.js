/* 51吃瓜 0.1.1-test.1 Stable-derived Local-First overlay */
(function(){
  if(typeof Cg51Core!=='object'||typeof Cg51RemoteRuntime!=='object')throw new Error('51chigua Local-First base runtime missing');
  var C=Cg51Core,R=Cg51RemoteRuntime;
  var VERSION='0.1.1-test.1',BUILD=10201;
  var ROOT='hiker://files/rules/asset-core-local/51chigua-test/b10201/';
  var META=ROOT+'bundle_meta.json',BOOT=ROOT+'local_bootstrap.js';
  C.version=VERSION;C.build=BUILD;C.channel='test-local-first';
  C.bootstrap=getPath(BOOT);
  C.localFirstVersion=VERSION;C.localFirstBuild=BUILD;C.localRoot=ROOT;
  R.version=VERSION;R.build=BUILD;R.channel='test-local-first';
  R.localFirstVersion=VERSION;R.localFirstBuild=BUILD;

  function parse(s,d){try{return JSON.parse(String(s||''));}catch(e){return d;}}
  function meta(){try{return fileExist(META)?parse(readFile(META),{}):{};}catch(e){return{};}}
  function add(d,x){d.push(x);}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}

  R.localFirst=function(){
    try{setPageTitle('51吃瓜 · 本地化诊断');}catch(e){}
    var d=[],m=meta(),ready=!!(m&&Number(m.build||0)===BUILD),src=Number(m.sources||0),bytes=Number(m.bytes||0),assets=Number(m.assets||0);
    add(d,{title:'51吃瓜 '+VERSION,desc:'Build '+BUILD+' · Native Local-First',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
    add(d,{title:ready?'本地 Runtime 已就绪':'本地 Runtime 未就绪',desc:ready?('Source '+String(m.sourceRef||'').slice(0,12)+' · '+src+' 源 · '+bytes+' bytes'):String(m.error||'首次打开主程序会自动安装'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
    add(d,{title:'本地 UI 资产',desc:ready?(assets+' 个 SVG · 搜索/分类/收藏/历史/评论等资产已切本地'):'等待本地包安装',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
    add(d,{title:'业务基线',desc:'Stable 0.1.0 / Build10106 · 本轮不改图片 AES、评论接口、HLS 播放、分类/搜索业务协议',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
    add(d,{title:'点击重入',desc:'历史 lazyRule 通过本地 Bootstrap Shim 重建当前 Runtime，不再进入 Remote Manager',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
    add(d,{col_type:'blank_block'});
    add(d,{title:'重建本地包',desc:'删除 Runtime / Bootstrap Shim / SVG 后从不可变 Source Ref 重新安装',url:$('#noLoading#').lazyRule(function(){
      try{
        var e='hiker://files/rules/asset-core-local/51chigua-test/b10201/local_entry.js',u=getPath(e);
        try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}
        Cg51Local.rebuild();refreshPage(false);return'toast://51吃瓜本地包已重建';
      }catch(ex){return'toast://重建失败：'+String(ex.message||ex);}
    }),col_type:'text_1',extra:{lineVisible:false}});
    add(d,{title:'复制诊断摘要',desc:'不包含 Cookie / Token / Authorization',url:$('#noLoading#').lazyRule(function(){
      var e='hiker://files/rules/asset-core-local/51chigua-test/b10201/local_entry.js',u=getPath(e);
      try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}
      var x=Cg51Local.info(),m=x.meta||{};
      return'copy://51吃瓜 Local-First '+x.version+' Build'+x.build+' ready='+x.ready+' source='+String(m.sourceRef||'')+' sources='+String(m.sources||0)+' assets='+String(m.assets||0)+' bytes='+String(m.bytes||0)+' rewrites='+String(m.rewrites||0);
    }),col_type:'text_1',extra:{lineVisible:false}});
    setResult(d);
  };

  R.settings=function(){
    try{setPageTitle('设置与诊断');}catch(e){}
    var d=[],b=C.base(),probe=C.request('/',{route:'settings-probe',noRetry:true}),posts=probe.ok?C.parsePosts(probe.html,probe.url):[],diag=C.lastDiag(),m=meta();
    section(d,'运行信息','');
    add(d,{title:'版本',desc:VERSION+' · Build '+BUILD+' · Native Local-First',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'本地化诊断',desc:(m&&Number(m.build||0)===BUILD)?('Runtime ready · '+String(m.sources||0)+' 源 · '+String(m.assets||0)+' 资产'):'本地包状态待确认',col_type:'text_1',url:C.page('cg51LocalFirst'),extra:{lineVisible:false}});
    add(d,{title:'当前域名',desc:b,col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'首页诊断',desc:(probe.ok?'可访问':'不可访问')+' · 识别文章 '+posts.length+' 条',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'重新探测站点',desc:'按最后有效域名 → 官方候选域名有限探活',col_type:'text_1',url:$('#noLoading#').lazyRule(function(){
      try{var M=$.require('cg51'),x=M.core().discoverBase(true);refreshPage(false);return'toast://'+(x.ok?'已切换到 '+x.base:'未找到可用域名');}
      catch(e){return'toast://探测失败：'+String(e.message||e);}
    }),extra:{lineVisible:false}});
    section(d,'本地数据','');
    add(d,{title:'清空浏览历史',desc:C.readList(C.historyKey).length+' 项',col_type:'text_1',url:$(C.historyKey).lazyRule(function(key){
      try{var M=$.require('cg51');M.core().writeList(key,[]);refreshPage(false);return'toast://历史已清空';}
      catch(e){return'toast://操作失败：'+String(e.message||e);}
    },C.historyKey),extra:{lineVisible:false}});
    add(d,{title:'清空本地收藏',desc:C.readList(C.favoriteKey).length+' 项',col_type:'text_1',url:$(C.favoriteKey).lazyRule(function(key){
      try{var M=$.require('cg51');M.core().writeList(key,[]);refreshPage(false);return'toast://收藏已清空';}
      catch(e){return'toast://操作失败：'+String(e.message||e);}
    },C.favoriteKey),extra:{lineVisible:false}});
    section(d,'播放诊断','');
    add(d,{title:'最近路线',desc:[diag.stage||'暂无',diag.route||'',diag.error||''].filter(function(v){return!!v;}).join(' · '),col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    section(d,'版本管理','');
    add(d,{title:'检查程序更新',desc:'由“我的规则仓库”统一管理；当前页不再访问 Remote Manager',col_type:'text_1',url:'toast://请在“我的规则仓库”执行轻同步检查更新',extra:{lineVisible:false}});
    add(d,{title:'打开当前官网',desc:b,col_type:'text_1',url:b+'/',extra:{lineVisible:false}});
    setResult(d);
  };

  R.module=function(){return{
    home:R.home,
    categories:R.categories,categoryHub:R.categoryHub,
    category:R.category,categoryFeed:R.categoryFeed,
    search:R.search,searchPage:R.searchPage,
    detail:R.detail,comments:R.comments,
    favorites:R.favorites,history:R.history,
    settings:R.settings,localFirst:R.localFirst
  };};
})();
