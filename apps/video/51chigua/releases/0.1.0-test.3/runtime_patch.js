/* 51吃瓜 Runtime Patch 0.1.0-test.3 */
(function(){
  if(typeof Cg51RemoteRuntime==='undefined') throw new Error('Cg51RemoteRuntime missing');
  var R=Cg51RemoteRuntime,C=Cg51Core;
  R.version='0.1.0-test.3';R.build=10103;
  var AS='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/51chigua/assets/';
  function add(d,x){d.push(x);}
  function pageTitle(t){try{setPageTitle(t);}catch(e){}}
  function richSection(d,t,desc){add(d,{title:'‘‘’’<strong>'+t+'</strong>'+(desc?'<small><font color=#8A8A8A>　'+desc+'</font></small>':''),col_type:'rich_text',url:'hiker://empty',extra:{lineVisible:false}});}
  function divider(d){add(d,{col_type:'line'});}
  function postCard(p){return{title:p.title||'51吃瓜',desc:p.desc||'',pic_url:p.img||'',url:C.page('cg51Detail',{post_url:p.url}),col_type:'movie_2',extra:{id:'cg51_post_'+C.hash(p.url),lineVisible:false}};}
  function renderPosts(d,a,limit){var i,n=limit||a.length;for(i=0;i<a.length&&i<n;i++)add(d,postCard(a[i]));}
  function icon(d,title,pic,url){add(d,{title:title,pic_url:AS+pic,col_type:'icon_4',url:url,extra:{lineVisible:false}});}
  function catFeed(c){return C.page('cg51Feed',{cat_url:c.url||C.categoryUrl(c.slug),cat_name:c.name});}
  function searchInput(){return'input://'+JSON.stringify({value:'',hint:'搜索吃瓜内容',js:"'hiker://page/cg51Search?rule=51吃瓜&simple=true&q='+encodeURIComponent(input)"});}

  R.home=function(){
    var page=C.pageNo(),d=[],r,cats,i;
    if(page===1){
      pageTitle('51吃瓜');
      add(d,{title:'51吃瓜',desc:'吃瓜爆料 · 图文视频 · 自动切换可用域名',pic_url:'https://51cg1.com/favicon.ico',url:C.page('cg51Settings'),col_type:'movie_1_left_pic',extra:{lineVisible:false}});
      icon(d,'搜索','search.svg',searchInput());
      icon(d,'分类','categories.svg',C.page('cg51Hub'));
      icon(d,'收藏','favorite.svg',C.page('cg51Favorites'));
      icon(d,'历史','history.svg',C.page('cg51History'));
      cats=[
        {name:'今日吃瓜',slug:'wpcz'},{name:'学生校园',slug:'xsxy'},{name:'网红黑料',slug:'whhl'},
        {name:'热门大瓜',slug:'rdsj'},{name:'吃瓜榜单',slug:'mrdg'},{name:'必看大瓜',slug:'bkdg'},{name:'51剧场',slug:'51djc'}
      ];
      for(i=0;i<cats.length;i++)add(d,{title:cats[i].name,col_type:'scroll_button',url:catFeed(cats[i])});
      richSection(d,'最新内容','官网文章流 · 加密封面已解密');
    }
    r=C.home(page);renderPosts(d,r.posts);
    if(!r.posts.length&&page===1){
      richSection(d,'暂未解析到内容','可能是当前域名不可达或页面结构变化');
      add(d,{title:'打开当前官网',col_type:'text_center_1',url:C.base()+'/'});
    }
    setResult(d);
  };

  R.categories=R.categoryHub=function(){
    var d=[],groups=C.categoryGroups(),dynamic=C.categories(),known={},g,i,j,x,extra=[];
    pageTitle('分类');
    add(d,{title:'内容分类',desc:'按官网导航重新分组 · 点击分类直接进入内容',pic_url:AS+'categories.svg',url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    for(i=0;i<groups.length;i++)for(j=0;j<groups[i].items.length;j++)known[groups[i].items[j].slug]=1;
    for(i=0;i<dynamic.length;i++){
      x=dynamic[i];
      var m=C.pathOf(x.url).match(/\/category\/([^\/]+)/i),slug=m?m[1]:'';
      if(slug&&!known[slug])extra.push({name:x.name,slug:slug,url:x.url});
    }
    for(i=0;i<groups.length;i++){
      g=groups[i];
      richSection(d,g.name,g.desc);
      for(j=0;j<g.items.length;j++)add(d,{title:g.items[j].name,col_type:'flex_button',url:catFeed(g.items[j]),extra:{lineVisible:false}});
      if(i<groups.length-1)divider(d);
    }
    if(extra.length){
      divider(d);richSection(d,'更多分类','官网动态发现');
      for(i=0;i<extra.length;i++)add(d,{title:extra[i].name,col_type:'flex_button',url:catFeed(extra[i]),extra:{lineVisible:false}});
    }
    setResult(d);
  };

  R.category=R.categoryFeed=function(){
    var u=C.param('cat_url',C.categoryUrl('wpcz')),n=C.param('cat_name','分类'),p=C.pageNo(),d=[],r;
    pageTitle(n);
    if(p===1){
      add(d,{title:n,desc:'点击上方返回可重新选择分类',pic_url:AS+'categories.svg',url:C.page('cg51Hub'),col_type:'movie_1_left_pic',extra:{lineVisible:false}});
      add(d,{title:'全部分类',col_type:'scroll_button',url:C.page('cg51Hub')});
    }
    r=C.category(u,p);renderPosts(d,r.posts);
    if(!r.posts.length&&p===1){
      richSection(d,'该分类暂无可识别内容','当前地址：'+r.url);
      add(d,{title:'打开原站分类',col_type:'text_center_1',url:r.url});
    }
    setResult(d);
  };

  R.detail=function(){
    var u=C.param('post_url',''),d=[],x,i,ptext,playUrl,firstCat,favUrl;
    if(!u){richSection(d,'缺少文章地址','请从列表重新进入');setResult(d);return;}
    x=C.detail(u);pageTitle(x.title);
    if(!x.ok){richSection(d,'详情读取失败','当前域名或详情页暂不可用');add(d,{title:'打开原站',col_type:'text_center_1',url:u});setResult(d);return;}
    C.addHistory({url:x.url,title:x.title,img:C.image(x.cover,x.url),rawImg:x.cover,desc:[x.categories.length?x.categories[0].name:'',x.date].filter(function(v){return!!v;}).join(' · ')});
    add(d,{title:x.title,desc:[x.categories.length?x.categories[0].name:'',x.date,x.commentCount?x.commentCount+' 评论':''].filter(function(v){return!!v;}).join(' · '),pic_url:C.image(x.cover,x.url),url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    playUrl=C.playerContract(x.media,x.url);
    add(d,{title:'▶ 播放视频',desc:x.media.length?(x.media.length+' 个真实视频 · 播放器内切换'):'网页媒体提取',col_type:'text_center_1',url:playUrl,extra:{id:'cg51_primary_play_'+C.hash(x.url),lineVisible:false}});
    divider(d);
    favUrl=$(x.url).lazyRule(function(boot,target,tt,cv,ds){require(boot,{headers:{'Cache-Control':'no-cache'}},10103);Cg51Boot.loadOnly();var on=Cg51Core.toggleFavorite({url:target,title:tt,rawImg:cv,img:Cg51Core.image(cv,target),desc:ds});refreshPage(false);return'toast://'+(on?'已加入收藏':'已取消收藏');},C.bootstrap,x.url,x.title,x.cover,[x.categories.length?x.categories[0].name:'',x.date].filter(function(v){return!!v;}).join(' · '));
    icon(d,C.isFavorite(x.url)?'已收藏':'收藏','favorite.svg',favUrl);
    icon(d,'评论'+(x.commentCount?(' '+x.commentCount):''),'comment.svg',C.page('cg51Comments',{post_url:x.url,post_title:x.title}));
    firstCat=x.categories.length?x.categories[0]:null;
    icon(d,firstCat?firstCat.name:'分类','categories.svg',firstCat?C.page('cg51Feed',{cat_url:firstCat.url,cat_name:firstCat.name}):C.page('cg51Hub'));
    icon(d,'原站','web.svg',x.url);
    divider(d);

    if(x.paragraphs.length){
      richSection(d,'正文','');
      for(i=0;i<x.paragraphs.length&&i<60;i++){ptext=x.paragraphs[i];add(d,{title:ptext,col_type:'rich_text',url:'hiker://empty',extra:{lineVisible:false}});}
    }
    if(x.images.length){
      richSection(d,'图片','共 '+x.images.length+' 张');
      for(i=0;i<x.images.length&&i<80;i++)add(d,{title:'',pic_url:C.image(x.images[i],x.url),col_type:'pic_1_full',url:C.image(x.images[i],x.url),extra:{lineVisible:false}});
    }
    if(x.tags.length){
      divider(d);richSection(d,'相关标签','');
      for(i=0;i<x.tags.length&&i<24;i++)add(d,{title:x.tags[i].name,col_type:'flex_button',url:C.page('cg51Search',{q:x.tags[i].name})});
    }
    if(x.related.length){
      divider(d);richSection(d,'相关推荐','');renderPosts(d,x.related,12);
    }
    setResult(d);
  };

  R.comments=function(){
    var u=C.param('post_url',''),n=C.param('post_title','评论'),d=[],r,i,c,prefix;
    pageTitle('评论 · '+n);
    if(!u){richSection(d,'缺少文章地址','请重新进入');setResult(d);return;}
    r=C.comments(u);
    add(d,{title:'评论',desc:r.comments.length?('已读取 '+r.comments.length+' 条 · '+(r.source==='json'?'源站评论接口':'页面兼容解析')):'暂未读取到评论',pic_url:AS+'comment.svg',url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    for(i=0;i<r.comments.length;i++){
      c=r.comments[i];prefix=c.depth>0?'↳ ':'';
      add(d,{title:prefix+(c.author||'瓜友'),desc:(c.content||'')+(c.time?('\n'+c.time):''),pic_url:c.img||'',col_type:'avatar',url:'hiker://empty',extra:{lineVisible:false}});
    }
    if(!r.comments.length){
      richSection(d,'评论接口暂未返回可识别内容','源站使用 /comments/<文章ID>.json；如果该文章接口结构有变化，下一版继续按实机诊断收敛。');
      add(d,{title:'在原站查看评论',col_type:'text_center_1',url:u,extra:{lineVisible:false}});
    }
    setResult(d);
  };

  R.searchPage=function(){
    var q=C.param('q',''),p=C.pageNo(),d=[],r;
    pageTitle(q?'搜索 · '+q:'搜索');
    if(p===1)add(d,{title:'搜索关键词',desc:q||'输入关键词',col_type:'input',url:"(function(){var q=String(input||'').trim();return 'hiker://page/cg51Search?rule=51吃瓜&simple=true&q='+encodeURIComponent(q);})()",extra:{defaultValue:q}});
    if(!q){richSection(d,'开始搜索','输入关键词后搜索官网文章');setResult(d);return;}
    r=C.search(q,p);renderPosts(d,r.posts);
    if(!r.posts.length&&p===1){richSection(d,'没有匹配结果','可更换关键词');add(d,{title:'打开原站搜索',col_type:'text_center_1',url:r.url});}
    setResult(d);
  };

  R.module=function(){return R;};
})();