/* XVideos UI/Product Rescue Patch 0.1.0-test.5 */
(function(){
  if(typeof XVideosRemoteRuntime==='undefined'||typeof XVideosCore==='undefined')throw new Error('XVideos Test5 UI preflight failed');
  var R=XVideosRemoteRuntime,C=XVideosCore,A='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/xvideos/assets/';
  R.version='0.1.0-test.5';R.build=10105;
  function add(d,x){d.push(x);}
  function title(t){try{setPageTitle(C.decode(t));}catch(e){}}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  function divider(d){add(d,{col_type:'line'});}
  function btn(d,t,url,on){add(d,{title:(on?'● ':'')+t,col_type:'flex_button',url:url,extra:{lineVisible:false}});}
  function action(d,t,desc,ico,url){add(d,{title:t,desc:desc||'',pic_url:A+ico+'.svg',col_type:'icon_small_4',url:url||'hiker://empty',extra:{lineVisible:false}});}
  function textStat(d,label,value){add(d,{title:label+'：'+(C.clean(value)||'—'),col_type:'text_2',url:'hiker://empty',extra:{lineVisible:false}});}
  function empty(d,t,desc,url){section(d,t,desc);if(url)add(d,{title:'在官网打开',desc:url,col_type:'text_center_1',url:'web://'+url,extra:{lineVisible:false}});}
  function videoCard(c){return{title:C.decode(c.title||'Video'),desc:C.decode(c.desc||''),pic_url:c.img||'',url:C.page('xvideosDetail',{u:c.url}),col_type:'movie_2',extra:{id:'xv5_video_'+C.hash(c.url),lineVisible:false}};}
  function videos(d,a,limit){limit=limit||a.length;for(var i=0;i<a.length&&i<limit;i++)add(d,videoCard(a[i]));}
  function creatorCard(p){return{title:C.decode(p.title||'创作者'),desc:C.decode(p.desc||''),pic_url:p.img||A+'account.svg',url:C.page('xvideosProfile',{u:p.url}),col_type:'movie_2',extra:{id:'xv5_creator_'+C.hash(p.url),lineVisible:false}};}
  function creators(d,a){for(var i=0;i<a.length;i++)add(d,creatorCard(a[i]));}

  R.categories=function(){
    title('分类');var d=[],q=C.clean(C.param('q','')),all=C.tagListZh(false),i,t,letter=getMyVar('xv_tag_letter5','ALL'),shown=[],popularKeys=['asian','amateur','anal','big-ass','big-tits','blonde','brunette','creampie','cumshot','lesbian','mature','milf','redhead','solo','teen','interracial','latina','indian','japanese','massage','pov','threesome','ai-generated','animated-hentai'],popular=[],map={};
    add(d,{title:'搜索分类',desc:q||'输入中文或英文标签',pic_url:A+'categories.svg',col_type:'input',url:"(function(){var q=String(input||'').trim();return '"+C.page('xvideosCategories')+"&q='+encodeURIComponent(q);})()",extra:{defaultValue:q}});
    for(i=0;i<all.length;i++){map[String(all[i].sourceName||'').toLowerCase()]=all[i];map[String(all[i].name||'').toLowerCase()]=all[i];}
    if(q){var k=q.toLowerCase();for(i=0;i<all.length;i++)if(String(all[i].name||'').toLowerCase().indexOf(k)>=0||String(all[i].sourceName||'').toLowerCase().indexOf(k)>=0)shown.push(all[i]);section(d,'匹配分类',shown.length+' 项');for(i=0;i<shown.length;i++)add(d,{title:shown[i].name,col_type:'flex_button',url:C.page('xvideosCategory',{u:shown[i].url,n:shown[i].name}),extra:{lineVisible:false}});setResult(d);return;}
    section(d,'热门分类','官网真实标签 · 中文显示');for(i=0;i<popularKeys.length;i++){t=map[popularKeys[i]];if(t&&popular.indexOf(t)<0)popular.push(t);}for(i=0;i<popular.length;i++)add(d,{title:popular[i].name,col_type:'flex_button',url:C.page('xvideosCategory',{u:popular[i].url,n:popular[i].name}),extra:{lineVisible:false}});
    section(d,'全部分类','共 '+all.length+' 个 · 中文名称，按原标签首字母收纳');var letters=['ALL','#','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];for(i=0;i<letters.length;i++){(function(l){add(d,{title:(letter===l?'● ':'')+(l==='ALL'?'全部':l),col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(v){putMyVar('xv_tag_letter5',v);refreshPage(false);return'hiker://empty';},l),extra:{lineVisible:false}});})(letters[i]);}
    for(i=0;i<all.length;i++)if(letter==='ALL'||all[i].letter===letter)shown.push(all[i]);section(d,letter==='ALL'?'全部分类':(letter==='#'?'其它':letter+' 开头'),shown.length+' 项');for(i=0;i<shown.length;i++)add(d,{title:shown[i].name,col_type:'flex_button',url:C.page('xvideosCategory',{u:shown[i].url,n:shown[i].name}),extra:{lineVisible:false}});setResult(d);
  };

  R.creators=function(){
    var paramKind=C.param('kind',''),kind=getMyVar('xv_creator_kind5',paramKind||'pornstars'),q=C.clean(C.param('q','')),group=C.param('u',''),groupName=C.param('n',''),page=C.pageNo(),d=[],r,i;title(groupName||(kind==='channels'?'频道':kind==='profiles'?'创作者':'演员'));
    if(!group){
      btn(d,'演员',$('#noLoading#').lazyRule(function(){putMyVar('xv_creator_kind5','pornstars');refreshPage(false);return'hiker://empty';}),kind==='pornstars');
      btn(d,'频道',$('#noLoading#').lazyRule(function(){putMyVar('xv_creator_kind5','channels');refreshPage(false);return'hiker://empty';}),kind==='channels');
      btn(d,'创作者',$('#noLoading#').lazyRule(function(){putMyVar('xv_creator_kind5','profiles');refreshPage(false);return'hiker://empty';}),kind==='profiles');
      add(d,{title:'搜索'+(kind==='channels'?'频道':kind==='profiles'?'创作者':'演员'),desc:q||'输入名字',pic_url:A+'creators.svg',col_type:'input',url:"(function(){var q=String(input||'').trim();return '"+C.page('xvideosCreators',{kind:kind})+"&q='+encodeURIComponent(q);})()",extra:{defaultValue:q}});
    }
    r=C.creatorList(kind,page,q,group||'');
    if(r.regions.length&&!group&&kind==='pornstars'){section(d,'地区入口','地区只作筛选，不再混进演员实体');for(i=0;i<r.regions.length;i++)add(d,{title:r.regions[i].name,col_type:'flex_button',url:C.page('xvideosCreators',{kind:kind,u:r.regions[i].url,n:r.regions[i].name}),extra:{lineVisible:false}});}
    section(d,group?(groupName||'结果'):(kind==='channels'?'频道':kind==='profiles'?'创作者':'演员'),r.profiles.length?('当前页 '+r.profiles.length+' 项 · 双列卡片'):'当前页未识别到实体');creators(d,r.profiles);
    if(!r.profiles.length&&page===1)empty(d,'暂未识别到实体','本版宁可空缺，也不把地区、分类或导航项伪装成演员/频道。',r.url);setResult(d);
  };

  R.profile=function(){
    var u=C.param('u',''),page=C.pageNo(),d=[],i;if(!u){empty(d,'缺少创作者地址','请重新进入。');setResult(d);return;}var x=C.profile(u,page);title(x.name);
    add(d,{title:C.decode(x.name),desc:C.decode(x.desc||'XVideos 创作者'),pic_url:x.img||A+'account.svg',col_type:'movie_1_left_pic',url:'web://'+u,extra:{lineVisible:false}});
    var stats=x.stats||[],m={};for(i=0;i<stats.length;i++)m[stats[i].name]=stats[i].value;textStat(d,'视频',m['视频']||String(x.videos.length));textStat(d,'浏览',m['浏览']||'—');textStat(d,'订阅',m['订阅']||'—');textStat(d,'播放',m['播放']||'—');
    if(x.desc){section(d,'简介','');add(d,{title:C.decode(x.desc),col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});}section(d,'视频',x.totalVideos?('共 '+x.totalVideos+' 个 · 当前页 '+x.videos.length+' 个'):('当前页 '+x.videos.length+' 个'));videos(d,x.videos);if(!x.videos.length)empty(d,'该主页暂未解析到视频','当前使用 /videos/best/<page> 的真实创作者视频载荷。',x.videoUrl||u);divider(d);add(d,{title:'官网主页',pic_url:A+'globe.svg',col_type:'text_center_1',url:'web://'+u,extra:{lineVisible:false}});setResult(d);
  };

  R.detail=function(){
    var u=C.param('u',''),d=[],i;if(!u){empty(d,'缺少视频地址','请从列表重新进入。');setResult(d);return;}var h=C.fetchText(u,{force:true,ttl:0,auth:C.authEnabled(),timeout:14000});if(C.isBad(h)){title('视频详情');empty(d,'详情加载失败','官网返回异常页面。',u);setResult(d);return;}var x=C.detail(h,u),cover=C.image(x.cover,u),meta=[x.duration,x.views?x.views+' views':'',x.date].filter(function(v){return!!v;}).join(' · ');title(x.title);C.addHistory({url:u,title:x.title,img:cover,rawImg:x.cover,desc:meta});
    add(d,{title:C.decode(x.title),desc:[x.duration,x.views?('观看 '+x.views):'',x.date].filter(function(v){return!!v;}).join(' · '),pic_url:cover,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    var sourcePayload=JSON.stringify(x.sources||[]),playDesc=x.sources.length?('默认最高画质 · '+x.sources.length+' 组官网媒体源'):'未发现结构化直链 · 使用网页媒体提取';
    add(d,{title:'▶ 立即播放',desc:playDesc,col_type:'text_center_1',url:x.sources.length?$(sourcePayload).lazyRule(function(boot,payload,ref){require(boot,{headers:{'Cache-Control':'no-cache'}},10105);XVideosBoot.loadOnly();var a=[];try{a=JSON.parse(payload);}catch(e){}return XVideosCore.resolveKnownSources(a,ref);},C.bootstrap,sourcePayload,u):'video://'+u,extra:{id:'xv5_play_'+C.hash(u),lineVisible:false,blockRules:['.jpg','.jpeg','.png','.gif','.webp','banner','advert','doubleclick','googleads'],videoRules:['.m3u8','.mp4','m3u8','mp4'],videoExcludeRules:['advert','promo','banner','?ad='],cacheM3u8:true}});
    divider(d);textStat(d,'时长',x.duration);textStat(d,'观看',x.views);textStat(d,'点赞',x.likes);textStat(d,'评论',x.commentCount||'0');if(x.date)section(d,'发布',x.date);
    var fav=C.isFav(u),favDesc=fav?'已收藏':'本机独立';action(d,fav?'已收藏':'本地收藏',favDesc,'localfav',$(u).lazyRule(function(boot,target,tt,cv,ds){require(boot,{headers:{'Cache-Control':'no-cache'}},10105);XVideosBoot.loadOnly();var on=XVideosCore.toggleFav({url:target,title:tt,rawImg:cv,img:XVideosCore.image(cv,target),desc:ds});return'toast://'+(on?'已加入本地收藏；重新进入详情后图标状态会更新':'已取消本地收藏；重新进入详情后图标状态会更新');},C.bootstrap,u,x.title,x.cover,[x.duration,x.views].filter(function(v){return!!v;}).join(' · ')));
    action(d,'评论',x.commentCount?x.commentCount+' 条':'查看','comments',C.page('xvideosComments',{u:u,n:x.title}));action(d,'官网','原站互动','globe','web://'+u);action(d,'上传者',x.author?x.author.name:'暂无','account',x.author&&x.author.url?C.page('xvideosProfile',{u:x.author.url}):'hiker://empty');
    if(x.author){divider(d);section(d,'上传者',x.author.subs?('订阅 '+x.author.subs):'');add(d,{title:C.decode(x.author.name),desc:x.author.type==='channel'?'频道':'创作者',pic_url:x.author.img||A+'account.svg',col_type:'avatar',url:C.page('xvideosProfile',{u:x.author.url}),extra:{lineVisible:false}});}
    if(x.models&&x.models.length){section(d,'出演者','仅显示详情页真实人物实体');for(i=0;i<x.models.length;i++)add(d,{title:C.decode(x.models[i].name),col_type:'flex_button',url:C.page('xvideosProfile',{u:x.models[i].url}),extra:{lineVisible:false}});}
    if(x.desc){section(d,'简介','');add(d,{title:C.decode(x.desc),col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});}
    if(x.tags&&x.tags.length){section(d,'标签','中文显示 · 仍进入官网真实标签');for(i=0;i<x.tags.length;i++)add(d,{title:C.decode(x.tags[i].name),col_type:'flex_button',url:C.page('xvideosCategory',{u:x.tags[i].url,n:x.tags[i].name}),extra:{lineVisible:false}});}
    if(x.related&&x.related.length){section(d,'相关推荐','');videos(d,x.related,18);}setResult(d);
  };

  R.comments=function(){
    var u=C.param('u',''),n=C.decode(C.param('n','视频评论'));title('评论');var d=[],h=C.fetchText(u,{force:true,ttl:0,auth:C.authEnabled(),timeout:14000}),r=C.commentsForVideo(u,h),a=r.comments||[],i,c;section(d,n,a.length?('已恢复 '+a.length+' 条真实评论'):'评论数量可识别，但当前返回仍未恢复正文');
    for(i=0;i<a.length;i++){c=a[i];add(d,{title:C.decode(c.user)+(c.time?' · '+C.decode(c.time):''),desc:C.decode(c.text)+(c.likes?('\n赞 '+c.likes):''),pic_url:c.img||A+'account.svg',col_type:'avatar',url:c.url?C.page('xvideosProfile',{u:c.url}):'hiker://empty',extra:{lineVisible:false}});}
    if(!a.length){add(d,{title:'当前页面没有可安全还原的评论正文',desc:r.candidates&&r.candidates.length?('已检查详情 DOM 与 '+r.candidates.length+' 个评论/AJAX 候选；下一轮可继续按实机返回定向适配。'):'详情页没有暴露可验证的评论/AJAX 地址；不伪造评论内容。',col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});add(d,{title:'官网评论',pic_url:A+'globe.svg',col_type:'text_center_1',url:'x5://'+u,extra:{lineVisible:false}});}setResult(d);
  };

  R.login=function(){
    title('登录 XVideos');var d=[],ready=C.accountReady(),st=C.accountState();section(d,'官方账号登录','使用 XVideos /account 账号页与海阔 X5 Cookie 容器；不保存账号密码，也不持久化 Cookie。');
    action(d,'① 打开官方账号页','完成登录 / 验证码','account','x5://'+C.loginUrl());
    action(d,'② 同步当前 X5 会话','登录完成后返回点击','refresh',$(C.loginUrl()).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10105);XVideosBoot.loadOnly();var r=XVideosCore.syncWebCookie();if(!r.ok)return'toast://'+r.message;return XVideosCore.page('xvideosAccount');},C.bootstrap));
    section(d,'当前状态',ready?('已连接'+(C.accountName()?' · '+C.accountName():'')+' · '+C.authFingerprint()):(st.enabled?'旧会话已失效，请重新同步':'未连接'));if(ready)add(d,{title:'进入我的账号',col_type:'text_center_1',url:C.page('xvideosAccount'),extra:{lineVisible:false}});setResult(d);
  };

  R.account=function(){
    title('我的 XVideos');var d=[],ready=C.accountReady();if(!ready){section(d,'账号会话未连接','请先在官方 /account 页完成登录并同步当前 X5 会话。');action(d,'去登录','X5 官方账号页','account',C.page('xvideosLogin'));setResult(d);return;}
    section(d,'当前账号',C.accountName()?(C.accountName()+' · '+C.authFingerprint()):('X5 会话 '+C.authFingerprint()));action(d,'账号首页','当前会话','best',C.page('xvideosAccountList',{kind:'home',n:'账号首页'}));action(d,'喜欢','Videos I Like','favorite',C.page('xvideosAccountList',{kind:'liked',n:'喜欢的视频'}));action(d,'稍后看','Watch Later','watchlater',C.page('xvideosAccountList',{kind:'watchlater',n:'稍后观看'}));action(d,'历史','History','history',C.page('xvideosAccountList',{kind:'history',n:'观看历史'}));divider(d);
    add(d,{title:'官网账号页',desc:'用 X5 核对当前登录身份',col_type:'text_1',url:'x5://'+C.loginUrl(),extra:{lineVisible:false}});add(d,{title:'重新同步会话',desc:'切换官网账号后使用',col_type:'text_1',url:$(C.loginUrl()).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10105);XVideosBoot.loadOnly();var r=XVideosCore.syncWebCookie();return'toast://'+r.message;},C.bootstrap),extra:{lineVisible:false}});add(d,{title:'退出小程序会话',desc:'只清本程序文件状态，不删除 X5 官网 Cookie',col_type:'text_1',url:$(C.loginUrl()).lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10105);XVideosBoot.loadOnly();XVideosCore.logoutLocal();return XVideosCore.page('xvideosLogin');},C.bootstrap),extra:{lineVisible:false}});setResult(d);
  };

  R.accountList=function(){var kind=C.param('kind','history'),n=C.param('n','账号视频'),page=C.pageNo();title(n);var d=[];if(!C.accountReady()){empty(d,'需要登录','请先同步 XVideos 官方 X5 会话。',C.loginUrl());setResult(d);return;}if(page===1)section(d,n,(C.accountName()?C.accountName()+' · ':'')+'会话 '+C.authFingerprint());var r=kind==='home'?C.homeVideos('home',page):C.accountVideos(kind,page);videos(d,r.cards);if(!r.cards.length&&page===1)empty(d,'该账号列表暂未解析到视频',r.error||'请在 X5 官网核对当前账号与列表内容。',r.url);setResult(d);};

  function localPage(key,name,none){title(name);var d=[],a=C.readList(key),i;if(a.length){for(i=0;i<a.length;i++)add(d,videoCard(a[i]));divider(d);add(d,{title:'清空'+name,desc:'文件存储 · 不触碰官网账号数据',col_type:'text_center_1',url:$(key).lazyRule(function(boot,k){require(boot,{headers:{'Cache-Control':'no-cache'}},10105);XVideosBoot.loadOnly();XVideosCore.writeList(k,[]);return'toast://已清空；重新进入页面后生效';},C.bootstrap,key),extra:{lineVisible:false}});}else section(d,none,'暂无记录');setResult(d);}
  R.localFavorites=function(){localPage(C.favoriteKey,'本地收藏','暂无本地收藏');};R.localHistory=function(){localPage(C.historyKey,'本地足迹','暂无浏览足迹');};

  R.settings=function(){
    title('XVideos 设置');var d=[];section(d,'运行信息','Test 0.1.0-test.5 · Build 10105 · 私有存储救援模式');section(d,'存储策略','完整 HTML、账号会话状态、收藏、足迹、搜索历史均不再写入 setItem；账号 Cookie 只实时读取 X5。');add(d,{title:'当前站点域名',desc:C.base(),col_type:'text_1',url:'input://'+JSON.stringify({value:C.base(),hint:'https://www.xvideos.com',js:"var v=String(input||'').trim().replace(/\\/+$/,'');if(!/^https?:\\/\\//i.test(v))return 'toast://请输入完整 http(s) 地址';return XVideosCore.saveBase(v)?'toast://已保存，重新进入页面生效':'toast://保存失败';"}),extra:{lineVisible:false}});add(d,{title:'清理本次运行内存缓存',desc:'不写私有 KV，不清收藏/足迹',col_type:'text_1',url:$('#noLoading#').lazyRule(function(){if(XVideosCore._t5Storage){XVideosCore._t5Storage.MEM={};XVideosCore._t5Storage.MEM_TS={};XVideosCore._t5Storage.PROFILE_MEM={};XVideosCore._t5Storage.PROFILE_TS={};}return'toast://本次运行内存缓存已清理';}),extra:{lineVisible:false}});add(d,{title:'更新说明',desc:'Test5 使用直接不可变加载器，避免 1MB 私有 KV 阻断 Remote Manager；后续更新请从“我的规则仓库”同步并覆盖。',col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});section(d,'本轮实机重点','详情真实统计值与四个操作图标；中文分类；演员/频道/创作者双列；/account 登录同步；评论正文；确认不再出现 1MB setItem 报错。');setResult(d);
  };
})();
