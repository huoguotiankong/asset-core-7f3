/* Pornhub Remote UI Patch 0.1.0-test.2 */
(function(){
  if(typeof PornhubRemoteRuntime!=='object'||typeof PornhubCore!=='object')throw new Error('Pornhub Test2 runtime preflight failed');
  var R=PornhubRemoteRuntime,C=PornhubCore;
  var A='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/pornhub/assets/';
  R.version='0.1.0-test.2';R.build=10102;
  function add(d,x){d.push(x);}
  function title(t){try{setPageTitle(t);}catch(e){}}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  function icon(d,t,desc,ico,url){add(d,{title:t,desc:desc||'',pic_url:A+ico+'.svg',col_type:'icon_4',url:url,extra:{lineVisible:false}});}
  function videoCard(c){return{title:c.title||'Video',desc:c.desc||'',pic_url:c.img||'',url:C.page('pornhubDetail',{u:c.url}),col_type:'movie_2',extra:{id:'ph_video_'+C.hash(c.url),lineVisible:false}};}
  function renderVideos(d,a,limit){limit=limit||a.length;for(var i=0;i<a.length&&i<limit;i++)add(d,videoCard(a[i]));}
  function empty(d,t,desc,url){section(d,t,desc);if(url)add(d,{title:'在原站网页打开',desc:url,col_type:'text_1',url:'web://'+url,extra:{lineVisible:false}});}
  function profileTypeText(t){return t==='channel'?'频道':t==='pornstar'?'Pornstar':t==='model'?'Model':t==='user'?'用户':t||'创作者';}
  function profileCard(p){return{title:p.title||C.profileSlugName(p.url)||'创作者',desc:profileTypeText(p.type),pic_url:p.img||A+'account.svg',url:C.page('pornhubProfile',{u:p.url,n:p.title||'',im:p.rawImg||''}),col_type:'avatar',extra:{id:'ph_profile_'+C.hash(p.url),lineVisible:false}};}
  function renderProfiles(d,a){for(var i=0;i<a.length;i++)add(d,profileCard(a[i]));}
  function searchInputUrl(){return'input://'+JSON.stringify({value:'',hint:'搜索视频、演员、频道',js:"'hiker://page/pornhubSearch?rule='+encodeURIComponent('"+C.ruleTitle()+"')+'&simple=true&q='+encodeURIComponent(input)"});}

  R.home=function(){
    title('Pornhub');var d=[],b=C.base();
    add(d,{title:'Pornhub',desc:'原生浏览 · 多画质播放 · 账号会话',pic_url:A+'icon.svg',col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    icon(d,'搜索','视频 / 创作者','search',searchInputUrl());
    icon(d,'分类','站点分类','categories',C.page('pornhubCategories'));
    icon(d,'创作者','Pornstars / Channels','creators',C.page('pornhubCreators'));
    icon(d,C.accountReady()?'我的':'登录','账号推荐 / 历史','account',C.accountReady()?C.page('pornhubAccount'):C.page('pornhubLogin'));
    add(d,{title:'推荐',col_type:'scroll_button',url:C.page('pornhubCatalog',{m:'home',n:'推荐'})});
    add(d,{title:'最新',col_type:'scroll_button',url:C.page('pornhubCatalog',{m:'recent',n:'最新'})});
    add(d,{title:'最多观看',col_type:'scroll_button',url:C.page('pornhubCatalog',{m:'viewed',n:'最多观看'})});
    add(d,{title:'最高评分',col_type:'scroll_button',url:C.page('pornhubCatalog',{m:'rated',n:'最高评分'})});
    var h=C.fetchText(b+'/video',{ttl:3*60*1000}),cards=C.parseVideoCards(h,b+'/video');
    section(d,'首页视频',cards.length?'公开内容 · '+cards.length+' 项':'当前网络未解析到公开列表');renderVideos(d,cards,18);
    if(!cards.length)add(d,{title:'打开原站首页',desc:b,col_type:'text_1',url:'web://'+b+'/',extra:{lineVisible:false}});
    section(d,'更多','GIF / Shorts / 本地记录');
    icon(d,'GIF','站点 GIF','gifs',C.page('pornhubGifs'));
    icon(d,'Shorts','短视频','shorts',C.page('pornhubShorts'));
    icon(d,'本地收藏','Test1 兼容记录','favorite',C.page('pornhubLocalFavorites'));
    icon(d,'浏览历史','最近浏览','history',C.page('pornhubLocalHistory'));
    add(d,{title:'播放列表',desc:'公开 Playlists',col_type:'text_1',url:C.page('pornhubPlaylists'),extra:{lineVisible:false}});
    add(d,{title:'设置与诊断',desc:R.version+' · Build '+R.build,col_type:'text_1',url:C.page('pornhubSettings'),extra:{lineVisible:false}});
    setResult(d);
  };

  R.detail=function(){
    var u=C.param('u',''),d=[];if(!u){empty(d,'缺少视频地址','请从列表重新进入。');setResult(d);return;}
    var h=C.fetchText(u,{force:false,ttl:2*60*1000,auth:C.authEnabled(),timeout:10000});
    if(C.isBad(h)){title('视频详情');empty(d,'详情加载失败','原站返回验证页、空页面或网络异常。',u);setResult(d);return;}
    var x=C.detail(h,u);title(x.title);C.addHistory({url:u,title:x.title,img:C.image(x.cover,u),rawImg:x.cover,desc:[x.duration,x.views?x.views+' views':''].filter(function(v){return!!v;}).join(' · ')});
    add(d,{title:x.title,desc:[x.duration,x.views?x.views+' views':'',x.date].filter(function(v){return!!v;}).join(' · '),pic_url:C.image(x.cover,u),url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    add(d,{title:'▶ 立即播放',desc:x.sources.length?(x.sources.length+' 个 HLS 画质 · 已预缓存播放地址'):'点击后自动解析媒体',col_type:'text_1',url:$(u).lazyRule(function(boot,target){require(boot,{headers:{'Cache-Control':'no-cache'}},10102);PornhubBoot.loadOnly();return PornhubCore.resolvePlay(target);},C.bootstrap,u),extra:{id:'ph_play_'+C.hash(u),lineVisible:false}});
    if(x.author){section(d,'创作者','');add(d,{title:x.author.name,desc:profileTypeText(x.author.type),pic_url:x.author.img||A+'account.svg',col_type:'avatar',url:C.page('pornhubProfile',{u:x.author.url,n:x.author.name||'',im:x.author.rawImg||''}),extra:{lineVisible:false}});}
    if(x.desc){section(d,'简介','');add(d,{title:x.desc,col_type:'rich_text',url:'hiker://empty'});}
    if(x.categories.length){section(d,'分类','');for(var i=0;i<x.categories.length;i++)add(d,{title:x.categories[i].name,col_type:'scroll_button',url:C.page('pornhubCategory',{u:x.categories[i].url,n:x.categories[i].name})});}
    if(x.tags.length){section(d,'标签','');for(var j=0;j<x.tags.length;j++)add(d,{title:x.tags[j].name,col_type:'flex_button',url:C.page('pornhubCategory',{u:x.tags[j].url,n:x.tags[j].name})});}
    if(x.related.length){section(d,'相关推荐','');renderVideos(d,x.related,16);}
    section(d,'更多操作','播放页不再混入收藏、设置等次要动作');
    add(d,{title:'原站评论与互动',desc:'点赞、评论等账号写操作继续使用官方页面',col_type:'text_1',url:'web://'+u,extra:{lineVisible:false}});
    setResult(d);
  };

  R.creators=function(){
    var kind=C.param('kind','pornstars'),q=C.param('q',''),page=C.pageNo();title('创作者');var d=[];
    add(d,{title:'Pornstars',col_type:'scroll_button',url:C.page('pornhubCreators',{kind:'pornstars'})});
    add(d,{title:'Channels',col_type:'scroll_button',url:C.page('pornhubCreators',{kind:'channels'})});
    add(d,{title:'Models',col_type:'scroll_button',url:C.page('pornhubCreators',{kind:'models'})});
    add(d,{title:'用户搜索',col_type:'scroll_button',url:C.page('pornhubCreators',{kind:'users'})});
    add(d,{title:'搜索创作者',desc:q||'输入名字',col_type:'input',url:"(function(){var q=String(input||'').trim();return 'hiker://page/pornhubCreators?rule='+encodeURIComponent('"+C.ruleTitle()+"')+'&simple=true&kind='+encodeURIComponent('"+kind+"')+'&q='+encodeURIComponent(q);})()",extra:{defaultValue:q}});
    var r=C.creatorList(kind,page,q);renderProfiles(d,r.profiles);if(!r.profiles.length&&page===1)empty(d,'暂未识别到创作者','站点此区域可能变更结构；可从原站网页继续。',r.url);setResult(d);
  };

  R.profile=function(){
    var u=C.param('u',''),seed=C.param('n',''),seedImg=C.param('im',''),d=[];if(!u){empty(d,'缺少创作者地址','请重新进入。');setResult(d);return;}
    var x=C.profile(u),name=x.name;if(!name||/^(creator|profile)$/i.test(name))name=seed||C.profileSlugName(u)||'创作者';
    var pic=x.img||(seedImg?C.image(seedImg,u):'')||A+'account.svg';title(name);
    add(d,{title:name,desc:profileTypeText(C.profileType(u)),pic_url:pic,col_type:'avatar',url:'hiker://empty',extra:{lineVisible:false}});
    section(d,'公开视频',x.videos.length?x.videos.length+' 项':'当前页未解析到视频');renderVideos(d,x.videos);
    if(!x.videos.length)empty(d,'暂无可展示视频','可打开原站主页查看其他标签页。',u);
    add(d,{title:'原站主页',desc:'查看完整资料 / 动态 / 互动',col_type:'text_1',url:'web://'+u,extra:{lineVisible:false}});
    setResult(d);
  };

  R.login=function(){
    title('Pornhub 登录');var d=[],ready=C.accountReady(),name=C.accountName();
    section(d,'账号登录','Test2 改为完整网页登录，不再把登录框挤在小程序页面里。');
    add(d,{title:'① 打开 Pornhub 官方登录页',desc:'在完整网页中完成邮箱密码、Google / X、验证码或二次验证',pic_url:A+'account.svg',col_type:'movie_1_left_pic',url:'web://'+C.base()+'/login',extra:{lineVisible:false}});
    add(d,{title:'② 登录完成后返回小程序',desc:'网页里确认已经进入账号状态，再按返回键回到本页',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'③ 同步登录状态',desc:ready?'当前已有本地账号会话，重新同步可刷新 Cookie':'读取官方网页 Cookie；不会保存账号密码',col_type:'text_1',url:$(C.base()).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10102);PornhubBoot.loadOnly();var r=PornhubCore.syncWebCookie();if(r.ok){refreshPage(false);return'toast://'+r.message;}return'toast://'+r.message;},C.bootstrap),extra:{lineVisible:false,id:'ph_login_sync'}});
    if(ready){
      section(d,'当前账号','Cookie 会话已启用');
      add(d,{title:name||'已登录',desc:'推荐 / Feed / 历史 / 收藏 / 订阅',pic_url:A+'account.svg',col_type:'avatar',url:C.page('pornhubAccount'),extra:{lineVisible:false}});
      add(d,{title:'进入我的账号',col_type:'text_1',url:C.page('pornhubAccount'),extra:{lineVisible:false}});
    }
    if(ready&&!name){
      section(d,'兼容设置','只有自动识别账号名失败时才需要填写');
      add(d,{title:'手动填写账号用户名',desc:'用于历史 / 收藏 / 订阅 URL',col_type:'text_1',url:'input://'+JSON.stringify({value:'',hint:'Pornhub 用户名',js:"(function(){var n=String(input||'').trim();require('"+C.bootstrap+"',{headers:{'Cache-Control':'no-cache'}},10102);PornhubBoot.loadOnly();PornhubCore.setAccountName(n);refreshPage(false);return 'toast://用户名已保存';})()"}),extra:{lineVisible:false}});
    }
    setResult(d);
  };

  R.localFavorites=function(){title('本地收藏');var d=[],a=C.readList(C.favoriteKey);section(d,'Test1 本地收藏',a.length+' 项 · Test2 详情页已移除重复收藏按钮，日常收藏建议使用系统标题栏 ♥');renderVideos(d,a);if(!a.length)section(d,'暂无兼容记录','Test2 不再在播放主区域放置自定义收藏按钮。');setResult(d);};
})();
