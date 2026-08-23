/* Pornhub Remote UI Patch 0.1.0-test.5 */
(function(){
  if(typeof PornhubRemoteRuntime!=='object'||typeof PornhubCore!=='object')throw new Error('Pornhub Test5 runtime preflight failed');
  var R=PornhubRemoteRuntime,C=PornhubCore;
  var A='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/pornhub/assets/';
  R.version='0.1.0-test.5';R.build=10105;

  function add(d,x){d.push(x);}
  function title(t){try{setPageTitle(t);}catch(e){}}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  function icon(d,t,desc,ico,url){add(d,{title:t,desc:desc||'',pic_url:A+ico+'.svg',col_type:'icon_4',url:url,extra:{lineVisible:false}});}
  function action(d,t,ico,url){add(d,{title:t,pic_url:A+ico+'.svg',col_type:'icon_small_3',url:url,extra:{lineVisible:false}});}
  function videoCard(c){return{title:c.title||'Video',desc:c.desc||'',pic_url:c.img||'',url:C.page('pornhubDetail',{u:c.url}),col_type:'movie_2',extra:{id:'ph_video5_'+C.hash(c.url),lineVisible:false}};}
  function renderVideos(d,a,limit){limit=limit||a.length;for(var i=0;i<a.length&&i<limit;i++)add(d,videoCard(a[i]));}
  function creatorCard(p){return{title:p.title||C.profileSlugName(p.url)||'创作者',desc:p.type==='channel'?'频道':p.type==='model'?'Model':p.type==='pornstar'?'Pornstar':'创作者',pic_url:p.img||A+'account.svg',url:C.page('pornhubProfile',{u:p.url,n:p.title||'',im:p.rawImg||''}),col_type:'movie_2',extra:{lineVisible:false}};}
  function renderCreators(d,a,limit){limit=limit||a.length;for(var i=0;i<a.length&&i<limit;i++)add(d,creatorCard(a[i]));}
  function empty(d,t,desc,url){section(d,t,desc);if(url)add(d,{title:'在 Pornhub X5 中打开',desc:'使用官方网页查看',col_type:'text_1',url:'x5://'+url,extra:{lineVisible:false}});}
  function samePageTab(label,value,key,active){
    return{title:(active?'● ':'')+label,col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,value),extra:{lineVisible:false}};
  }

  R.home=function(){
    title('Pornhub');var d=[],b=C.base();
    add(d,{title:'Pornhub',desc:'原生浏览 · 多画质播放 · 账号会话',pic_url:A+'icon.svg',col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    icon(d,'搜索','独立搜索页','search',C.page('pornhubSearch'));
    icon(d,'分类','中文分类中心','categories',C.page('pornhubCategories'));
    icon(d,'创作者','Pornstars / Channels','creators',C.page('pornhubCreators'));
    icon(d,C.accountReady()?'我的':'登录','推荐 / 历史 / 订阅','account',C.accountReady()?C.page('pornhubAccount'):C.page('pornhubLogin'));
    add(d,{title:'推荐',col_type:'scroll_button',url:C.page('pornhubCatalog',{m:'home',n:'推荐'})});
    add(d,{title:'最新',col_type:'scroll_button',url:C.page('pornhubCatalog',{m:'recent',n:'最新'})});
    add(d,{title:'最多观看',col_type:'scroll_button',url:C.page('pornhubCatalog',{m:'viewed',n:'最多观看'})});
    add(d,{title:'最高评分',col_type:'scroll_button',url:C.page('pornhubCatalog',{m:'rated',n:'最高评分'})});
    var h=C.fetchText(b+'/video',{ttl:3*60*1000}),cards=C.parseVideoCards(h,b+'/video');
    section(d,'首页视频',cards.length?'公开内容 · '+cards.length+' 项':'当前网络未解析到公开列表');renderVideos(d,cards,18);
    if(!cards.length)add(d,{title:'打开原站首页',desc:b,col_type:'text_1',url:'x5://'+b+'/',extra:{lineVisible:false}});
    section(d,'更多','GIF / Shorts / 收藏 / 历史');
    icon(d,'GIF','站点 GIF','gifs',C.page('pornhubGifs'));
    icon(d,'Shorts','短视频','shorts',C.page('pornhubShorts'));
    icon(d,'本地收藏','影片 / 创作者 / 片单','favorite',C.page('pornhubLocalFavorites'));
    icon(d,'浏览历史','最近浏览','history',C.page('pornhubLocalHistory'));
    add(d,{title:'播放列表',desc:'公开 Playlists',col_type:'text_1',url:C.page('pornhubPlaylists'),extra:{lineVisible:false}});
    add(d,{title:'设置与诊断',desc:R.version+' · Build '+R.build,col_type:'text_1',url:C.page('pornhubSettings'),extra:{lineVisible:false}});
    setResult(d);
  };

  R.categories=function(){
    title('分类');var d=[],group=getMyVar('ph_categories_group5','straight'),hub=C.categoryHub(false),cards=[],all=[],i,x;
    add(d,samePageTab('异性恋','straight','ph_categories_group5',group==='straight'));
    add(d,samePageTab('男同','gay','ph_categories_group5',group==='gay'));
    add(d,samePageTab('女女','lesbian','ph_categories_group5',group==='lesbian'));
    for(i=0;i<hub.cards.length;i++)if(hub.cards[i].group===group)cards.push(hub.cards[i]);
    for(i=0;i<hub.all.length;i++)if(hub.all[i].group===group)all.push(hub.all[i]);
    section(d,'热门色情片类型',cards.length?'官方分类图 · '+Math.min(cards.length,10)+' 个热门分类':'当前页面未提取到热门分类图');
    for(i=0;i<cards.length&&i<10;i++){
      x=cards[i];
      var cu=x.url.replace(/^https?:\/\/[^\/]+/i,C.base());
      add(d,{title:x.name,desc:'',pic_url:x.img||'',col_type:'movie_2',url:C.page('pornhubCategory',{u:cu,n:x.name}),extra:{lineVisible:false}});
    }
    section(d,'所有色情片类型',all.length+' 个分类 · 标签已中文化');
    for(i=0;i<all.length;i++){x=all[i];add(d,{title:x.name,col_type:'flex_button',url:C.page('pornhubCategory',{u:x.url,n:x.name}),extra:{lineVisible:false}});}
    if(!all.length)empty(d,'分类暂不可用','结构化分类接口与网页分类都没有返回有效数据。',hub.url);
    setResult(d);
  };

  R.category=function(){
    var u=C.param('u',C.base()+'/video'),n=C.zhCategory(C.param('n','分类'),u),page=C.pageNo();u=C.queryPage(u,page);title(n);
    var d=[],h=C.fetchText(u,{ttl:4*60*1000}),cards=C.parseVideoCards(h,u);
    if(page===1)add(d,{title:'← 全部分类',col_type:'scroll_button',url:C.page('pornhubCategories'),extra:{lineVisible:false}});
    renderVideos(d,cards);
    if(!cards.length&&page===1)empty(d,'该分类暂无结果','当前页面未识别到视频卡片。',u);
    setResult(d);
  };

  R.searchPage=function(){
    title('搜索');var d=[],q=getMyVar('ph_search_q5',C.param('q','')||''),scope=getMyVar('ph_search_scope5','video'),
      o=getMyVar('ph_search_o5',''),p=getMyVar('ph_search_p5',''),dur=getMyVar('ph_search_d5','|'),dm=String(dur).split('|'),min=dm[0]||'',max=dm[1]||'',page=C.pageNo();
    add(d,{title:'搜索关键词',desc:q||'视频、演员、频道',pic_url:A+'search.svg',col_type:'input',
      url:"(function(){putMyVar('ph_search_q5',String(input||'').trim());refreshPage(false);return 'hiker://empty';})()",
      extra:{defaultValue:q,lineVisible:false}});
    add(d,samePageTab('视频','video','ph_search_scope5',scope==='video'));
    add(d,samePageTab('创作者','creator','ph_search_scope5',scope==='creator'));
    if(!q){section(d,'搜索 Pornhub','输入关键词后直接在当前搜索页显示结果，不再先弹出输入对话框。');setResult(d);return;}
    if(scope==='creator'){
      var cr=C.creatorList('pornstars',page,q);section(d,'创作者结果',cr.profiles.length?cr.profiles.length+' 位':'未找到创作者');renderCreators(d,cr.profiles);
      if(!cr.profiles.length&&page===1)empty(d,'没有匹配创作者','可以换姓名或频道关键词。',cr.url);setResult(d);return;
    }
    section(d,'排序','');var sorts=[['相关',''],['最新','mr'],['最多观看','mv'],['最高评分','tr']],i,x;
    for(i=0;i<sorts.length;i++){x=sorts[i];add(d,samePageTab(x[0],x[1],'ph_search_o5',o===x[1]));}
    section(d,'制作类型','');var prods=[['全部',''],['专业','professional'],['自制','homemade']];
    for(i=0;i<prods.length;i++){x=prods[i];add(d,samePageTab(x[0],x[1],'ph_search_p5',p===x[1]));}
    section(d,'时长','');var ds=[['全部','|'],['<10分钟','|10'],['10–20','10|20'],['20–30','20|30'],['30+','30|']];
    for(i=0;i<ds.length;i++){x=ds[i];add(d,samePageTab(x[0],x[1],'ph_search_d5',dur===x[1]));}
    var r=C.searchVideos(q,page,{o:o,p:p,min:min,max:max});section(d,'视频结果',r.cards.length?r.cards.length+' 项 · '+r.route:'没有结果');renderVideos(d,r.cards);
    if(!r.cards.length&&page===1)empty(d,'没有匹配视频','可换关键词或减少筛选条件。',r.url);
    setResult(d);
  };

  R.detail=function(){
    var u=C.param('u',''),d=[];if(!u){empty(d,'缺少视频地址','请从列表重新进入。');setResult(d);return;}
    var h=C.accountReady()?C.fetchAuthPage(u,{ttl:2*60*1000}):C.fetchText(u,{force:false,ttl:2*60*1000,timeout:10000});
    if(C.isBad(h)){title('视频详情');empty(d,'详情加载失败','原站返回验证页、空页面或网络异常。',u);setResult(d);return;}
    var x=C.detail(h,u),local=C.isFav(u),online=C.onlineVideoFavoriteState(h),cc=C.commentCount(h);title(x.title);
    C.addHistory({url:u,title:x.title,img:C.image(x.cover,u),rawImg:x.cover,desc:[x.duration,x.views?x.views+' views':''].filter(function(v){return!!v;}).join(' · ')});
    add(d,{title:x.title,desc:[x.duration,x.views?x.views+' views':'',x.date].filter(function(v){return!!v;}).join(' · '),pic_url:C.image(x.cover,u),url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    add(d,{title:'▶ 立即播放',desc:x.sources.length?(x.sources.length+' 个 HLS 画质 · 点击直接播放'):'点击后解析媒体',col_type:'text_1',
      url:$(u).lazyRule(function(boot,target){require(boot,{headers:{'Cache-Control':'no-cache'}},10105);PornhubBoot.loadOnly();return PornhubCore.resolvePlay(target);},C.bootstrap,u),
      extra:{id:'ph_play5_'+C.hash(u),lineVisible:false}});
    action(d,'评论'+(cc?' '+cc:''),'comment',C.page('pornhubComments',{u:u,n:x.title}));
    action(d,local?'取消本地收藏':'本地收藏','local',$(u).lazyRule(function(boot,target,tt,cv,ds){
      require(boot,{headers:{'Cache-Control':'no-cache'}},10105);PornhubBoot.loadOnly();
      var on=PornhubCore.toggleFav({url:target,title:tt,rawImg:cv,img:PornhubCore.image(cv,target),desc:ds});refreshPage(false);
      return'toast://'+(on?'已加入本地收藏':'已取消本地收藏');
    },C.bootstrap,u,x.title,x.cover,[x.duration,x.views].filter(function(v){return!!v;}).join(' · ')));
    action(d,online?'取消在线收藏':'在线收藏','favorite',$(u).lazyRule(function(boot,target){
      require(boot,{headers:{'Cache-Control':'no-cache'}},10105);PornhubBoot.loadOnly();var r=PornhubCore.toggleOnlineVideoFavorite(target);refreshPage(false);return'toast://'+r.message;
    },C.bootstrap,u));
    if(x.author){
      section(d,'创作者','');
      var ap=x.author.img||C.image(C.creatorAvatar(x.author.url,''),x.author.url)||A+'account.svg';
      add(d,{title:x.author.name,desc:x.author.type==='channel'?'频道':x.author.type==='pornstar'?'Pornstar':x.author.type==='model'?'Model':'创作者',
        pic_url:ap,col_type:'avatar',url:C.page('pornhubProfile',{u:x.author.url,n:x.author.name||'',im:x.author.rawImg||''}),extra:{lineVisible:false}});
    }
    if(x.desc){section(d,'简介','');add(d,{title:x.desc,col_type:'rich_text',url:'hiker://empty',extra:{lineVisible:false}});}
    if(x.categories.length){section(d,'分类','');for(var i=0;i<x.categories.length;i++)add(d,{title:x.categories[i].name,col_type:'scroll_button',url:C.page('pornhubCategory',{u:x.categories[i].url,n:x.categories[i].name})});}
    if(x.tags.length){section(d,'标签','');for(var j=0;j<x.tags.length;j++)add(d,{title:x.tags[j].name,col_type:'flex_button',url:C.page('pornhubCategory',{u:x.tags[j].url,n:x.tags[j].name})});}
    if(x.related.length){section(d,'相关推荐','');renderVideos(d,x.related,16);}
    setResult(d);
  };

  R.comments=function(){
    var u=C.param('u',''),n=C.param('n','视频'),d=[];title('评论');if(!u){empty(d,'缺少视频地址','');setResult(d);return;}
    var r=C.comments(u),a=r.comments;section(d,n,a.length?(a.length+' 条评论'+(r.count?' · 页面计数 '+r.count:'')):'当前页面还没有解析到结构化评论');
    for(var i=0;i<a.length;i++){
      add(d,{title:a[i].author||'用户',desc:[a[i].time,a[i].likes?('👍 '+a[i].likes):''].filter(function(v){return!!v;}).join(' · '),
        pic_url:a[i].img||A+'account.svg',col_type:'avatar',url:'hiker://empty',extra:{lineVisible:false}});
      add(d,{title:a[i].message,col_type:'rich_text',url:'hiker://empty',extra:{lineVisible:false,textSize:16}});
    }
    if(!a.length)empty(d,'评论可能由异步接口加载','Test5 已尝试页面内 comment/AJAX 地址；若这里仍为空，保留官方 X5 评论区作为兜底。',u+'#cmtWrapper');
    setResult(d);
  };

  R.profile=(function(old){
    return function(){
      var u=C.param('u',''),seed=C.param('n',''),seedImg=C.param('im',''),d=[];if(!u){empty(d,'缺少创作者地址','请重新进入。');setResult(d);return;}
      var x=C.profile(u),name=x.name;if(!name||/^(creator|profile)$/i.test(name))name=seed||C.profileSlugName(u)||'创作者';
      var pic=x.img||(seedImg?C.image(seedImg,u):'')||A+'account.svg',local=C.isEntityFav(C.profileFavoriteKey,u);title(name);
      add(d,{title:name,desc:x.desc||'',pic_url:pic,col_type:'avatar',url:'hiker://empty',extra:{lineVisible:false}});
      action(d,'在线订阅','subscribe',$(u).lazyRule(function(boot,target){require(boot,{headers:{'Cache-Control':'no-cache'}},10105);PornhubBoot.loadOnly();var r=PornhubCore.toggleCreatorSubscription(target);if(r.web)return'x5://'+target;refreshPage(false);return'toast://'+r.message;},C.bootstrap,u));
      action(d,local?'取消本地收藏':'本地收藏','local',$(u).lazyRule(function(boot,target,n,im,desc){require(boot,{headers:{'Cache-Control':'no-cache'}},10105);PornhubBoot.loadOnly();var on=PornhubCore.toggleEntityFav(PornhubCore.profileFavoriteKey,{url:target,title:n,rawImg:im,img:PornhubCore.image(im,target),desc:desc});refreshPage(false);return'toast://'+(on?'已收藏创作者到本机':'已取消本地创作者收藏');},C.bootstrap,u,name,x.rawImg||seedImg,'创作者'));
      action(d,'官方主页','home','x5://'+u);
      section(d,'公开视频',x.videos.length?x.videos.length+' 项':'当前页未解析到视频');renderVideos(d,x.videos);
      if(!x.videos.length)empty(d,'暂无可展示视频','可在官方主页检查其他视频标签。',u);
      setResult(d);
    };
  })(R.profile);

  // Test1 的 module() 返回固定白名单，Test4 新增 comments/playlistDetail 因此没有被导出。
  // 从 Test5 起直接返回运行时对象本身，后续 Patch 新增页面方法无需再重复维护导出快照。
  R.module=function(){return R;};
})();