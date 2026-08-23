/* XVideos Product/Account UI Patch 0.1.0-test.4 */
(function(){
  if(typeof XVideosRemoteRuntime==='undefined'||typeof XVideosCore==='undefined')throw new Error('XVideos Test4 UI preflight failed');
  var R=XVideosRemoteRuntime,C=XVideosCore,A='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/xvideos/assets/';
  R.version='0.1.0-test.4';R.build=10104;
  function add(d,x){d.push(x);}
  function title(t){try{setPageTitle(t);}catch(e){}}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  function divider(d){add(d,{col_type:'line'});}
  function icon(d,t,desc,ico,url){add(d,{title:t,desc:desc||'',pic_url:A+ico+'.svg',col_type:'icon_small_4',url:url,extra:{lineVisible:false}});}
  function action(d,t,desc,ico,url){add(d,{title:t,desc:desc||'',pic_url:A+ico+'.svg',col_type:'text_1',url:url,extra:{lineVisible:false}});}
  function btn(d,t,url,on){add(d,{title:(on?'● ':'')+t,col_type:'flex_button',url:url,extra:{lineVisible:false}});}
  function empty(d,t,desc,url){section(d,t,desc);if(url)add(d,{title:'在官网打开',desc:url,col_type:'text_center_1',url:'web://'+url,extra:{lineVisible:false}});}
  function card(c){return{title:c.title||'Video',desc:c.desc||'',pic_url:c.img||'',url:C.page('xvideosDetail',{u:c.url}),col_type:'movie_2',extra:{id:'xv4_video_'+C.hash(c.url),lineVisible:false}};}
  function videos(d,a,limit){limit=limit||a.length;for(var i=0;i<a.length&&i<limit;i++)add(d,card(a[i]));}

  R.home=function(){
    title('XVideos');var d=[],ready=C.accountReady(),page=C.pageNo(),mode=getMyVar('xv_home_mode4',ready?'home':'best');
    if(page===1){
      add(d,{title:'',desc:'',pic_url:A+'banner.svg',col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}});
      icon(d,'搜索','独立搜索中心','search',C.page('xvideosSearch'));icon(d,'分类','热门 + A-Z','categories',C.page('xvideosCategories'));icon(d,'演员','创作者目录','creators',C.page('xvideosCreators',{kind:'pornstars'}));icon(d,'频道','Channels','channels',C.page('xvideosCreators',{kind:'channels'}));
      icon(d,'喜欢','站内私有列表','favorite',ready?C.page('xvideosAccountList',{kind:'liked',n:'喜欢的视频'}):C.page('xvideosLogin'));icon(d,'稍后看','Watch Later','watchlater',ready?C.page('xvideosAccountList',{kind:'watchlater',n:'稍后观看'}):C.page('xvideosLogin'));icon(d,'观看历史','站内 History','history',ready?C.page('xvideosAccountList',{kind:'history',n:'观看历史'}):C.page('xvideosLogin'));icon(d,ready?'我的':'登录','X5 官方会话','account',ready?C.page('xvideosAccount'):C.page('xvideosLogin'));
      if(ready)btn(d,'推荐',$('#noLoading#').lazyRule(function(){putMyVar('xv_home_mode4','home');refreshPage(false);return'hiker://empty';}),mode==='home');
      btn(d,'最佳',$('#noLoading#').lazyRule(function(){putMyVar('xv_home_mode4','best');refreshPage(false);return'hiker://empty';}),mode==='best');btn(d,'最新',$('#noLoading#').lazyRule(function(){putMyVar('xv_home_mode4','new');refreshPage(false);return'hiker://empty';}),mode==='new');btn(d,'高分',$('#noLoading#').lazyRule(function(){putMyVar('xv_home_mode4','rated');refreshPage(false);return'hiker://empty';}),mode==='rated');btn(d,'最多观看',$('#noLoading#').lazyRule(function(){putMyVar('xv_home_mode4','views');refreshPage(false);return'hiker://empty';}),mode==='views');
      section(d,ready?'视频流 · 当前 X5 会话':'视频流',ready?'推荐/私有页面按当前会话隔离缓存':'公开内容');
    }
    var r=C.homeVideos(mode,page);videos(d,r.cards,28);if(!r.cards.length&&page===1)empty(d,'首页暂未解析到视频','可切换排序或打开官网检查当前页面。',r.url);
    if(page===1){divider(d);section(d,'更多','本机工具与设置');icon(d,'本地收藏','本机独立','localfav',C.page('xvideosLocalFavorites'));icon(d,'本地足迹','浏览记录','localhistory',C.page('xvideosLocalHistory'));icon(d,'用户','Profiles','profiles',C.page('xvideosCreators',{kind:'profiles'}));icon(d,'设置','账号 / 域名 / 更新','settings',C.page('xvideosSettings'));}
    setResult(d);
  };

  R.login=function(){
    title('登录 XVideos');var d=[],ready=C.accountReady();section(d,'官方账号会话','网页登录与原生请求统一使用海阔 X5 Cookie 容器；不保存密码。');
    action(d,'① 打开 XVideos 官网登录','在 X5 页面完成官网登录','account','x5://'+C.base()+'/');
    action(d,'② 同步当前 X5 会话','登录完成后返回这里点击','refresh',$(C.base()).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);XVideosBoot.loadOnly();var r=XVideosCore.syncWebCookie();refreshPage(false);return'toast://'+r.message;},C.bootstrap));
    section(d,'当前状态',ready?('已连接'+(C.accountName()?' · '+C.accountName():'')+' · '+C.authFingerprint()):'未同步');
    if(ready)action(d,'进入我的账号','核对喜欢 / 稍后看 / 历史是否与官网一致','account',C.page('xvideosAccount'));
    setResult(d);
  };

  R.account=function(){
    title('我的 XVideos');var d=[],ready=C.accountReady();section(d,ready?'账号会话已连接':'未登录',ready?((C.accountName()||'当前 X5 会话')+' · '+C.authFingerprint()):'请先从登录页同步官方 Cookie');
    if(!ready){action(d,'去登录','使用 X5 官方登录','account',C.page('xvideosLogin'));setResult(d);return;}
    icon(d,'推荐','账号 Cookie 首页','best',C.page('xvideosAccountList',{kind:'home',n:'账号首页'}));icon(d,'喜欢','Videos I Like','favorite',C.page('xvideosAccountList',{kind:'liked',n:'喜欢的视频'}));icon(d,'稍后看','Watch Later','watchlater',C.page('xvideosAccountList',{kind:'watchlater',n:'稍后观看'}));icon(d,'历史','History','history',C.page('xvideosAccountList',{kind:'history',n:'观看历史'}));
    action(d,'重新同步当前 X5 会话','切换官网账号后必须重新同步','refresh',$(C.base()).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);XVideosBoot.loadOnly();var r=XVideosCore.syncWebCookie();refreshPage(false);return'toast://'+r.message;},C.bootstrap));
    action(d,'清除小程序账号会话','仅清本程序保存状态，不删除官网浏览器 Cookie','account',$(C.base()).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);XVideosBoot.loadOnly();XVideosCore.logoutLocal();refreshPage(false);return'toast://已清除小程序账号会话';},C.bootstrap));
    setResult(d);
  };

  R.accountList=function(){
    var kind=C.param('kind','history'),n=C.param('n','账号视频'),page=C.pageNo();title(n);var d=[];
    if(!C.accountReady()){empty(d,'需要登录','请先同步 XVideos 官方 X5 Cookie。',C.base()+'/');setResult(d);return;}
    if(page===1)section(d,n,(C.accountName()?C.accountName()+' · ':'')+'会话 '+C.authFingerprint());
    var r=kind==='home'?C.homeVideos('home',page):C.accountVideos(kind,page);videos(d,r.cards);
    if(!r.cards.length&&page===1)empty(d,'该账号列表暂未解析到视频',r.error||'请先到官网核对当前账号与列表内容，再重新同步会话。',r.url);
    setResult(d);
  };

  function localList(key,name,none){title(name);var d=[],a=C.readList(key);if(a.length){for(var i=0;i<a.length;i++)add(d,card(a[i]));divider(d);action(d,'清空'+name,'只删除本机记录','history',$(key).lazyRule(function(boot,k){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);XVideosBoot.loadOnly();XVideosCore.writeList(k,[]);refreshPage(false);return'toast://已清空';},C.bootstrap,key));}else section(d,none,'暂无记录');setResult(d);}
  R.localFavorites=function(){localList(C.favoriteKey,'本地收藏','暂无本地收藏');};
  R.localHistory=function(){localList(C.historyKey,'本地足迹','暂无浏览足迹');};

  R.settings=function(){
    title('XVideos 设置');var d=[];section(d,'运行信息',R.version+' · Build '+R.build+' · Test');section(d,'账号隔离',C.accountReady()?('当前会话 '+C.authFingerprint()+'；私有缓存已按会话隔离'):'未启用账号会话');
    add(d,{title:'当前站点域名',desc:C.base(),col_type:'text_1',url:'input://'+JSON.stringify({value:C.base(),hint:'https://www.xvideos.com',js:"var v=String(input||'').trim().replace(/\\/+$/,'');if(!/^https?:\\/\\//i.test(v))return 'toast://请输入完整 http(s) 地址';setItem('"+C.baseKey+"',v);refreshPage(false);return 'toast://已保存域名';"}),extra:{lineVisible:false}});
    action(d,'清理页面缓存','不清账号 Cookie / 本地收藏 / 本地足迹','refresh',$(C.base()).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);XVideosBoot.loadOnly();XVideosCore.clearCache();return'toast://缓存已清理';},C.bootstrap));
    action(d,'检查远程更新','当前 Test 通道','settings',$(C.base()).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);return XVideosBoot.check();},C.bootstrap));
    action(d,'安装/切换更新','Remote Manager 预加载并验证 Release','settings',$(C.base()).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);return XVideosBoot.update();},C.bootstrap));
    action(d,'回退上一版','上一版为 Test3 / Build10103','history',$(C.base()).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);return XVideosBoot.rollback();},C.bootstrap));
    section(d,'Test4 实机重点','首页连续翻页；登录后“推荐”态；切换账号后喜欢/稍后看/历史是否与官网一致；评论正文；本地收藏/足迹清空；Test3 的搜索、分类、创作者、详情和最高画质不得回退。');setResult(d);
  };
})();
