/* Pornhub Remote UI Patch 0.1.0-test.7 */
(function(){
  if(typeof PornhubRemoteRuntime!=='object'||typeof PornhubCore!=='object')throw new Error('Pornhub Test7 runtime preflight failed');
  var R=PornhubRemoteRuntime,C=PornhubCore;
  var A='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/pornhub/assets/';
  R.version='0.1.0-test.7';R.build=10107;

  function add(d,x){d.push(x);}
  function title(t){try{setPageTitle(t);}catch(e){}}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  function smallIcon(d,t,ico,url){add(d,{title:t,pic_url:A+ico+'.svg',col_type:'icon_small_4',url:url,extra:{lineVisible:false}});}
  function action(d,t,ico,url){add(d,{title:t,pic_url:A+ico+'.svg',col_type:'icon_small_3',url:url,extra:{lineVisible:false}});}
  function tab(label,value,key,active){return{title:(active?'● ':'')+label,col_type:'flex_button',url:$('#noLoading#').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,value),extra:{lineVisible:false}};}
  function empty(d,t,desc,url){section(d,t,desc);if(url)add(d,{title:'在 Pornhub X5 中打开',desc:'使用官方网页查看',col_type:'text_1',url:'x5://'+url,extra:{lineVisible:false}});}
  function videoCard(c){return{title:C.decode(c.title||'Video'),desc:c.desc||'',pic_url:c.img||'',url:C.page('pornhubDetail',{u:c.url}),col_type:'movie_2',extra:{id:'ph_video7_'+C.hash(c.url),lineVisible:false}};}
  function renderVideos(d,a,limit){limit=limit||a.length;for(var i=0;i<a.length&&i<limit;i++)add(d,videoCard(a[i]));}
  function accountListUrl(kind,name){
    if(!C.accountReady())return C.page('pornhubLogin');
    if((kind==='history'||kind==='favorites')&&C.accountIdentityReady&&!C.accountIdentityReady())return C.page('pornhubAccount');
    return C.page('pornhubAccountList',{kind:kind,n:name});
  }

  R.home=function(){
    title('Pornhub');var d=[],ready=C.accountReady(),identity=C.accountIdentityReady&&C.accountIdentityReady(),name=C.accountName(),mode=getMyVar('ph_home_feed6',ready?'recommended':'recent');
    if(!ready&&(mode==='recommended'||mode==='feed'))mode='recent';
    add(d,{title:'Pornhub'+(name?' · '+name:''),desc:ready?'账号推荐已启用 · 多画质播放':'公开浏览 · 登录后自动使用账号推荐',pic_url:A+'icon.svg',col_type:'avatar',url:ready?C.page('pornhubAccount'):C.page('pornhubLogin'),extra:{lineVisible:false}});

    smallIcon(d,'站内收藏','favorite',accountListUrl('favorites','站内收藏'));
    smallIcon(d,'观看历史','history',accountListUrl('history','观看历史'));
    smallIcon(d,'本地收藏','local',C.page('pornhubLocalFavorites'));
    smallIcon(d,'本地足迹','history',C.page('pornhubLocalHistory'));

    smallIcon(d,'搜索','search',C.page('pornhubSearch'));
    smallIcon(d,'分类','categories',C.page('pornhubCategories'));
    smallIcon(d,'创作者','creators',C.page('pornhubCreators'));
    smallIcon(d,'订阅','feed',ready?C.page('pornhubSubscriptions'):C.page('pornhubLogin'));

    smallIcon(d,'片单','favorite',C.page('pornhubPlaylists'));
    smallIcon(d,'Shorts','shorts',C.page('pornhubShorts'));
    smallIcon(d,'GIF','gifs',C.page('pornhubGifs'));
    smallIcon(d,'我的','account',ready?C.page('pornhubAccount'):C.page('pornhubLogin'));

    add(d,tab('为你推荐','recommended','ph_home_feed6',mode==='recommended'));
    add(d,tab('Feed','feed','ph_home_feed6',mode==='feed'));
    add(d,tab('最新','recent','ph_home_feed6',mode==='recent'));
    add(d,tab('热门','viewed','ph_home_feed6',mode==='viewed'));
    add(d,tab('高分','rated','ph_home_feed6',mode==='rated'));

    var r=C.homeFeed(mode,1),desc='';
    if(r.source==='account')desc='账号内容 · '+r.cards.length+' 项';
    else if(r.source==='fallback')desc='账号推荐暂未解析，已回退公开内容 · '+r.cards.length+' 项';
    else desc='公开内容 · '+r.cards.length+' 项';
    section(d,r.name||'视频',desc);renderVideos(d,r.cards,24);
    if(!r.cards.length)empty(d,'当前没有可展示内容','可切换最新/热门，或在 X5 检查账号和网络状态。',r.url||C.base()+'/video');
    setResult(d);
  };

  R.shorts=function(){
    var page=C.pageNo(),d=[],r=C.shortList(page);title('Shorts');
    section(d,'Shorts',r.cards.length?('找到 '+r.cards.length+' 个短视频'):'当前页没有解析到短视频');
    renderVideos(d,r.cards);
    if(!r.cards.length&&page===1)empty(d,'Shorts 暂不可用','Test7 已按当前 /shorties/<id> 实体重新解析；若仍为空需继续根据实机 HTML 收敛。',r.url);
    setResult(d);
  };

  R.playlists=function(){
    var page=C.pageNo(),d=[],r=C.playlistList(page);title('播放列表');
    section(d,'公开片单',r.cards.length?('共 '+r.cards.length+' 个'):'当前页没有解析到有效片单');
    for(var i=0;i<r.cards.length;i++){
      var p=r.cards[i];
      add(d,{title:p.title||'片单',desc:p.desc||'',pic_url:p.img||A+'icon.svg',col_type:'movie_2',url:C.page('pornhubPlaylistDetail',{u:p.url,n:p.title||'',im:p.rawImg||''}),extra:{lineVisible:false,id:'ph_playlist7_'+C.hash(p.url)}});
    }
    if(!r.cards.length&&page===1)empty(d,'暂无可展示片单','当前页面没有识别到真实 playlist 卡片。',r.url);
    setResult(d);
  };

  R.playlistDetail=function(){
    var u=C.param('u',''),seed=C.param('n',''),seedImg=C.param('im',''),d=[];
    if(!u){empty(d,'缺少片单地址','');setResult(d);return;}
    var key='ph_playlist_loaded7_'+C.hash(u),loaded=parseInt(getMyVar(key,'1'),10)||1,first=C.playlistDetail(u,1),pages=first.pages||1;
    if(loaded>pages)loaded=pages;
    var name=first.title&&first.title!=='片单'?first.title:(seed||'片单'),pic=first.img||(seedImg?C.image(seedImg,u):A+'icon.svg'),local=C.isEntityFav(C.playlistFavoriteKey,u),videos=[],seen={},p,i,x,v;
    title(name);
    add(d,{title:name,desc:first.desc||(first.count?('共 '+first.count+' 个视频'):'公开片单'),pic_url:pic,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    action(d,'在线收藏','favorite',$(u).lazyRule(function(boot,target){
      require(boot,{headers:{'Cache-Control':'no-cache'}},10107);PornhubBoot.loadOnly();var r=PornhubCore.togglePlaylistOnline(target);if(r.web)return'x5://'+target;refreshPage(false);return'toast://'+r.message;
    },C.bootstrap,u));
    action(d,local?'取消本地收藏':'本地收藏','local',$(u).lazyRule(function(boot,target,n,im,desc){
      require(boot,{headers:{'Cache-Control':'no-cache'}},10107);PornhubBoot.loadOnly();var on=PornhubCore.toggleEntityFav(PornhubCore.playlistFavoriteKey,{url:target,title:n,rawImg:im,img:PornhubCore.image(im,target),desc:desc});refreshPage(false);return'toast://'+(on?'已收藏片单到本机':'已取消本地片单收藏');
    },C.bootstrap,u,name,first.rawImg||seedImg,first.desc||'片单'));
    action(d,'官方片单','account','x5://'+u);

    for(p=1;p<=loaded;p++){
      x=p===1?first:C.playlistDetail(u,p);
      for(i=0;i<x.videos.length;i++){v=x.videos[i];if(!seen[v.url]){seen[v.url]=1;videos.push(v);}}
    }
    section(d,'片单视频',first.count?('已加载 '+videos.length+' / '+first.count):('已加载 '+videos.length+' 个'));
    renderVideos(d,videos);
    if(loaded<pages){
      add(d,{title:'加载更多 · 第 '+(loaded+1)+' / '+pages+' 页',col_type:'text_center_1',url:$('#noLoading#').lazyRule(function(k,n){putMyVar(k,String(n));refreshPage(false);return'hiker://empty';},key,loaded+1),extra:{lineVisible:false}});
    }
    if(!videos.length)empty(d,'片单视频暂未识别','可以打开官方片单页继续核对当前页面结构。',u);
    setResult(d);
  };

  R.module=function(){return R;};
})();
