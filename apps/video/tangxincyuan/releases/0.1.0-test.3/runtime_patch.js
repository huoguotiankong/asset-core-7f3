/* 溏心次元 0.1.0-test.3 Runtime patch: usable navigation + visible diagnostics */
(function(){
  if(typeof TxcyRemoteRuntime==='undefined'||typeof TxcyCore==='undefined')throw new Error('Txcy Test3 runtime preflight failed');
  var R=TxcyRemoteRuntime,C=TxcyCore,ICON='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/tangxincyuan/assets/icon.svg?v=202608233';
  R.version='0.1.0-test.3';R.build=10103;
  function add(d,x){d.push(x);}function pageTitle(t){try{setPageTitle(t);}catch(e){}}
  function heading(d,t,desc){add(d,{title:'‘‘’’<b>'+t+'</b>',desc:desc||'',col_type:'rich_text',url:'hiker://empty',extra:{lineVisible:false}});}
  function searchUrl(){return"(function(){var q=String(input||'').trim();return 'hiker://page/txcySearch?rule=&simple=true&q='+encodeURIComponent(q);})()";}
  function postCard(p){return{title:p.title||'内容',desc:p.desc||p.category||'',pic_url:p.img||ICON,url:C.page('txcyDetail',{post_url:p.url}),col_type:'movie_2',extra:{id:'txcy_post_'+C.hash(p.url),lineVisible:false}};}
  function catCard(x){return{title:x.name,pic_url:x.img||'',col_type:x.img?'pic_3_square':'flex_button',url:C.page('txcyFeed',{cat_url:x.url,cat_name:x.name}),extra:{lineVisible:false}};}
  function personCard(x){return{title:x.name,pic_url:x.img||ICON,col_type:'icon_4',url:C.page('txcyFeed',{cat_url:x.url,cat_name:x.name}),extra:{lineVisible:false}};}
  function renderPosts(d,a,n){n=n||a.length;for(var i=0;i<a.length&&i<n;i++)add(d,postCard(a[i]));}
  function diagText(r,cats,stars,nav){var fd=C.fetchDiag?C.fetchDiag():{},a=[];a.push('请求：'+(r&&r.ok?'已取得页面':'失败'));a.push('HTML：'+(r&&r.html?r.html.length:0));a.push('内容卡：'+(r&&r.posts?r.posts.length:0));a.push('分类：'+(cats?cats.length:0));a.push('人物：'+(stars?stars.length:0));a.push('导航：'+(nav?nav.length:0));if(fd.title)a.push('网页标题：'+fd.title);if(fd.error)a.push('请求错误：'+fd.error);if(fd.head)a.push('页面摘要：'+fd.head);return a.join('\n');}

  R.home=function(){
    var p=C.pageNo(),d=[],r,cats=[],stars=[],nav=[],i;
    if(p===1){
      pageTitle('溏心次元');
      add(d,{title:'溏心次元',desc:'分类 · 人物 · 搜索 · 收藏',pic_url:ICON,url:C.page('txcySettings'),col_type:'movie_1_left_pic',extra:{lineVisible:false}});
      add(d,{title:'搜索内容',desc:'输入关键词搜索当前站点',col_type:'input',url:searchUrl(),extra:{defaultValue:''}});
      add(d,{title:'▦ 分类',col_type:'text_4',url:C.page('txcyHub')});
      add(d,{title:'◎ 人物',col_type:'text_4',url:C.page('txcyStars')});
      add(d,{title:'★ 收藏',col_type:'text_4',url:C.page('txcyFavorites')});
      add(d,{title:'◷ 历史',col_type:'text_4',url:C.page('txcyHistory')});
    }
    r=C.home(p);
    if(p===1&&r&&r.html){nav=C.extractNav(r.html,r.url);cats=C.extractCategories(r.html,r.url);stars=C.extractStars(r.html,r.url);}
    if(p===1&&nav.length){heading(d,'主导航','从当前网页实时识别');for(i=0;i<nav.length&&i<12;i++)add(d,{title:nav[i].name,col_type:'scroll_button',url:/女优|女優|人物|演员|演員/.test(nav[i].name)?C.page('txcyStars'):C.page('txcyFeed',{cat_url:nav[i].url,cat_name:nav[i].name})});}
    if(p===1&&stars.length){heading(d,'热门人物','头像入口');for(i=0;i<stars.length&&i<12;i++)add(d,personCard(stars[i]));}
    if(p===1&&cats.length){heading(d,'分类频道','栏目、系列与片商');for(i=0;i<cats.length&&i<12;i++)add(d,catCard(cats[i]));add(d,{title:'查看全部分类',col_type:'text_center_1',url:C.page('txcyHub'),extra:{lineVisible:false}});}
    if(p===1)heading(d,'最新内容',r&&r.posts&&r.posts.length?'已识别 '+r.posts.length+' 条':'正在锁定真实页面结构');
    renderPosts(d,(r&&r.posts)||[]);
    if(p===1&&(!r||!r.posts||!r.posts.length)){
      add(d,{title:'当前首页解析诊断',desc:diagText(r,cats,stars,nav),col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});
      add(d,{title:'设置与诊断',col_type:'text_2',url:C.page('txcySettings'),extra:{lineVisible:false}});
      add(d,{title:'打开当前网页',col_type:'text_2',url:'x5://'+C.root(),extra:{lineVisible:false}});
    }
    setResult(d);
  };

  R.stars=function(){
    pageTitle('人物中心');var d=[],r=C.request(C.root(),{route:'people3',noRetry:true}),a=r.ok?C.extractStars(r.html,r.url):[],i;
    add(d,{title:'人物中心',desc:a.length?'已识别 '+a.length+' 位':'等待锁定人物节点',pic_url:ICON,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    for(i=0;i<a.length;i++)add(d,personCard(a[i]));
    if(!a.length)add(d,{title:'人物结构暂未识别',desc:diagText({ok:r.ok,html:r.html,posts:[]},[],a,[]),col_type:'long_text',url:'hiker://empty'});
    setResult(d);
  };

  R.categoryFeed=function(){
    var u=C.param('cat_url',C.root()),n=C.param('cat_name','分类'),p=C.pageNo(),d=[],r;
    if(C.restrictedText(n)){add(d,{title:'该分类未开放',col_type:'text_center_1',url:'hiker://empty'});setResult(d);return;}
    pageTitle(n);if(p===1){add(d,{title:'‹ 分类中心',col_type:'scroll_button',url:C.page('txcyHub')});add(d,{title:n,desc:'按当前网页分类加载',pic_url:ICON,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});}
    r=C.category(u,p);renderPosts(d,r.posts||[]);
    if(p===1&&(!r.posts||!r.posts.length))add(d,{title:'该分类暂未识别到内容',desc:diagText(r,[],[],[]),col_type:'long_text',url:'hiker://empty'});
    setResult(d);
  };

  R.searchPage=function(){
    var q=C.param('q',''),p=C.pageNo(),d=[],r;pageTitle(q?'搜索 · '+q:'搜索');
    if(p===1){add(d,{title:'搜索溏心次元',desc:q||'输入关键词',col_type:'input',url:searchUrl(),extra:{defaultValue:q}});if(!q){add(d,{title:'搜索提示',desc:'输入关键词后开始搜索；若官网使用动态接口，诊断会显示返回页面信息。',col_type:'long_text',url:'hiker://empty'});setResult(d);return;}}
    if(C.restrictedText(q)){add(d,{title:'该关键词未开放搜索',col_type:'text_center_1',url:'hiker://empty'});setResult(d);return;}
    r=C.search(q,p);renderPosts(d,r.posts||[]);if(p===1&&(!r.posts||!r.posts.length))add(d,{title:'暂无匹配结果',desc:diagText(r,[],[],[]),col_type:'long_text',url:'hiker://empty'});setResult(d);
  };

  R.settings=function(){
    pageTitle('设置与诊断');var d=[],root=C.root(),probe=C.request(root,{route:'settings3',noRetry:true}),posts=probe.ok?C.parseCards(probe.html,probe.url):[],cats=probe.ok?C.extractCategories(probe.html,probe.url):[],stars=probe.ok?C.extractStars(probe.html,probe.url):[],nav=probe.ok?C.extractNav(probe.html,probe.url):[],fd=C.fetchDiag?C.fetchDiag():{},last=C.lastDiag();
    add(d,{title:'溏心次元 · Test3',desc:R.version+' · Build '+R.build+' · CDN Direct',pic_url:ICON,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    heading(d,'站点状态','下一轮精确适配所需的实机事实');
    add(d,{title:'当前入口',desc:root,col_type:'long_text',url:'hiker://empty'});
    add(d,{title:'首页探测',desc:diagText({ok:probe.ok,html:probe.html,posts:posts},cats,stars,nav),col_type:'long_text',url:'hiker://empty'});
    if(fd.url)add(d,{title:'最近请求',desc:fd.url+'\n长度 '+(fd.len||0)+(fd.title?'\n标题 '+fd.title:'')+(fd.head?'\n摘要 '+fd.head:'')+(fd.error?'\n错误 '+fd.error:''),col_type:'long_text',url:'hiker://empty'});
    if(last&&last.stage)add(d,{title:'最近 Core 诊断',desc:[last.stage,last.route,last.error,last.extra?JSON.stringify(last.extra):''].filter(function(v){return!!v;}).join(' · '),col_type:'long_text',url:'hiker://empty'});
    add(d,{title:'打开当前网页',col_type:'text_center_1',url:'x5://'+root,extra:{lineVisible:false}});
    setResult(d);
  };

  R.module=function(){return R;};
})();