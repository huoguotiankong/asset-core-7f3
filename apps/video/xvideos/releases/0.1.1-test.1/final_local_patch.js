/* XVideos 0.1.1-test.1 Test7-derived Native Local-First overlay */
(function(){
  if(typeof XVideosCore!=='object'||typeof XVideosRemoteRuntime!=='object')throw new Error('XVideos Local-First base runtime missing');
  var C=XVideosCore,R=XVideosRemoteRuntime;
  var VERSION='0.1.1-test.1',BUILD=10201;
  var ROOT='hiker://files/rules/asset-core-local/xvideos-test/b10201/';
  var META=ROOT+'bundle_meta.json',BOOT=ROOT+'local_bootstrap.js';
  C.version=VERSION;C.build=BUILD;C.bootstrap=getPath(BOOT);C.localFirstVersion=VERSION;C.localFirstBuild=BUILD;C.localRoot=ROOT;
  R.version=VERSION;R.build=BUILD;R.channel='test-local-first';R.localFirstVersion=VERSION;R.localFirstBuild=BUILD;
  function parse(s,d){try{return JSON.parse(String(s||''));}catch(e){return d;}}
  function meta(){try{return fileExist(META)?parse(readFile(META),{}):{};}catch(e){return{};}}
  function add(d,x){d.push(x);}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  R.localFirst=function(){
    try{setPageTitle('XVideos · 本地化诊断');}catch(e){}
    var d=[],m=meta(),ready=!!(m&&Number(m.build||0)===BUILD),src=Number(m.sources||0),bytes=Number(m.bytes||0),assets=Number(m.assets||0);
    add(d,{title:'XVideos '+VERSION,desc:'Build '+BUILD+' · Native Local-First',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
    add(d,{title:ready?'本地 Runtime 已就绪':'本地 Runtime 未就绪',desc:ready?('Source '+String(m.sourceRef||'').slice(0,12)+' · '+src+' 源 · '+bytes+' bytes'):String(m.error||'首次打开主程序会自动安装'),url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}});
    add(d,{title:'本地 UI 资产',desc:ready?(assets+' 个 SVG · 全部程序图标已切本地'):'等待本地包安装',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
    add(d,{title:'业务基线',desc:'Test7 0.1.0-test.7 / Build10107 · 人物/频道/账号/评论协议与最高画质播放保持不变',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
    add(d,{title:'点击重入',desc:'历史 lazyRule 通过本地 Bootstrap Shim 重建当前 Runtime，不再加载远程 Bootstrap',url:'hiker://empty',col_type:'text_2',extra:{lineVisible:false}});
    add(d,{col_type:'blank_block'});
    add(d,{title:'重建本地包',desc:'删除 Runtime / Bootstrap Shim / SVG 后从不可变 Source Ref 重新安装',url:$('#noLoading#').lazyRule(function(){
      try{var e='hiker://files/rules/asset-core-local/xvideos-test/b10201/local_entry.js',u=getPath(e);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}XVideosLocal.rebuild();refreshPage(false);return'toast://XVideos 本地包已重建';}catch(ex){return'toast://重建失败：'+String(ex.message||ex);}
    }),col_type:'text_1',extra:{lineVisible:false}});
    add(d,{title:'复制诊断摘要',desc:'不包含 Cookie / Token / Authorization',url:$('#noLoading#').lazyRule(function(){
      var e='hiker://files/rules/asset-core-local/xvideos-test/b10201/local_entry.js',u=getPath(e);try{require(u);}catch(e0){try{deleteCache(u);}catch(e1){}require(u);}var x=XVideosLocal.info(),m=x.meta||{};return'copy://XVideos Local-First '+x.version+' Build'+x.build+' ready='+x.ready+' source='+String(m.sourceRef||'')+' sources='+String(m.sources||0)+' assets='+String(m.assets||0)+' bytes='+String(m.bytes||0)+' rewrites='+String(m.rewrites||0);
    }),col_type:'text_1',extra:{lineVisible:false}});
    setResult(d);
  };
  R.settings=function(){
    try{setPageTitle('XVideos 设置');}catch(e){}
    var d=[],m=meta(),ready=!!(m&&Number(m.build||0)===BUILD);
    section(d,'运行信息',VERSION+' · Build '+BUILD+' · Native Local-First');
    add(d,{title:'本地化诊断',desc:ready?('Runtime ready · '+String(m.sources||0)+' 源 · '+String(m.assets||0)+' SVG'):'本地包状态待确认',col_type:'text_1',url:C.page('xvideosLocalFirst'),extra:{lineVisible:false}});
    section(d,'存储策略','继续沿用 Test5 私有存储救援：完整 HTML、账号会话状态、收藏、足迹、搜索历史不写入 1MB 私有 KV；账号 Cookie 只实时读取 X5。');
    add(d,{title:'当前站点域名',desc:C.base(),col_type:'text_1',url:'input://'+JSON.stringify({value:C.base(),hint:'https://www.xvideos.com',js:"var v=String(input||'').trim().replace(/\\/+$/,'');if(!/^https?:\\/\\//i.test(v))return 'toast://请输入完整 http(s) 地址';return XVideosCore.saveBase(v)?'toast://已保存，重新进入页面生效':'toast://保存失败';"}),extra:{lineVisible:false}});
    add(d,{title:'清理本次运行内存缓存',desc:'不清账号、收藏、足迹或搜索历史',col_type:'text_1',url:$('#noLoading#').lazyRule(function(){if(XVideosCore._t5Storage){XVideosCore._t5Storage.MEM={};XVideosCore._t5Storage.MEM_TS={};XVideosCore._t5Storage.PROFILE_MEM={};XVideosCore._t5Storage.PROFILE_TS={};}return'toast://本次运行内存缓存已清理';}),extra:{lineVisible:false}});
    add(d,{title:'检查程序更新',desc:'由“我的规则仓库”统一轻同步；当前页不访问远程 Bootstrap/Manager',col_type:'text_1',url:'toast://请在“我的规则仓库”执行轻同步检查更新',extra:{lineVisible:false}});
    section(d,'业务基线','Test7 的详情、最高画质播放、演员/频道/创作者、账号 X5 会话和评论适配不因本地化迁移而改写。');
    setResult(d);
  };
  var oldRoute=R.route;
  R.route=function(){var v=C.param('view','');if(v==='xvideosLocalFirst')return R.localFirst();return oldRoute?oldRoute.apply(R,arguments):R.home();};
  R.module=function(){return R;};
})();
