/* XVideos UI/Product Patch 0.1.0-test.3 */
(function(){
  if(typeof XVideosRemoteRuntime==='undefined'||typeof XVideosCore==='undefined')throw new Error('XVideos Test3 runtime preflight failed');
  var R=XVideosRemoteRuntime,C=XVideosCore;
  var A='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/xvideos/assets/';
  R.version='0.1.0-test.3';R.build=10103;

  function add(d,x){d.push(x);}
  function title(t){try{setPageTitle(t);}catch(e){}}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  function divider(d){add(d,{col_type:'line'});}
  function smallIcon(d,t,desc,ico,url){add(d,{title:t,desc:desc||'',pic_url:A+ico+'.svg',col_type:'icon_small_4',url:url,extra:{lineVisible:false}});}
  function action(d,t,ico,url){add(d,{title:t,pic_url:A+ico+'.svg',col_type:'icon_small_4',url:url,extra:{lineVisible:false}});}
  function stat(d,t,v,ico){add(d,{title:t,desc:v||'—',pic_url:A+ico+'.svg',col_type:'icon_small_4',url:'hiker://empty',extra:{lineVisible:false}});}
  function btn(d,t,url,on){add(d,{title:(on?'● ':'')+t,col_type:'flex_button',url:url,extra:{lineVisible:false}});}
  function empty(d,t,desc,url){section(d,t,desc);if(url)add(d,{title:'在官网打开',desc:url,col_type:'text_center_1',url:'web://'+url,extra:{lineVisible:false}});}
  function videoCard(c){return{title:c.title||'Video',desc:c.desc||'',pic_url:c.img||'',url:C.page('xvideosDetail',{u:c.url}),col_type:'movie_2',extra:{id:'xv3_video_'+C.hash(c.url),lineVisible:false}};}
  function renderVideos(d,a,limit){limit=limit||a.length;for(var i=0;i<a.length&&i<limit;i++)add(d,videoCard(a[i]));}
  function renderProfiles(d,a){for(var i=0;i<a.length;i++){var p=a[i];add(d,{title:p.title,desc:p.desc||'',pic_url:p.img||A+'account.svg',url:C.page('xvideosProfile',{u:p.url}),col_type:'avatar',extra:{id:'xv3_profile_'+C.hash(p.url),lineVisible:false}});}}
  function queryRoute(q,sort,datef,durf,quality){return C.page('xvideosSearch',{q:q||'',sort:sort||'relevance',datef:datef||'all',durf:durf||'allduration',quality:quality||'all'});}

  R.home=function(){
    title('XVideos');var d=[],ready=C.accountReady(),mode=getMyVar('xv_home_mode3',ready?'home':'best');
    add(d,{title:'',desc:'',pic_url:A+'banner.svg',col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}});
    smallIcon(d,'搜索','独立搜索中心','search',C.page('xvideosSearch'));
    smallIcon(d,'分类','热门 + A-Z 标签','categories',C.page('xvideosCategories'));
    smallIcon(d,'演员','Pornstars','creators',C.page('xvideosCreators',{kind:'pornstars'}));
    smallIcon(d,'频道','Channels','channels',C.page('xvideosCreators',{kind:'channels'}));
    smallIcon(d,'喜欢','站内点赞','favorite',ready?C.page('xvideosAccountList',{kind:'liked',n:'喜欢的视频'}):C.page('xvideosLogin'));
    smallIcon(d,'稍后看','Watch Later','watchlater',ready?C.page('xvideosAccountList',{kind:'watchlater',n:'稍后观看'}):C.page('xvideosLogin'));
    smallIcon(d,'观看历史','站内 History','history',ready?C.page('xvideosAccountList',{kind:'history',n:'观看历史'}):C.page('xvideosLogin'));
    smallIcon(d,ready?'我的':'登录','账号空间','account',ready?C.page('xvideosAccount'):C.page('xvideosLogin'));
    btn(d,'最佳',$('#noLoading#').lazyRule(function(){putMyVar('xv_home_mode3','best');refreshPage(false);return'hiker://empty';}),mode==='best');
    btn(d,'最新',$('#noLoading#').lazyRule(function(){putMyVar('xv_home_mode3','new');refreshPage(false);return'hiker://empty';}),mode==='new');
    btn(d,'高分',$('#noLoading#').lazyRule(function(){putMyVar('xv_home_mode3','rated');refreshPage(false);return'hiker://empty';}),mode==='rated');
    btn(d,'最多观看',$('#noLoading#').lazyRule(function(){putMyVar('xv_home_mode3','views');refreshPage(false);return'hiker://empty';}),mode==='views');
    var r=C.homeVideos(mode,1);section(d,'视频',r.cards.length?('当前 '+r.cards.length+' 项'):'当前没有可展示内容');renderVideos(d,r.cards,24);
    if(!r.cards.length)empty(d,'首页暂未解析到视频','可切换排序或打开官网检查当前页面。',r.url);
    divider(d);section(d,'更多','本机工具与设置');smallIcon(d,'本地收藏','本机独立','localfav',C.page('xvideosLocalFavorites'));smallIcon(d,'本地足迹','浏览记录','localhistory',C.page('xvideosLocalHistory'));smallIcon(d,'用户','Profiles','profiles',C.page('xvideosCreators',{kind:'profiles'}));smallIcon(d,'设置','域名 / 更新','settings',C.page('xvideosSettings'));setResult(d);
  };

  R.searchPage=function(){
    var q=C.param('q',''),sort=C.param('sort','relevance'),datef=C.param('datef','all'),durf=C.param('durf','allduration'),quality=C.param('quality','all'),page=C.pageNo(),d=[],i,x;
    title('搜索');if(q)C.recordSearch(q);
    add(d,{title:'搜索视频',desc:q||'输入关键词',pic_url:A+'search.svg',col_type:'input',url:"(function(){var q=String(input||'').trim();return '"+C.page('xvideosSearch')+"&q='+encodeURIComponent(q);})()",extra:{defaultValue:q}});
    if(page===1){
      var hs=C.searchHistory();if(hs.length){section(d,'搜索历史','点击直接搜索');for(i=0;i<hs.length;i++)add(d,{title:hs[i],col_type:'scroll_button',url:queryRoute(hs[i],'relevance','all','allduration','all'),extra:{lineVisible:false}});add(d,{title:'清空搜索历史',pic_url:A+'history.svg',col_type:'text_center_1',url:$('#noLoading#').lazyRule(function(){XVideosCore.clearSearchHistory();refreshPage(false);return'toast://搜索历史已清空';}),extra:{lineVisible:false}});}
    }
    if(!q){section(d,'搜索说明','输入关键词后可继续组合排序、日期、时长和画质筛选。');setResult(d);return;}
    section(d,'排序','');var sorts=[['相关','relevance'],['最新','uploaddate'],['评分','rating'],['时长','length'],['观看量','views'],['随机','random']];for(i=0;i<sorts.length;i++){x=sorts[i];btn(d,x[0],queryRoute(q,x[1],datef,durf,quality),sort===x[1]);}
    section(d,'日期','');var dates=[['全部','all'],['近3天','today'],['本周','week'],['本月','month'],['近3月','3month'],['近6月','6month']];for(i=0;i<dates.length;i++){x=dates[i];btn(d,x[0],queryRoute(q,sort,x[1],durf,quality),datef===x[1]);}
    section(d,'时长','');var ds=[['全部','allduration'],['1–3分','1-3min'],['3–10分','3-10min'],['10分+','10min_more'],['10–20分','10-20min'],['20分+','20min_more']];for(i=0;i<ds.length;i++){x=ds[i];btn(d,x[0],queryRoute(q,sort,datef,x[1],quality),durf===x[1]);}
    section(d,'画质','');var qs=[['全部','all'],['720P+','hd'],['1080P+','1080P']];for(i=0;i<qs.length;i++){x=qs[i];btn(d,x[0],queryRoute(q,sort,datef,durf,x[1]),quality===x[1]);}
    var r=C.searchVideos(q,page,{sort:sort,datef:datef,durf:durf,quality:quality});section(d,'搜索结果',r.cards.length?('当前页 '+r.cards.length+' 项'):'没有匹配结果');renderVideos(d,r.cards);if(!r.cards.length&&page===1)empty(d,'没有匹配结果','可换关键词或放宽筛选。',r.url);setResult(d);
  };

  R.categories=function(){
    title('分类');var d=[],q=C.clean(C.param('q','')),all=C.tagList(false),i,t,letter=getMyVar('xv_tag_letter3','ALL'),shown=[],popularNames=['Asian','Amateur','Anal','Big Ass','Big Tits','Blonde','Brunette','Creampie','Cumshot','Lesbian','Mature','Milf','Redhead','Solo','Teen','Interracial','Latina','Indian','Japanese','Massage','POV','Threesome','1080p'],popular=[],map={};
    add(d,{title:'搜索分类',desc:q||'输入标签名',pic_url:A+'categories.svg',col_type:'input',url:"(function(){var q=String(input||'').trim();return '"+C.page('xvideosCategories')+"&q='+encodeURIComponent(q);})()",extra:{defaultValue:q}});
    for(i=0;i<all.length;i++)map[all[i].name.toLowerCase()]=all[i];
    if(q){var k=q.toLowerCase();for(i=0;i<all.length;i++)if(all[i].name.toLowerCase().indexOf(k)>=0)shown.push(all[i]);section(d,'匹配分类',shown.length+' 项');for(i=0;i<shown.length;i++)add(d,{title:shown[i].name,col_type:'flex_button',url:C.page('xvideosCategory',{u:shown[i].url,n:shown[i].name}),extra:{lineVisible:false}});setResult(d);return;}
    section(d,'热门分类','来自官网标签集合');for(i=0;i<popularNames.length;i++){t=map[popularNames[i].toLowerCase()];if(t)popular.push(t);}for(i=0;i<popular.length;i++)add(d,{title:popular[i].name,col_type:'flex_button',url:C.page('xvideosCategory',{u:popular[i].url,n:popular[i].name}),extra:{lineVisible:false}});
    section(d,'全部标签','共 '+all.length+' 个 · 按首字母收纳');var letters=['ALL','#','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];for(i=0;i<letters.length;i++){(function(l){add(d,{title:(letter===l?'● ':'')+(l==='ALL'?'全部':l),col_type:'scroll_button',url:$('#noLoading#').lazyRule(function(v){putMyVar('xv_tag_letter3',v);refreshPage(false);return'hiker://empty';},l),extra:{lineVisible:false}});})(letters[i]);}
    for(i=0;i<all.length;i++)if(letter==='ALL'||all[i].letter===letter)shown.push(all[i]);section(d,letter==='ALL'?'全部分类':(letter==='#'?'其它':letter+' 开头'),shown.length+' 项');for(i=0;i<shown.length;i++)add(d,{title:shown[i].name,col_type:'flex_button',url:C.page('xvideosCategory',{u:shown[i].url,n:shown[i].name}),extra:{lineVisible:false}});setResult(d);
  };

  R.creators=function(){
    var kind=C.param('kind','pornstars'),q=C.clean(C.param('q','')),group=C.param('u',''),groupName=C.param('n',''),page=C.pageNo(),d=[];title(groupName||'创作者');
    if(!group){btn(d,'演员',C.page('xvideosCreators',{kind:'pornstars'}),kind==='pornstars');btn(d,'频道',C.page('xvideosCreators',{kind:'channels'}),kind==='channels');btn(d,'用户',C.page('xvideosCreators',{kind:'profiles'}),kind==='profiles');add(d,{title:'搜索创作者',desc:q||'输入名字',pic_url:A+'creators.svg',col_type:'input',url:"(function(){var q=String(input||'').trim();return '"+C.page('xvideosCreators',{kind:kind})+"&q='+encodeURIComponent(q);})()",extra:{defaultValue:q}});}
    var r=C.creatorList(kind,page,q,group||'');if(r.regions.length&&!group){section(d,'地区入口','地区不是演员本体，单独收纳');for(var i=0;i<r.regions.length;i++)add(d,{title:r.regions[i].name,col_type:'flex_button',url:C.page('xvideosCreators',{kind:kind,u:r.regions[i].url,n:r.regions[i].name}),extra:{lineVisible:false}});}section(d,group?(groupName||'创作者'):(kind==='channels'?'频道':kind==='profiles'?'用户':'演员'),r.profiles.length?('当前页 '+r.profiles.length+' 项'):'当前页未识别到实体');renderProfiles(d,r.profiles);if(!r.profiles.length&&page===1)empty(d,'暂未识别到创作者','当前页面可能仍有需要适配的新卡片结构。',r.url);setResult(d);
  };

  R.profile=function(){
    var u=C.param('u',''),page=C.pageNo(),d=[];if(!u){empty(d,'缺少创作者地址','请重新进入。');setResult(d);return;}var x=C.profile(u,page);title(x.name);
    add(d,{title:x.name,desc:x.desc||'XVideos 创作者',pic_url:x.img||A+'account.svg',col_type:'movie_1_left_pic',url:'web://'+u,extra:{lineVisible:false}});
    var stats=x.stats||[],m={};for(var i=0;i<stats.length;i++)m[stats[i].name]=stats[i].value;stat(d,'视频',m['视频']||String(x.videos.length),'videos');stat(d,'浏览',m['浏览']||'—','views');stat(d,'订阅',m['订阅']||'—','favorite');stat(d,'播放',m['播放']||'—','play');
    if(x.desc){section(d,'简介','');add(d,{title:x.desc,col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});}section(d,'视频',x.totalVideos?('共 '+x.totalVideos+' 个 · 当前页 '+x.videos.length+' 个'):('当前页 '+x.videos.length+' 个'));renderVideos(d,x.videos);if(!x.videos.length)empty(d,'该主页暂未解析到视频','已切换到 /videos/best/<page> 的真实账号视频载荷解析。',x.videoUrl||u);divider(d);action(d,'官网主页','globe','web://'+u);setResult(d);
  };

  R.detail=function(){
    var u=C.param('u',''),d=[];if(!u){empty(d,'缺少视频地址','请从列表重新进入。');setResult(d);return;}var h=C.fetchText(u,{force:true,ttl:0,auth:C.authEnabled(),timeout:14000});if(C.isBad(h)){title('视频详情');empty(d,'详情加载失败','官网返回异常页面。',u);setResult(d);return;}var x=C.detail(h,u);title(x.title);var cover=C.image(x.cover,u),meta=[x.duration,x.views?x.views+' views':'',x.date].filter(function(v){return!!v;}).join(' · ');C.addHistory({url:u,title:x.title,img:cover,rawImg:x.cover,desc:meta});
    add(d,{title:x.title,desc:meta,pic_url:cover,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    var sourcePayload=JSON.stringify(x.sources||[]),playDesc=x.sources.length?('默认最高画质 · '+x.sources.length+' 组官网媒体源'):'未发现结构化直链 · 使用网页媒体提取';
    add(d,{title:'▶ 立即播放',desc:playDesc,col_type:'text_center_1',url:x.sources.length?$(sourcePayload).lazyRule(function(boot,payload,ref){require(boot,{headers:{'Cache-Control':'no-cache'}},10103);XVideosBoot.loadOnly();var a=[];try{a=JSON.parse(payload);}catch(e){}return XVideosCore.resolveKnownSources(a,ref);},C.bootstrap,sourcePayload,u):'video://'+u,extra:{id:'xv3_play_'+C.hash(u),lineVisible:false,blockRules:['.jpg','.jpeg','.png','.gif','.webp','banner','advert','doubleclick','googleads'],videoRules:['.m3u8','.mp4','m3u8','mp4'],videoExcludeRules:['advert','promo','banner','?ad='],cacheM3u8:true}});divider(d);
    stat(d,'时长',x.duration||'—','videos');stat(d,'观看',x.views||'—','views');stat(d,'点赞',x.likes||'—','rating');stat(d,'评论',x.commentCount||'0','comments');
    if(x.author){section(d,'上传者',x.author.subs?('订阅 '+x.author.subs):'');add(d,{title:x.author.name,desc:x.author.type||'creator',pic_url:x.author.img||A+'account.svg',col_type:'avatar',url:C.page('xvideosProfile',{u:x.author.url}),extra:{lineVisible:false}});}if(x.models.length){section(d,'出演者','');for(var i=0;i<x.models.length;i++)add(d,{title:x.models[i].name,col_type:'flex_button',url:C.page('xvideosProfile',{u:x.models[i].url}),extra:{lineVisible:false}});}if(x.desc){section(d,'简介','');add(d,{title:x.desc,col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});}if(x.tags.length){section(d,'标签','');for(var j=0;j<x.tags.length;j++)add(d,{title:x.tags[j].name,col_type:'flex_button',url:C.page('xvideosCategory',{u:x.tags[j].url,n:x.tags[j].name}),extra:{lineVisible:false}});}if(x.related.length){section(d,'相关推荐','');renderVideos(d,x.related,18);}divider(d);
    var fav=C.isFav(u);action(d,fav?'取消收藏':'本地收藏','localfav',$(u).lazyRule(function(boot,target,tt,cv,ds){require(boot,{headers:{'Cache-Control':'no-cache'}},10103);XVideosBoot.loadOnly();var on=XVideosCore.toggleFav({url:target,title:tt,rawImg:cv,img:XVideosCore.image(cv,target),desc:ds});refreshPage(false);return'toast://'+(on?'已加入本地收藏':'已取消本地收藏');},C.bootstrap,u,x.title,x.cover,meta));action(d,'评论','comments',C.page('xvideosComments',{u:u,n:x.title}));action(d,'官网','globe','web://'+u);action(d,'上传者','account',x.author?C.page('xvideosProfile',{u:x.author.url}):'hiker://empty');setResult(d);
  };

  R.comments=function(){
    var u=C.param('u',''),n=C.param('n','视频评论');title('评论');var d=[],h=C.fetchText(u,{force:true,ttl:0,auth:C.authEnabled()}),a=C.parseComments(h,u);add(d,{title:n,desc:a.length?('已解析 '+a.length+' 条评论'):'当前页面未恢复到评论正文',pic_url:A+'comments.svg',col_type:'avatar',url:'hiker://empty',extra:{lineVisible:false}});for(var i=0;i<a.length;i++){var c=a[i];add(d,{title:c.user+(c.time?' · '+c.time:''),desc:c.text,pic_url:c.img||A+'account.svg',col_type:'avatar',url:c.url?C.page('xvideosProfile',{u:c.url}):'hiker://empty',extra:{lineVisible:false}});}if(!a.length)empty(d,'评论正文暂未解析','评论数量已经能识别，正文继续按实机 DOM 适配。',u);divider(d);action(d,'官网评论','globe','web://'+u);setResult(d);
  };

  R.module=function(){return R;};
})();
