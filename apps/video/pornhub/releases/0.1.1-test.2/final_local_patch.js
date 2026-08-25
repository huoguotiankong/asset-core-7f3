/* Pornhub 0.1.1-test.2 Stable-derived Local-First overlay */
(function(){
  if(typeof PornhubCore!=='object'||typeof PornhubRemoteRuntime!=='object')throw new Error('Pornhub Local-First base runtime missing');
  var C=PornhubCore,R=PornhubRemoteRuntime;
  var VERSION='0.1.1-test.2',BUILD=10202;
  var ROOT='hiker://files/rules/asset-core-local/pornhub-test/b10202/';
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
    try{setPageTitle('Pornhub · 本地化诊断');}catch(e){}
    var d=[],m=meta(),ready=!!(m&&Number(m.build||0)===BUILD),src=Number(m.sources||0),bytes=Number(m.bytes||0),assets=Number(m.assets||0);
    add(d,{title:'Pornhub '+VERSION,desc:'Build '+BUILD+' · Native Local-First',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
    add(d,{title:ready?'本地 Runtime 已就绪':'本地 Runtime 未就绪',desc:ready?('Source '+String(m.sourceRef||'').slice(0,12)+' · '+src+' 源 · '+bytes+' bytes'):String(m.error||'首次打开主程序会自动安装'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
    add(d,{title:'本地 UI 资产',desc:ready?(assets+' 个 SVG · 运行时资产根已切本地'):'等待本地包安装',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
    add(d,{title:'业务基线',desc:'Stable 0.1.0 / Build10108 · 本轮不改账号/评论/Shorts/片单/播放协议',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
    add(d,{title:'点击重入',desc:'历史 lazyRule 通过本地 Bootstrap Shim 重建当前 Runtime，不再进入远程 Bootstrap/Manager',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
    add(d,{title:'Test2 修复',desc:'源码正文严格校验 + Bootstrap 赋值重写 + 资产根定向替换；门禁仍保持开启',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
    add(d,{col_type:'blank_block'});
    add(d,{title:'重建本地包',desc:'删除 Runtime / Bootstrap Shim / SVG 后从不可变 Source Ref 重新安装',url:$('#noLoading#').lazyRule(function(){try{var e='hiker://files/rules/asset-core-local/pornhub-test/b10202/local_entry.js',u=getPath(e);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}PornhubLocal.rebuild();refreshPage(false);return'toast://Pornhub 本地包已重建';}catch(ex){return'toast://重建失败：'+String(ex.message||ex);}}),col_type:'text_1',extra:{lineVisible:false}});
    add(d,{title:'复制诊断摘要',desc:'不包含 Cookie / Token / Authorization',url:$('#noLoading#').lazyRule(function(){var e='hiker://files/rules/asset-core-local/pornhub-test/b10202/local_entry.js',u=getPath(e);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}var x=PornhubLocal.info(),m=x.meta||{};return'copy://Pornhub Local-First '+x.version+' Build'+x.build+' ready='+x.ready+' source='+String(m.sourceRef||'')+' sources='+String(m.sources||0)+' assets='+String(m.assets||0)+' bytes='+String(m.bytes||0)+' rewrites='+String(m.rewrites||0);}),col_type:'text_1',extra:{lineVisible:false}});
    setResult(d);
  };

  R.settings=function(){
    try{setPageTitle('设置与诊断');}catch(e){}
    var d=[],b=C.base(),ready=C.accountReady(),m=meta();
    section(d,'运行信息','');
    add(d,{title:'版本',desc:VERSION+' · Build '+BUILD+' · Native Local-First',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'本地化诊断',desc:(m&&Number(m.build||0)===BUILD)?('Runtime ready · '+String(m.sources||0)+' 源 · '+String(m.assets||0)+' 资产'):'本地包状态待确认',col_type:'text_1',url:C.page('pornhubLocalFirst'),extra:{lineVisible:false}});
    add(d,{title:'当前站点',desc:b,col_type:'text_1',url:'input://'+JSON.stringify({value:b,hint:'https://www.pornhub.com',js:"(function(){var v=String(input||'').trim().replace(/\\/+$/,'');if(!/^https?:\\/\\//i.test(v))return 'toast://请输入完整 https:// 地址';setItem('"+C.baseKey+"',v);refreshPage(false);return 'toast://站点地址已更新';})()"}),extra:{lineVisible:false}});
    add(d,{title:'账号状态',desc:ready?'已启用 · '+(C.accountName()||'用户名待确认'):'未启用',col_type:'text_1',url:C.page('pornhubLogin'),extra:{lineVisible:false}});
    section(d,'本地数据','');
    add(d,{title:'清空本地浏览历史',col_type:'text_1',url:$(C.historyKey).lazyRule(function(key){try{var M=$.require('pornhub');M.core().writeList(key,[]);refreshPage(false);return'toast://历史已清空';}catch(e){return'toast://操作失败：'+String(e.message||e);}},C.historyKey),extra:{lineVisible:false}});
    add(d,{title:'清空本地收藏',col_type:'text_1',url:$(C.favoriteKey).lazyRule(function(key){try{var M=$.require('pornhub');M.core().writeList(key,[]);refreshPage(false);return'toast://本地收藏已清空';}catch(e){return'toast://操作失败：'+String(e.message||e);}},C.favoriteKey),extra:{lineVisible:false}});
    section(d,'版本管理','');
    add(d,{title:'检查程序更新',desc:'由“我的规则仓库”统一管理；当前页不再访问 Remote Manager',col_type:'text_1',url:'toast://请在“我的规则仓库”执行轻同步检查更新',extra:{lineVisible:false}});
    add(d,{title:'原站网页',desc:b,col_type:'text_1',url:'web://'+b+'/',extra:{lineVisible:false}});
    setResult(d);
  };

  R.module=function(){return{home:R.home,catalog:R.catalog,categories:R.categories,category:R.category,search:R.search,searchPage:R.searchPage,detail:R.detail,comments:R.comments,creators:R.creators,profile:R.profile,gifs:R.gifs,shorts:R.shorts,playlists:R.playlists,playlistDetail:R.playlistDetail,login:R.login,account:R.account,accountList:R.accountList,subscriptions:R.subscriptions,localFavorites:R.localFavorites,localHistory:R.localHistory,settings:R.settings,localFirst:R.localFirst};};
})();
