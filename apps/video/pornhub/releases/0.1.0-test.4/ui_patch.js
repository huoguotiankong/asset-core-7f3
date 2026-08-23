/* Pornhub Remote UI Patch 0.1.0-test.4 */
(function(){
  if(typeof PornhubRemoteRuntime!=='object'||typeof PornhubCore!=='object')throw new Error('Pornhub Test4 runtime preflight failed');
  var R=PornhubRemoteRuntime,C=PornhubCore;
  var A='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/pornhub/assets/';
  R.version='0.1.0-test.4';R.build=10104;
  function add(d,x){d.push(x);}
  function title(t){try{setPageTitle(t);}catch(e){}}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  function empty(d,t,desc,url){section(d,t,desc);if(url)add(d,{title:'在 Pornhub X5 中打开',desc:'使用与账号同步相同的 X5 Cookie 会话',col_type:'text_1',url:'x5://'+url,extra:{lineVisible:false}});}
  function profileTypeText(t){return t==='channel'?'频道':t==='pornstar'?'Pornstar':t==='model'?'Model':t==='user'?'用户':t||'创作者';}
  function videoCard(c){return{title:c.title||'Video',desc:c.desc||'',pic_url:c.img||'',url:C.page('pornhubDetail',{u:c.url}),col_type:'movie_2',extra:{id:'ph_video_'+C.hash(c.url),lineVisible:false}};}
  function renderVideos(d,a,limit){limit=limit||a.length;for(var i=0;i<a.length&&i<limit;i++)add(d,videoCard(a[i]));}
  function creatorCard(p){return{title:p.title||C.profileSlugName(p.url)||'创作者',desc:profileTypeText(p.type)+(p.desc&&p.desc!==p.type?' · '+String(p.desc).replace(/^\w+\s*·?\s*/,'' ):''),pic_url:p.img||'',url:C.page('pornhubProfile',{u:p.url,n:p.title||'',im:p.rawImg||''}),col_type:'movie_2',extra:{id:'ph_creator4_'+C.hash(p.url),lineVisible:false}};}
  function renderCreators(d,a){for(var i=0;i<a.length;i++)add(d,creatorCard(a[i]));}
  function samePageTab(label,value,key,active,clearKey){
    return{title:(active?'● ':'')+label,col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(k,v,ck){putMyVar(k,v);if(ck)putMyVar(ck,'');refreshPage(false);return'hiker://empty';},key,value,clearKey||''),extra:{lineVisible:false}};
  }
  function accountNameInput(desc){return{title:'绑定账号主页用户名',desc:desc||'只用于需要 /users/<name> 的历史、收藏与订阅页；不保存密码',col_type:'text_1',url:'input://'+JSON.stringify({value:C.accountName()||'',hint:'你自己的 Pornhub 用户名',js:"(function(){var n=String(input||'').trim();require('"+C.bootstrap+"',{headers:{'Cache-Control':'no-cache'}},10104);PornhubBoot.loadOnly();var v=PornhubCore.setAccountName(n);if(!v)return 'toast://用户名格式无效';refreshPage(false);return 'toast://账号主页用户名已绑定：'+v;})()"}),extra:{lineVisible:false}};}

  R.catalog=function(){
    var initMode=C.param('m','home'),initName=C.param('n','视频'),page=C.pageNo(),urlKey='ph_catalog_mode4_'+C.hash(String(typeof MY_URL==='undefined'?'catalog':MY_URL).replace(/&page=\d+/g,'')),mode=getMyVar(urlKey,initMode||'home'),names={home:'推荐',recent:'最新',viewed:'最多观看',rated:'最高评分'},d=[],b=C.base(),u=b+'/video';
    title(names[mode]||initName||'视频');
    add(d,samePageTab('推荐','home',urlKey,mode==='home',''));add(d,samePageTab('最新','recent',urlKey,mode==='recent',''));add(d,samePageTab('最多观看','viewed',urlKey,mode==='viewed',''));add(d,samePageTab('最高评分','rated',urlKey,mode==='rated',''));
    if(mode==='recent')u+='?o=mr';else if(mode==='viewed')u+='?o=mv';else if(mode==='rated')u+='?o=tr';u=C.queryPage(u,page);
    var h=C.fetchText(u,{ttl:3*60*1000}),cards=C.parseVideoCards(h,u);renderVideos(d,cards);if(!cards.length&&page===1)empty(d,'没有解析到视频','可能是区域访问、验证页或站点 DOM 变化。',u);setResult(d);
  };

  R.searchPage=function(){
    var baseId=C.hash(String(typeof MY_URL==='undefined'?'search':MY_URL).replace(/[&?](?:o|p|min|max)=[^&#]*/g,'')),kq='ph_search_q4_'+baseId,ko='ph_search_o4_'+baseId,kp='ph_search_p4_'+baseId,kd='ph_search_d4_'+baseId;
    var q=getMyVar(kq,C.param('q','')),o=getMyVar(ko,C.param('o','')),p=getMyVar(kp,C.param('p','')),dur=getMyVar(kd,(C.param('min','')+'|'+C.param('max',''))),dm=String(dur||'|').split('|'),min=dm[0]||'',max=dm[1]||'',page=C.pageNo(),d=[];title(q?'搜索 · '+q:'搜索');
    add(d,{title:'搜索关键词',desc:q||'点击输入',col_type:'input',url:$(q).lazyRule(function(key){putMyVar(key,String(input||'').trim());refreshPage(false);return'hiker://empty';},kq),extra:{defaultValue:q,lineVisible:false}});
    if(!q){section(d,'开始搜索','输入关键词后，排序 / 制作类型 / 时长都在当前页切换，不再反复压入新页面。');setResult(d);return;}
    section(d,'排序','');var sorts=[['相关',''],['最新','mr'],['最多观看','mv'],['最高评分','tr']],i,x;for(i=0;i<sorts.length;i++){x=sorts[i];add(d,samePageTab(x[0],x[1],ko,o===x[1],''));}
    section(d,'制作类型','');var prods=[['全部',''],['专业','professional'],['自制','homemade']];for(i=0;i<prods.length;i++){x=prods[i];add(d,samePageTab(x[0],x[1],kp,p===x[1],''));}
    section(d,'时长','');var ds=[['全部','|'],['<10分钟','|10'],['10–20','10|20'],['20–30','20|30'],['30+','30|']];for(i=0;i<ds.length;i++){x=ds[i];add(d,samePageTab(x[0],x[1],kd,dur===x[1],''));}
    var r=C.searchVideos(q,page,{o:o,p:p,min:min,max:max});section(d,'搜索结果',r.cards.length?r.cards.length+' 项 · '+r.route:'未识别到结果');renderVideos(d,r.cards);if(!r.cards.length&&page===1)empty(d,'没有匹配结果','可换关键词或在 X5 原站搜索。',r.url);setResult(d);
  };

  R.creators=function(){
    title('创作者');var d=[],kind=getMyVar('ph_creators_kind4',C.param('kind','pornstars')||'pornstars'),q=getMyVar('ph_creators_q4',C.param('q','')||''),page=C.pageNo();
    var tabs=[['pornstars','Pornstars'],['channels','频道'],['models','Models'],['users','用户']],i,t;
    for(i=0;i<tabs.length;i++){t=tabs[i];add(d,samePageTab(t[1],t[0],'ph_creators_kind4',kind===t[0],'ph_creators_q4'));}
    add(d,{title:'搜索创作者',desc:q||'输入名字',col_type:'input',url:"(function(){putMyVar('ph_creators_q4',String(input||'').trim());refreshPage(false);return 'hiker://empty';})()",extra:{defaultValue:q,lineVisible:false}});
    var r=C.creatorList(kind,page,q),label=kind==='pornstars'?'Pornstars':kind==='channels'?'频道':kind==='models'?'Models':'用户';
    section(d,q?'搜索 · '+q:'热门 '+label,r.profiles.length?r.profiles.length+' 位 · 切换分类不会再产生新页面':'当前页没有可靠创作者卡片');
    renderCreators(d,r.profiles);
    if(!r.profiles.length&&page===1)empty(d,'暂未识别到创作者','当前分类 DOM 可能变化；不会使用排名数字或默认头像伪造人物。',r.url);
    setResult(d);
  };

  R.profile=function(){
    var u=C.param('u',''),seed=C.param('n',''),seedImg=C.param('im',''),d=[];if(!u){empty(d,'缺少创作者地址','请重新进入。');setResult(d);return;}
    var x=C.profile(u),name=x.name;if(!name||/^(creator|profile)$/i.test(name))name=seed||C.profileSlugName(u)||'创作者';
    var pic=x.img||(seedImg?C.image(seedImg,u):''),local=C.isEntityFav(C.profileFavoriteKey,u);title(name);
    add(d,{title:name,desc:profileTypeText(C.profileType(u))+(x.desc?' · '+x.desc:''),pic_url:pic,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'在线订阅',col_type:'scroll_button',url:$(u).lazyRule(function(boot,target){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);PornhubBoot.loadOnly();var r=PornhubCore.toggleCreatorSubscription(target);if(r.web)return'x5://'+target;refreshPage(false);return'toast://'+r.message;},C.bootstrap,u)});
    add(d,{title:local?'取消本地收藏':'本地收藏',col_type:'scroll_button',url:$(u).lazyRule(function(boot,target,n,im,desc){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);PornhubBoot.loadOnly();var on=PornhubCore.toggleEntityFav(PornhubCore.profileFavoriteKey,{url:target,title:n,rawImg:im,img:PornhubCore.image(im,target),desc:desc});refreshPage(false);return'toast://'+(on?'已收藏创作者到本机':'已取消本地创作者收藏');},C.bootstrap,u,name,x.rawImg||seedImg,profileTypeText(C.profileType(u)))});
    add(d,{title:'官方主页',col_type:'scroll_button',url:'x5://'+u});
    section(d,'公开视频',x.videos.length?x.videos.length+' 项':'当前页未解析到视频');renderVideos(d,x.videos);
    if(!x.videos.length)empty(d,'暂无可展示视频','可在 X5 官方主页检查其他视频标签。',u);
    setResult(d);
  };

  R.detail=function(){
    var u=C.param('u',''),d=[];if(!u){empty(d,'缺少视频地址','请从列表重新进入。');setResult(d);return;}
    var h=C.accountReady()?C.fetchAuthPage(u,{ttl:2*60*1000}):C.fetchText(u,{force:false,ttl:2*60*1000,timeout:10000});
    if(C.isBad(h)){title('视频详情');empty(d,'详情加载失败','原站返回验证页、空页面或网络异常。',u);setResult(d);return;}
    var x=C.detail(h,u),local=C.isFav(u),online=C.onlineVideoFavoriteState(h),cc=C.commentCount(h);title(x.title);
    C.addHistory({url:u,title:x.title,img:C.image(x.cover,u),rawImg:x.cover,desc:[x.duration,x.views?x.views+' views':''].filter(function(v){return!!v;}).join(' · ')});
    add(d,{title:x.title,desc:[x.duration,x.views?x.views+' views':'',x.date].filter(function(v){return!!v;}).join(' · '),pic_url:C.image(x.cover,u),url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    add(d,{title:'▶ 立即播放',desc:x.sources.length?(x.sources.length+' 个 HLS 画质 · 点击直接交播放器'):'点击后解析媒体',col_type:'text_1',url:$(u).lazyRule(function(boot,target){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);PornhubBoot.loadOnly();return PornhubCore.resolvePlay(target);},C.bootstrap,u),extra:{id:'ph_play_'+C.hash(u),lineVisible:false}});
    add(d,{title:'评论'+(cc?' '+cc:''),col_type:'scroll_button',url:C.page('pornhubComments',{u:u,n:x.title})});
    add(d,{title:local?'取消本地收藏':'本地收藏',col_type:'scroll_button',url:$(u).lazyRule(function(boot,target,tt,cv,ds){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);PornhubBoot.loadOnly();var on=PornhubCore.toggleFav({url:target,title:tt,rawImg:cv,img:PornhubCore.image(cv,target),desc:ds});refreshPage(false);return'toast://'+(on?'已加入本地收藏':'已取消本地收藏');},C.bootstrap,u,x.title,x.cover,[x.duration,x.views].filter(function(v){return!!v;}).join(' · '))});
    add(d,{title:online?'取消在线收藏':'在线收藏',col_type:'scroll_button',url:$(u).lazyRule(function(boot,target){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);PornhubBoot.loadOnly();var r=PornhubCore.toggleOnlineVideoFavorite(target);if(!r.ok&&/X5|Cookie|账号/.test(r.message||''))return'toast://'+r.message;refreshPage(false);return'toast://'+r.message;},C.bootstrap,u)});
    if(x.author){section(d,'创作者','');add(d,{title:x.author.name,desc:profileTypeText(x.author.type),pic_url:x.author.img||'',col_type:'avatar',url:C.page('pornhubProfile',{u:x.author.url,n:x.author.name||'',im:x.author.rawImg||''}),extra:{lineVisible:false}});}
    if(x.desc){section(d,'简介','');add(d,{title:x.desc,col_type:'rich_text',url:'hiker://empty'});}
    if(x.categories.length){section(d,'分类','');for(var i=0;i<x.categories.length;i++)add(d,{title:x.categories[i].name,col_type:'scroll_button',url:C.page('pornhubCategory',{u:x.categories[i].url,n:x.categories[i].name})});}
    if(x.tags.length){section(d,'标签','');for(var j=0;j<x.tags.length;j++)add(d,{title:x.tags[j].name,col_type:'flex_button',url:C.page('pornhubCategory',{u:x.tags[j].url,n:x.tags[j].name})});}
    if(x.related.length){section(d,'相关推荐','');renderVideos(d,x.related,16);}
    setResult(d);
  };

  R.comments=function(){
    var u=C.param('u',''),n=C.param('n','评论'),d=[];title('评论 · '+n);if(!u){empty(d,'缺少视频地址','');setResult(d);return;}
    var r=C.comments(u),a=r.comments;section(d,'视频评论',a.length?(a.length+' 条已加载'+(r.count?' · 页面标记 '+r.count:'') ):'当前 HTML 没有解析到评论');
    for(var i=0;i<a.length;i++){
      add(d,{title:a[i].author||'用户',desc:[a[i].time,a[i].likes?('👍 '+a[i].likes):''].filter(function(v){return!!v;}).join(' · '),pic_url:a[i].img||'',col_type:'avatar',url:'hiker://empty',extra:{lineVisible:false}});
      add(d,{title:a[i].message,col_type:'rich_text',url:'hiker://empty',extra:{lineVisible:false}});
    }
    if(!a.length)empty(d,'评论可能由网页异步加载','先提供官方 X5 评论作为兜底；下一轮可根据这页实机结果继续补评论接口。',u+'#cmtWrapper');
    setResult(d);
  };

  R.playlists=function(){
    var page=C.pageNo(),d=[],r=C.playlistList(page);title('播放列表');section(d,'公开片单',r.cards.length?r.cards.length+' 个':'当前页未识别到片单');
    for(var i=0;i<r.cards.length;i++){var p=r.cards[i];add(d,{title:p.title,desc:p.desc||'Playlist',pic_url:p.img||'',col_type:'movie_2',url:C.page('pornhubPlaylistDetail',{u:p.url,n:p.title,im:p.rawImg||''}),extra:{lineVisible:false}});}
    if(!r.cards.length&&page===1)empty(d,'暂无可展示片单','可先从 Pornhub 官方片单页浏览。',r.url);setResult(d);
  };
  R.playlistDetail=function(){
    var u=C.param('u',''),seed=C.param('n',''),seedImg=C.param('im',''),d=[];if(!u){empty(d,'缺少片单地址','');setResult(d);return;}
    var x=C.playlistDetail(u),name=x.title||seed||'Playlist',pic=x.img||(seedImg?C.image(seedImg,u):''),local=C.isEntityFav(C.playlistFavoriteKey,u);title(name);
    add(d,{title:name,desc:x.desc||('共 '+x.videos.length+' 个已解析视频'),pic_url:pic,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'在线收藏/订阅',col_type:'scroll_button',url:$(u).lazyRule(function(boot,target){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);PornhubBoot.loadOnly();var r=PornhubCore.togglePlaylistOnline(target);if(r.web)return'x5://'+target;refreshPage(false);return'toast://'+r.message;},C.bootstrap,u)});
    add(d,{title:local?'取消本地收藏':'本地收藏',col_type:'scroll_button',url:$(u).lazyRule(function(boot,target,n,im,desc){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);PornhubBoot.loadOnly();var on=PornhubCore.toggleEntityFav(PornhubCore.playlistFavoriteKey,{url:target,title:n,rawImg:im,img:PornhubCore.image(im,target),desc:desc});refreshPage(false);return'toast://'+(on?'已收藏片单到本机':'已取消本地片单收藏');},C.bootstrap,u,name,x.rawImg||seedImg,x.desc||'Playlist')});
    add(d,{title:'官方片单页',col_type:'scroll_button',url:'x5://'+u});
    section(d,'片单视频',x.videos.length?x.videos.length+' 项':'当前页未解析到视频');renderVideos(d,x.videos);
    if(!x.videos.length)empty(d,'片单视频暂未识别','可打开官方片单页。',u);setResult(d);
  };

  R.localFavorites=function(){
    title('本地收藏');var d=[],kind=getMyVar('ph_local_fav_kind4','video'),tabs=[['video','影片'],['profile','创作者'],['playlist','片单']],i,t;
    for(i=0;i<tabs.length;i++){t=tabs[i];add(d,samePageTab(t[1],t[0],'ph_local_fav_kind4',kind===t[0],''));}
    if(kind==='video'){
      var v=C.readList(C.favoriteKey);section(d,'本地影片',v.length+' 项');renderVideos(d,v);if(!v.length)section(d,'暂无影片收藏','在视频详情页点击“本地收藏”。');
    }else if(kind==='profile'){
      var p=C.readList(C.profileFavoriteKey);section(d,'本地创作者',p.length+' 位');for(i=0;i<p.length;i++)add(d,{title:p[i].title,desc:p[i].desc||'创作者',pic_url:p[i].img||'',col_type:'movie_2',url:C.page('pornhubProfile',{u:p[i].url,n:p[i].title,im:p[i].rawImg||''}),extra:{lineVisible:false}});if(!p.length)section(d,'暂无创作者收藏','在创作者详情页点击“本地收藏”。');
    }else{
      var pl=C.readList(C.playlistFavoriteKey);section(d,'本地片单',pl.length+' 个');for(i=0;i<pl.length;i++)add(d,{title:pl[i].title,desc:pl[i].desc||'Playlist',pic_url:pl[i].img||'',col_type:'movie_2',url:C.page('pornhubPlaylistDetail',{u:pl[i].url,n:pl[i].title,im:pl[i].rawImg||''}),extra:{lineVisible:false}});if(!pl.length)section(d,'暂无片单收藏','在片单详情页点击“本地收藏”。');
    }
    setResult(d);
  };

  R.login=function(){
    title('Pornhub 登录');var d=[],ready=C.accountReady(),name=C.accountName();
    section(d,'X5 官方登录','Test4 统一使用海阔 X5 全屏登录。外部 web:// 与 getCookie 可能不是同一个 Cookie 容器，因此不再用于账号同步。');
    add(d,{title:'① X5 全屏打开 Pornhub 登录',desc:'在同一个 X5 Cookie 容器完成邮箱密码 / Google / X / 验证码',pic_url:A+'account.svg',col_type:'movie_1_left_pic',url:'x5://'+C.base()+'/login',extra:{lineVisible:false}});
    add(d,{title:'② 登录成功后返回本页',desc:'在 X5 网页右上角确认已经进入你自己的账号',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'③ 同步 X5 登录会话',desc:ready?'重新读取当前 X5 Cookie 并刷新账号会话':'读取 X5 Cookie → /user/security 验证 → 保存到小程序',col_type:'text_1',url:$(C.base()).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);PornhubBoot.loadOnly();var r=PornhubCore.syncWebCookie();refreshPage(false);return'toast://'+r.message;},C.bootstrap),extra:{lineVisible:false,id:'ph_login_sync4'}});
    if(ready){section(d,'当前状态',name?('已绑定账号主页：'+name):'X5 会话已启用 · 用户名未绑定');add(d,{title:'进入我的账号',desc:'账号列表请求将使用当前 X5 Cookie，不再使用旧 Cookie 缓存',col_type:'text_1',url:C.page('pornhubAccount'),extra:{lineVisible:false}});add(d,accountNameInput('历史 / 收藏 / 订阅路径需要账号主页用户名；若自动识别不准请填你自己的'));}
    setResult(d);
  };

  R.account=function(){
    title('我的账号');var d=[],ready=C.accountReady(),name=C.accountName();if(!ready){empty(d,'尚未同步 X5 登录','请先使用小程序里的 X5 官方登录。');add(d,{title:'前往登录',col_type:'text_1',url:C.page('pornhubLogin'),extra:{lineVisible:false}});setResult(d);return;}
    add(d,{title:'Pornhub X5 会话',desc:name?('账号主页绑定：'+name):'已登录 · 用户名待绑定',pic_url:A+'account.svg',col_type:'movie_1_left_pic',url:'x5://'+C.base()+'/user/security',extra:{lineVisible:false}});
    add(d,{title:'为你推荐',col_type:'scroll_button',url:C.page('pornhubAccountList',{kind:'recommended',n:'为你推荐'})});
    add(d,{title:'Feed',col_type:'scroll_button',url:C.page('pornhubAccountList',{kind:'feed',n:'Feed'})});
    if(name){add(d,{title:'观看历史',col_type:'scroll_button',url:C.page('pornhubAccountList',{kind:'history',n:'观看历史'})});add(d,{title:'站内收藏',col_type:'scroll_button',url:C.page('pornhubAccountList',{kind:'favorites',n:'站内收藏'})});add(d,{title:'订阅创作者',col_type:'scroll_button',url:C.page('pornhubSubscriptions')});}
    else{section(d,'用户名专属功能暂未打开','历史 / 站内收藏 / 订阅需要你的 /users/<name> 路径。');add(d,accountNameInput('填入你自己的账号主页用户名后开放'));}
    section(d,'账号校验','如果原生列表和网页仍有差异，以 X5 官方页面为准并截图给我继续适配。');
    add(d,{title:'X5 查看官方账号安全页',desc:'用于确认当前 X5 到底登录的是哪个账号',col_type:'text_1',url:'x5://'+C.base()+'/user/security',extra:{lineVisible:false}});
    add(d,{title:'重新同步登录',desc:'重新读取当前 X5 Cookie',col_type:'text_1',url:C.page('pornhubLogin'),extra:{lineVisible:false}});
    add(d,{title:'退出本小程序账号会话',desc:'只清除小程序保存的会话，不删除 X5 官方 Cookie',col_type:'text_1',url:$(C.authEnabledKey).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);PornhubBoot.loadOnly();PornhubCore.logoutLocal();setItem(PornhubCore.authSessionKey,'');refreshPage(false);return'toast://已清除本小程序账号会话';},C.bootstrap),extra:{lineVisible:false}});
    setResult(d);
  };

  R.accountList=function(){
    var kind=C.param('kind','recommended'),n=C.param('n','账号内容'),page=C.pageNo();title(n);var d=[];
    if(!C.accountReady()){empty(d,'登录状态不可用','请先使用 X5 登录并同步。');setResult(d);return;}
    if((kind==='history'||kind==='favorites')&&!C.accountIdentityReady()){empty(d,'账号主页用户名未绑定','为避免串到其他用户，不请求用户名专属路径。');add(d,accountNameInput('填入你自己的用户名'));setResult(d);return;}
    var r=C.accountVideos(kind,page);renderVideos(d,r.cards);if(!r.cards.length&&page===1)empty(d,r.error||'当前账号页没有解析到视频','Test4 已只解析主 videoblock，不再混入推荐侧栏。',r.url);setResult(d);
  };
  R.subscriptions=function(){
    var page=C.pageNo();title('订阅创作者');var d=[];if(!C.accountIdentityReady()){empty(d,'账号主页用户名未绑定','订阅路径需要当前账号用户名。');add(d,accountNameInput('填入你自己的用户名'));setResult(d);return;}
    var r=C.subscriptions(page);renderCreators(d,r.profiles);if(!r.profiles.length&&page===1)empty(d,r.error||'当前订阅页没有解析到创作者','Test4 只接受 subscriptions/userLink 区域人物，不再把推荐演员混进你的订阅。',r.url);setResult(d);
  };
})();
