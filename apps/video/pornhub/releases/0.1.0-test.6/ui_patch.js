/* Pornhub Remote UI Patch 0.1.0-test.6 */
(function(){
  if(typeof PornhubRemoteRuntime!=='object'||typeof PornhubCore!=='object')throw new Error('Pornhub Test6 runtime preflight failed');
  var R=PornhubRemoteRuntime,C=PornhubCore;
  var A='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/pornhub/assets/';
  R.version='0.1.0-test.6';R.build=10106;

  function add(d,x){d.push(x);}
  function title(t){try{setPageTitle(t);}catch(e){}}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  function icon(d,t,desc,ico,url){add(d,{title:t,desc:desc||'',pic_url:A+ico+'.svg',col_type:'icon_4',url:url,extra:{lineVisible:false}});}
  function action(d,t,ico,url){add(d,{title:t,pic_url:A+ico+'.svg',col_type:'icon_small_3',url:url,extra:{lineVisible:false}});}
  function chip(d,t,url){add(d,{title:t,col_type:'flex_button',url:url,extra:{lineVisible:false}});}
  function tab(label,value,key,active){
    return{title:(active?'● ':'')+label,col_type:'flex_button',
      url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,value),
      extra:{lineVisible:false}};
  }
  function empty(d,t,desc,url){section(d,t,desc);if(url)add(d,{title:'在 Pornhub X5 中打开',desc:'使用官方网页查看',col_type:'text_1',url:'x5://'+url,extra:{lineVisible:false}});}
  function videoCard(c){return{title:C.decode(c.title||'Video'),desc:c.desc||'',pic_url:c.img||'',url:C.page('pornhubDetail',{u:c.url}),col_type:'movie_2',extra:{id:'ph_video6_'+C.hash(c.url),lineVisible:false}};}
  function renderVideos(d,a,limit){limit=limit||a.length;for(var i=0;i<a.length&&i<limit;i++)add(d,videoCard(a[i]));}
  function creatorCard(p){return{title:C.decode(p.title||C.profileSlugName(p.url)||'创作者'),desc:p.type==='channel'?'频道':p.type==='model'?'Model':p.type==='pornstar'?'Pornstar':'创作者',pic_url:p.img||A+'account.svg',url:C.page('pornhubProfile',{u:p.url,n:p.title||'',im:p.rawImg||''}),col_type:'movie_2',extra:{lineVisible:false}};}
  function renderCreators(d,a,limit){limit=limit||a.length;for(var i=0;i<a.length&&i<limit;i++)add(d,creatorCard(a[i]));}
  function accountListUrl(kind,name){
    if(!C.accountReady())return C.page('pornhubLogin');
    if((kind==='history'||kind==='favorites')&&!C.accountIdentityReady())return C.page('pornhubAccount');
    return C.page('pornhubAccountList',{kind:kind,n:name});
  }

  R.home=function(){
    title('Pornhub');var d=[],ready=C.accountReady(),identity=C.accountIdentityReady&&C.accountIdentityReady(),name=C.accountName(),mode=getMyVar('ph_home_feed6',ready?'recommended':'recent');
    if(!ready&&(mode==='recommended'||mode==='feed'))mode='recent';
    add(d,{title:'Pornhub'+(name?' · '+name:''),desc:ready?'账号推荐已启用 · 多画质播放':'公开浏览 · 登录后首页自动使用账号推荐',pic_url:A+'icon.svg',col_type:'avatar',url:ready?C.page('pornhubAccount'):C.page('pornhubLogin'),extra:{lineVisible:false}});

    icon(d,'站内收藏',identity?'账号收藏':'需账号','favorite',accountListUrl('favorites','站内收藏'));
    icon(d,'观看历史',identity?'账号历史':'需账号','history',accountListUrl('history','观看历史'));
    var lv=C.readList(C.favoriteKey).length+(C.profileFavoriteKey?C.readList(C.profileFavoriteKey).length:0)+(C.playlistFavoriteKey?C.readList(C.playlistFavoriteKey).length:0);
    icon(d,'本地收藏',lv+' 项','local',C.page('pornhubLocalFavorites'));
    icon(d,'本地足迹',C.readList(C.historyKey).length+' 项','history',C.page('pornhubLocalHistory'));

    chip(d,'搜索',C.page('pornhubSearch'));
    chip(d,'分类',C.page('pornhubCategories'));
    chip(d,'创作者',C.page('pornhubCreators'));
    chip(d,'订阅',ready?C.page('pornhubSubscriptions'):C.page('pornhubLogin'));
    chip(d,'片单',C.page('pornhubPlaylists'));
    chip(d,'Shorts',C.page('pornhubShorts'));
    chip(d,'GIF',C.page('pornhubGifs'));
    chip(d,'我的',ready?C.page('pornhubAccount'):C.page('pornhubLogin'));

    add(d,tab('为你推荐','recommended','ph_home_feed6',mode==='recommended'));
    add(d,tab('Feed','feed','ph_home_feed6',mode==='feed'));
    add(d,tab('最新','recent','ph_home_feed6',mode==='recent'));
    add(d,tab('热门','viewed','ph_home_feed6',mode==='viewed'));
    add(d,tab('高分','rated','ph_home_feed6',mode==='rated'));

    var r=C.homeFeed(mode,1),desc='';
    if(r.source==='account')desc='账号内容 · '+r.cards.length+' 项';
    else if(r.source==='fallback')desc='账号推荐暂未解析，已回退公开内容 · '+r.cards.length+' 项';
    else desc='公开内容 · '+r.cards.length+' 项';
    section(d,r.name||'视频',desc);
    renderVideos(d,r.cards,24);
    if(!r.cards.length)empty(d,'当前没有可展示内容','可切换最新/热门，或在 X5 检查账号和网络状态。',r.url||C.base()+'/video');
    setResult(d);
  };

  R.account=function(){
    title('我的账号');var d=[],ready=C.accountReady(),name=C.accountName(),identity=C.accountIdentityReady&&C.accountIdentityReady();
    if(!ready){empty(d,'尚未登录','使用 X5 官方登录后同步会话。');chip(d,'前往登录',C.page('pornhubLogin'));setResult(d);return;}
    var av=C.accountAvatar?C.accountAvatar():'',ref=name?C.base()+'/users/'+C.q(name):C.base()+'/user/security';
    add(d,{title:name||'Pornhub X5 会话',desc:identity?'账号会话已连接':'已登录 · 主页用户名待确认',pic_url:av?C.image(av,ref):A+'account.svg',col_type:'avatar',url:'x5://'+C.base()+'/user/security',extra:{lineVisible:false}});

    chip(d,'为你推荐',C.page('pornhubAccountList',{kind:'recommended',n:'为你推荐'}));
    chip(d,'Feed',C.page('pornhubAccountList',{kind:'feed',n:'Feed'}));
    chip(d,'观看历史',accountListUrl('history','观看历史'));
    chip(d,'站内收藏',accountListUrl('favorites','站内收藏'));
    chip(d,'订阅创作者',identity?C.page('pornhubSubscriptions'):C.page('pornhubAccount'));

    section(d,'账号工具',identity?'当前绑定：'+name:'历史 / 收藏 / 订阅需要确认账号主页用户名');
    action(d,'官方账号','account','x5://'+C.base()+'/user/security');
    action(d,'重新同步','feed',C.page('pornhubLogin'));
    action(d,'退出会话','local',$(C.authEnabledKey).lazyRule(function(boot){
      require(boot,{headers:{'Cache-Control':'no-cache'}},10106);PornhubBoot.loadOnly();
      PornhubCore.logoutLocal();if(PornhubCore.authSessionKey)setItem(PornhubCore.authSessionKey,'');refreshPage(false);return'toast://已退出本小程序账号会话';
    },C.bootstrap));
    if(!identity){
      add(d,{title:'绑定账号主页用户名',desc:'只用于需要 /users/<name> 的账号页面，不保存密码',col_type:'input',
        url:"(function(){var n=String(input||'').trim();require('"+C.bootstrap+"',{headers:{'Cache-Control':'no-cache'}},10106);PornhubBoot.loadOnly();var v=PornhubCore.setAccountName(n);refreshPage(false);return v?'toast://已绑定：'+v:'toast://用户名格式无效';})()",
        extra:{defaultValue:name||'',lineVisible:false}});
    }
    setResult(d);
  };

  R.categories=function(){
    title('分类');var d=[],group=getMyVar('ph_categories_group5','straight'),hub=C.categoryHub(false),cards=[],all=[],i,x;
    add(d,tab('异性恋','straight','ph_categories_group5',group==='straight'));
    add(d,tab('男同','gay','ph_categories_group5',group==='gay'));
    add(d,tab('女女','lesbian','ph_categories_group5',group==='lesbian'));
    for(i=0;i<hub.cards.length;i++)if(hub.cards[i].group===group)cards.push(hub.cards[i]);
    for(i=0;i<hub.all.length;i++)if(hub.all[i].group===group)all.push(hub.all[i]);
    section(d,'热门分类',cards.length?Math.min(cards.length,10)+' 个':'当前页面未提取到热门分类图');
    for(i=0;i<cards.length&&i<10;i++){
      x=cards[i];
      var cu=x.url.replace(/^https?:\/\/[^\/]+/i,C.base());
      add(d,{title:C.cleanCategoryLabel(x.name),desc:'',pic_url:x.img||'',col_type:'movie_2',url:C.page('pornhubCategory',{u:cu,n:C.cleanCategoryLabel(x.name)}),extra:{lineVisible:false}});
    }
    section(d,'全部分类','共 '+all.length+' 个');
    for(i=0;i<all.length;i++){x=all[i];add(d,{title:C.cleanCategoryLabel(x.name),col_type:'flex_button',url:C.page('pornhubCategory',{u:x.url,n:C.cleanCategoryLabel(x.name)}),extra:{lineVisible:false}});}
    if(!all.length)empty(d,'分类暂不可用','当前分类接口没有返回有效数据。',hub.url);
    setResult(d);
  };

  R.searchPage=function(){
    title('搜索');var d=[],q=getMyVar('ph_search_q5',C.param('q','')||''),scope=getMyVar('ph_search_scope5','video'),
      o=getMyVar('ph_search_o5',''),p=getMyVar('ph_search_p5',''),dur=getMyVar('ph_search_d5','|'),dm=String(dur).split('|'),min=dm[0]||'',max=dm[1]||'',page=C.pageNo();
    add(d,{title:'搜索关键词',desc:q||'视频、演员、频道',pic_url:A+'search.svg',col_type:'input',
      url:"(function(){putMyVar('ph_search_q5',String(input||'').trim());refreshPage(false);return 'hiker://empty';})()",
      extra:{defaultValue:q,lineVisible:false}});
    add(d,tab('视频','video','ph_search_scope5',scope==='video'));add(d,tab('创作者','creator','ph_search_scope5',scope==='creator'));
    if(!q){section(d,'搜索 Pornhub','输入关键词后直接在本页显示结果。');setResult(d);return;}
    if(scope==='creator'){
      var ck=getMyVar('ph_search_creator_kind6','pornstars'),ct=[['演员','pornstars'],['频道','channels'],['模特','models'],['用户','users']],ci,cx;
      for(ci=0;ci<ct.length;ci++){cx=ct[ci];add(d,tab(cx[0],cx[1],'ph_search_creator_kind6',ck===cx[1]));}
      var cr=C.creatorList(ck,page,q),cl=ck==='pornstars'?'演员':ck==='channels'?'频道':ck==='models'?'模特':'用户';
      section(d,cl+'结果',cr.profiles.length?'找到 '+cr.profiles.length+' 位':'未找到'+cl);renderCreators(d,cr.profiles);
      if(!cr.profiles.length&&page===1)empty(d,'没有匹配'+cl,'可以换关键词或切换创作者类型。',cr.url);setResult(d);return;
    }
    section(d,'排序','');var sorts=[['相关',''],['最新','mr'],['最多观看','mv'],['最高评分','tr']],i,x;
    for(i=0;i<sorts.length;i++){x=sorts[i];add(d,tab(x[0],x[1],'ph_search_o5',o===x[1]));}
    section(d,'制作类型','');var prods=[['全部',''],['专业','professional'],['自制','homemade']];
    for(i=0;i<prods.length;i++){x=prods[i];add(d,tab(x[0],x[1],'ph_search_p5',p===x[1]));}
    section(d,'时长','');var ds=[['全部','|'],['<10分钟','|10'],['10–20','10|20'],['20–30','20|30'],['30+','30|']];
    for(i=0;i<ds.length;i++){x=ds[i];add(d,tab(x[0],x[1],'ph_search_d5',dur===x[1]));}
    var r=C.searchVideos(q,page,{o:o,p:p,min:min,max:max});section(d,'视频结果',r.cards.length?'找到 '+r.cards.length+' 个':'没有结果');renderVideos(d,r.cards);
    if(!r.cards.length&&page===1)empty(d,'没有匹配视频','可换关键词或减少筛选条件。',r.url);
    setResult(d);
  };

  R.detail=(function(old){
    return function(){
      var u=C.param('u',''),d=[];if(!u){empty(d,'缺少视频地址','请从列表重新进入。');setResult(d);return;}
      var h=C.accountReady()?C.fetchAuthPage(u,{ttl:2*60*1000}):C.fetchText(u,{force:false,ttl:2*60*1000,timeout:10000});
      if(C.isBad(h)){title('视频详情');empty(d,'详情加载失败','原站返回验证页、空页面或网络异常。',u);setResult(d);return;}
      var x=C.detail(h,u),local=C.isFav(u),online=C.onlineVideoFavoriteState(h),cc=C.commentCount(h);x.title=C.decode(x.title);title(x.title);
      C.addHistory({url:u,title:x.title,img:C.image(x.cover,u),rawImg:x.cover,desc:[x.duration,x.views?x.views+' views':''].filter(function(v){return!!v;}).join(' · ')});
      add(d,{title:x.title,desc:[x.duration,x.views?x.views+' views':'',x.date].filter(function(v){return!!v;}).join(' · '),pic_url:C.image(x.cover,u),url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
      add(d,{title:'▶ 立即播放',desc:x.sources.length?(x.sources.length+' 个 HLS 画质 · 点击直接播放'):'点击后解析媒体',col_type:'text_1',
        url:$(u).lazyRule(function(boot,target){require(boot,{headers:{'Cache-Control':'no-cache'}},10106);PornhubBoot.loadOnly();return PornhubCore.resolvePlay(target);},C.bootstrap,u),
        extra:{id:'ph_play6_'+C.hash(u),lineVisible:false}});
      action(d,'评论'+(cc?' '+cc:''),'comment',C.page('pornhubComments',{u:u,n:x.title}));
      action(d,local?'取消本地收藏':'本地收藏','local',$(u).lazyRule(function(boot,target,tt,cv,ds){
        require(boot,{headers:{'Cache-Control':'no-cache'}},10106);PornhubBoot.loadOnly();
        var on=PornhubCore.toggleFav({url:target,title:tt,rawImg:cv,img:PornhubCore.image(cv,target),desc:ds});refreshPage(false);
        return'toast://'+(on?'已加入本地收藏':'已取消本地收藏');
      },C.bootstrap,u,x.title,x.cover,[x.duration,x.views].filter(function(v){return!!v;}).join(' · ')));
      action(d,online?'取消在线收藏':'在线收藏','favorite',$(u).lazyRule(function(boot,target){
        require(boot,{headers:{'Cache-Control':'no-cache'}},10106);PornhubBoot.loadOnly();var r=PornhubCore.toggleOnlineVideoFavorite(target);refreshPage(false);return'toast://'+r.message;
      },C.bootstrap,u));
      if(x.author){
        section(d,'创作者','');
        var ap=x.author.img||C.image(C.creatorAvatar(x.author.url,''),x.author.url)||A+'account.svg';
        add(d,{title:C.decode(x.author.name),desc:x.author.type==='channel'?'频道':x.author.type==='pornstar'?'Pornstar':x.author.type==='model'?'Model':'创作者',
          pic_url:ap,col_type:'avatar',url:C.page('pornhubProfile',{u:x.author.url,n:x.author.name||'',im:x.author.rawImg||''}),extra:{lineVisible:false}});
      }
      if(x.desc){section(d,'简介','');add(d,{title:C.decode(x.desc),col_type:'rich_text',url:'hiker://empty',extra:{lineVisible:false}});}
      if(x.categories.length){section(d,'分类','');for(var i=0;i<x.categories.length;i++)add(d,{title:C.cleanCategoryLabel(x.categories[i].name),col_type:'flex_button',url:C.page('pornhubCategory',{u:x.categories[i].url,n:C.cleanCategoryLabel(x.categories[i].name)}),extra:{lineVisible:false}});}
      if(x.tags.length){section(d,'标签','');for(var j=0;j<x.tags.length;j++)add(d,{title:C.cleanCategoryLabel(x.tags[j].name),col_type:'flex_button',url:C.page('pornhubCategory',{u:x.tags[j].url,n:C.cleanCategoryLabel(x.tags[j].name)}),extra:{lineVisible:false}});}
      if(x.related.length){section(d,'相关推荐','');renderVideos(d,x.related,16);}
      setResult(d);
    };
  })(R.detail);

  R.comments=function(){
    var u=C.param('u',''),n=C.decode(C.param('n','视频')),d=[];title('评论');if(!u){empty(d,'缺少视频地址','');setResult(d);return;}
    var r=C.comments(u),a=r.comments;section(d,'评论',a.length?(a.length+' 条 · '+n):n);
    for(var i=0;i<a.length;i++){
      add(d,{title:C.decode(a[i].author||'用户'),desc:[a[i].time,a[i].likes?('👍 '+a[i].likes):''].filter(function(v){return!!v;}).join(' · '),
        pic_url:a[i].img||A+'account.svg',col_type:'avatar',url:'hiker://empty',extra:{lineVisible:false}});
      add(d,{title:C.decode(a[i].message||''),col_type:'rich_text',url:'hiker://empty',extra:{lineVisible:false}});
    }
    if(!a.length)empty(d,'暂未读取到评论','可以在官方页面确认该视频是否有可见评论。',u+'#cmtWrapper');
    setResult(d);
  };

  R.shorts=function(){
    var page=C.pageNo(),d=[],r=C.shortList(page);title('Shorts');section(d,'Shorts',r.cards.length?(r.cards.length+' 个短视频'):'当前页没有解析到短视频');
    renderVideos(d,r.cards);
    if(!r.cards.length&&page===1)empty(d,'Shorts 暂不可用','已兼容 /short 与普通 view_video 卡片；若仍为空请继续用实机页面适配。',r.url);
    setResult(d);
  };

  R.localHistory=function(){
    title('本地足迹');var d=[],a=C.readList(C.historyKey);section(d,'最近浏览',a.length+' 项');renderVideos(d,a);
    if(!a.length)section(d,'暂无浏览记录','打开视频详情后会自动记录。');
    setResult(d);
  };

  R.module=function(){return R;};
})();