/* 溏心次元 0.1.0-test.4 Runtime patch: Cloudflare verification UX */
(function(){
  if(typeof TxcyRemoteRuntime==='undefined'||typeof TxcyCore==='undefined')throw new Error('Txcy Test4 runtime preflight failed');
  var R=TxcyRemoteRuntime,C=TxcyCore,ICON='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/tangxincyuan/assets/icon.svg?v=202608234';
  R.version='0.1.0-test.4';R.build=10104;
  function add(d,x){d.push(x);}function title(t){try{setPageTitle(t);}catch(e){}}
  function heading(d,t,desc){add(d,{title:'‘‘’’<b>'+t+'</b>',desc:desc||'',col_type:'rich_text',url:'hiker://empty',extra:{lineVisible:false}});}
  function line(d){add(d,{col_type:'line'});}
  function searchUrl(){return"(function(){var q=String(input||'').trim();return 'hiker://page/txcySearch?rule=&simple=true&q='+encodeURIComponent(q);})()";}
  function postCard(p){return{title:p.title||'内容',desc:p.desc||p.category||'',pic_url:p.img||ICON,url:C.page('txcyDetail',{post_url:p.url}),col_type:'movie_2',extra:{id:'txcy4_post_'+C.hash(p.url),lineVisible:false}};}
  function renderPosts(d,a,n){n=n||a.length;for(var i=0;i<a.length&&i<n;i++)add(d,postCard(a[i]));}
  function catCard(x){return{title:x.name,pic_url:x.img||'',col_type:x.img?'pic_3_square':'flex_button',url:C.page('txcyFeed',{cat_url:x.url,cat_name:x.name}),extra:{lineVisible:false}};}
  function personCard(x){return{title:x.name,pic_url:x.img||ICON,col_type:'icon_4',url:C.page('txcyFeed',{cat_url:x.url,cat_name:x.name}),extra:{lineVisible:false}};}
  function syncAction(backOnSuccess){
    return $(C.root()).lazyRule(function(boot,closeOnOk){
      require(boot,{headers:{'Cache-Control':'no-cache'}},10104);TxcyBoot.loadOnly();
      var r=TxcyCore.syncWebSession();
      if(r.ok){if(closeOnOk){try{back(true);}catch(e){try{refreshPage(false);}catch(e2){}}}else{try{refreshPage(false);}catch(e3){}}}
      return'toast://'+r.message;
    },C.bootstrap,!!backOnSuccess);
  }
  function verifyPanel(d,compact){
    var st=C.cfStatus(),live=st.live||{},state=st.state||{};
    if(!compact){add(d,{title:'站点安全验证',desc:'当前站点启用了 Cloudflare 安全验证。首次或会话过期时，在真实 X5 页面完成验证；之后小程序会自动复用同一 Cookie 与 UA。',pic_url:ICON,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});}
    add(d,{title:'① 打开安全验证',desc:'在 X5 中等待自动验证；如出现人机确认请手动完成，然后返回',col_type:'text_center_1',url:'x5://'+C.root(),extra:{lineVisible:false,ua:C.ua,referer:C.root()}});
    add(d,{title:'② 验证完成，检查会话',desc:live.hasCookie?('已检测到 '+live.count+' 个 Cookie · '+live.fingerprint):'当前还没有检测到浏览器 Cookie',col_type:'text_center_1',url:syncAction(true),extra:{lineVisible:false}});
    add(d,{title:'会话状态',desc:(state.ok?'上次检查已通过':'尚未确认通过')+' · '+(live.hasClearance?'已检测到 clearance':'未检测到 clearance')+(state.verifiedAt?' · 验证时间 '+new Date(state.verifiedAt).toLocaleString():''),col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
  }
  function challengePage(){title('站点安全验证');var d=[];verifyPanel(d,false);line(d);add(d,{title:'说明',desc:'这里不破解验证码，也不伪造验证令牌。验证由站点自己的 Cloudflare 页面完成，小程序只复用验证后产生的浏览器会话。通常首次验证或 Cookie 过期时需要重新执行。',col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});setResult(d);}
  R.verify=challengePage;

  R.home=function(){
    var p=C.pageNo(),d=[],r,cats=[],stars=[],nav=[],i;
    if(p===1){
      title('溏心次元');
      add(d,{title:'溏心次元',desc:'分类 · 人物 · 搜索 · 收藏',pic_url:ICON,url:C.page('txcySettings'),col_type:'movie_1_left_pic',extra:{lineVisible:false}});
      add(d,{title:'搜索内容',desc:'输入关键词搜索当前站点',col_type:'input',url:searchUrl(),extra:{defaultValue:''}});
      add(d,{title:'▦ 分类',col_type:'text_4',url:C.page('txcyHub')});
      add(d,{title:'◎ 人物',col_type:'text_4',url:C.page('txcyStars')});
      add(d,{title:'★ 收藏',col_type:'text_4',url:C.page('txcyFavorites')});
      add(d,{title:'◷ 历史',col_type:'text_4',url:C.page('txcyHistory')});
    }
    r=C.home(p);
    if(p===1&&(r.challenge||C.isChallengePage(r.html))){
      heading(d,'需要完成站点安全验证','当前普通请求只拿到了 Cloudflare 验证页');
      add(d,{title:'进入验证向导',desc:'验证一次后，首页 / 分类 / 搜索 / 详情都会自动复用当前会话',col_type:'text_center_1',url:C.page('txcyVerify'),extra:{lineVisible:false}});
      var st=C.cfStatus();add(d,{title:'当前检测',desc:'HTML '+(r.html?r.html.length:0)+' · Cookie '+(st.live.hasCookie?st.live.count:0)+' · '+(st.live.hasClearance?'clearance 已存在':'clearance 未检测到'),col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
      setResult(d);return;
    }
    if(p===1&&r&&r.html){nav=C.extractNav(r.html,r.url);cats=C.extractCategories(r.html,r.url);stars=C.extractStars(r.html,r.url);}
    if(p===1&&nav.length){heading(d,'主导航','从当前网页实时识别');for(i=0;i<nav.length&&i<12;i++)add(d,{title:nav[i].name,col_type:'scroll_button',url:/女优|女優|人物|演员|演員/.test(nav[i].name)?C.page('txcyStars'):C.page('txcyFeed',{cat_url:nav[i].url,cat_name:nav[i].name})});}
    if(p===1&&stars.length){heading(d,'热门人物','头像入口');for(i=0;i<stars.length&&i<12;i++)add(d,personCard(stars[i]));}
    if(p===1&&cats.length){heading(d,'分类频道','栏目、系列与片商');for(i=0;i<cats.length&&i<12;i++)add(d,catCard(cats[i]));add(d,{title:'查看全部分类',col_type:'text_center_1',url:C.page('txcyHub'),extra:{lineVisible:false}});}
    if(p===1)heading(d,'最新内容',r&&r.posts&&r.posts.length?'已识别 '+r.posts.length+' 条':'等待真实首页数据');
    renderPosts(d,(r&&r.posts)||[]);
    if(p===1&&(!r||!r.posts||!r.posts.length)){
      var fd=C.fetchDiag();add(d,{title:'当前首页诊断',desc:'请求 '+(r&&r.ok?'成功':'失败')+' · HTML '+(r&&r.html?r.html.length:0)+(fd.title?' · '+fd.title:'')+(fd.head?'\n'+fd.head:''),col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});
      add(d,{title:'设置与诊断',col_type:'text_2',url:C.page('txcySettings'),extra:{lineVisible:false}});add(d,{title:'打开当前网页',col_type:'text_2',url:'x5://'+C.root(),extra:{lineVisible:false,ua:C.ua,referer:C.root()}});
    }
    setResult(d);
  };

  R.categoryHub=function(){
    title('分类中心');var d=[],r=C.request(C.root(),{route:'hub4',noRetry:true}),a,g,order=['栏目','系列','片商'],i,j,k;
    if(r.challenge||C.isChallengePage(r.html)){verifyPanel(d,false);setResult(d);return;}
    a=r.ok?C.extractCategories(r.html,r.url):[];g={栏目:[],系列:[],片商:[],女优:[]};for(i=0;i<a.length;i++){k=a[i].group||C.categoryGroup(a[i].name);if(!g[k])g[k]=[];g[k].push(a[i]);}
    add(d,{title:'分类中心',desc:a.length?'已识别 '+a.length+' 个官网分类':'等待真实分类结构',pic_url:ICON,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    for(i=0;i<order.length;i++){k=order[i];if(!g[k]||!g[k].length)continue;heading(d,k,'');for(j=0;j<g[k].length;j++)add(d,catCard(g[k][j]));line(d);}if(!a.length)add(d,{title:'当前未解析到分类',desc:'请先确认站点验证已经通过；验证通过后仍为空再继续做专用 DOM 适配。',col_type:'long_text',url:C.page('txcyVerify')});setResult(d);
  };
  R.stars=function(){title('人物中心');var d=[],r=C.request(C.root(),{route:'people4',noRetry:true}),a,i;if(r.challenge||C.isChallengePage(r.html)){verifyPanel(d,false);setResult(d);return;}a=r.ok?C.extractStars(r.html,r.url):[];add(d,{title:'人物中心',desc:a.length?'已识别 '+a.length+' 位':'等待真实人物结构',pic_url:ICON,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});for(i=0;i<a.length;i++)add(d,personCard(a[i]));if(!a.length)add(d,{title:'人物结构暂未识别',desc:'验证已经不是首要障碍后，再根据真实页面继续适配头像与人物链接。',col_type:'long_text',url:'hiker://empty'});setResult(d);};
  R.categoryFeed=function(){var u=C.param('cat_url',C.root()),n=C.param('cat_name','分类'),p=C.pageNo(),d=[],r;if(C.restrictedText(n)){add(d,{title:'该分类未开放',col_type:'text_center_1',url:'hiker://empty'});setResult(d);return;}title(n);r=C.category(u,p);if(r.challenge||C.isChallengePage(r.html)){verifyPanel(d,false);setResult(d);return;}if(p===1){add(d,{title:'‹ 分类中心',col_type:'scroll_button',url:C.page('txcyHub')});add(d,{title:n,desc:'按当前网页分类加载',pic_url:ICON,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});}renderPosts(d,r.posts||[]);if(p===1&&(!r.posts||!r.posts.length))add(d,{title:'该分类暂未识别到内容',desc:'站点已不再返回安全验证页；下一步按真实分类 DOM / API 继续适配。',col_type:'long_text',url:'hiker://empty'});setResult(d);};
  R.searchPage=function(){var q=C.param('q',''),p=C.pageNo(),d=[],r;title(q?'搜索 · '+q:'搜索');if(p===1){add(d,{title:'搜索溏心次元',desc:q||'输入关键词',col_type:'input',url:searchUrl(),extra:{defaultValue:q}});if(!q){add(d,{title:'搜索提示',desc:'先完成站点验证，再按官网实际搜索协议取结果。',col_type:'long_text',url:'hiker://empty'});setResult(d);return;}}if(C.restrictedText(q)){add(d,{title:'该关键词未开放搜索',col_type:'text_center_1',url:'hiker://empty'});setResult(d);return;}r=C.search(q,p);if(r.challenge||C.isChallengePage(r.html)){verifyPanel(d,false);setResult(d);return;}renderPosts(d,r.posts||[]);if(p===1&&(!r.posts||!r.posts.length))add(d,{title:'暂无匹配结果',desc:'如果验证已通过，则下一版按真实搜索表单/AJAX 精确适配。',col_type:'long_text',url:'hiker://empty'});setResult(d);};

  R.search=function(){var q='';try{q=String(MY_KEYWORD||'');}catch(e){q=C.param('q','');}var d=[],r;if(!q||C.restrictedText(q)){setResult(d);return;}r=C.search(q,C.pageNo());if(r.challenge||C.isChallengePage(r.html)){add(d,{title:'需要先完成站点安全验证',desc:'进入小程序首页或设置中的验证向导完成官网验证。',pic_url:ICON,col_type:'movie_1_left_pic',url:C.page('txcyVerify'),extra:{lineVisible:false}});setResult(d);return;}renderPosts(d,r.posts||[]);if(!r.posts||!r.posts.length)add(d,{title:'没有匹配结果',desc:'验证已通过后仍为空，再继续适配官网搜索协议。',col_type:'text_1',url:'hiker://empty'});setResult(d);};

  R.detail=function(){
    var u=C.param('post_url',''),d=[],x,i,ds,media;if(!u){add(d,{title:'缺少详情地址',col_type:'text_center_1',url:'hiker://empty'});setResult(d);return;}
    x=C.detail(u);title(x.title||'内容详情');if(x&&x.challenge){verifyPanel(d,false);setResult(d);return;}if(x.blocked){add(d,{title:'该条目未开放',col_type:'text_center_1',url:'hiker://empty'});setResult(d);return;}if(!x.ok){add(d,{title:'详情读取失败',desc:'站点会话已通过但详情结构暂未识别。',col_type:'text_1',url:'hiker://empty'});setResult(d);return;}
    ds=[x.categories.length?x.categories[0].name:'',x.date].filter(function(v){return!!v;}).join(' · ');C.addHistory({url:x.url,title:x.title,img:C.image(x.cover,x.url),rawImg:x.cover,desc:ds,category:x.categories.length?x.categories[0].name:''});
    add(d,{title:x.title,desc:ds||'溏心次元',pic_url:C.image(x.cover,x.url)||ICON,url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    if(x.media.length){media=JSON.stringify(x.media);add(d,{title:'▶ 立即播放',desc:x.media.length===1?'已提取播放地址':'可选 '+x.media.length+' 条线路',col_type:'text_center_1',url:$(media,x.url).lazyRule(function(boot,m,ref){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);TxcyBoot.loadOnly();var a=[];try{a=JSON.parse(m)||[];}catch(e){}var r=TxcyCore.playMedia(a,ref);return r||TxcyCore.resolvePlay(ref);},C.bootstrap,media,x.url),extra:{lineVisible:false}});}else{add(d,{title:'▶ 尝试播放',desc:x.iframes.length?'检测到网页播放器，使用媒体嗅探兜底':'暂未识别直链，使用网页媒体嗅探',col_type:'text_center_1',url:$(x.url).lazyRule(function(boot,target){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);TxcyBoot.loadOnly();return TxcyCore.resolvePlay(target);},C.bootstrap,x.url),extra:{lineVisible:false}});}
    line(d);
    add(d,{title:C.isFavorite(x.url)?'★ 已收藏':'☆ 收藏',col_type:'text_3',url:$(x.url,x.title,x.cover,ds,x.categories.length?x.categories[0].name:'').lazyRule(function(boot,target,tt,cv,desc,cat){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);TxcyBoot.loadOnly();var on=TxcyCore.toggleFavorite({url:target,title:tt,rawImg:cv,img:TxcyCore.image(cv,target),desc:desc,category:cat});refreshPage(false);return'toast://'+(on?'已加入收藏':'已取消收藏');},C.bootstrap,x.url,x.title,x.cover,ds,x.categories.length?x.categories[0].name:''),extra:{lineVisible:false}});
    add(d,{title:'原网页',col_type:'text_3',url:'x5://'+x.url,extra:{lineVisible:false,ua:C.ua,referer:x.url}});add(d,{title:'设置',col_type:'text_3',url:C.page('txcySettings'),extra:{lineVisible:false}});
    if(x.categories.length){heading(d,'分类标签','');for(i=0;i<x.categories.length&&i<12;i++)add(d,{title:x.categories[i].name,col_type:'scroll_button',url:C.page('txcyFeed',{cat_url:x.categories[i].url,cat_name:x.categories[i].name})});}
    if(x.paragraphs.length){heading(d,'简介与信息','');for(i=0;i<x.paragraphs.length&&i<30;i++)add(d,{title:x.paragraphs[i],col_type:'rich_text',url:'hiker://empty',extra:{lineVisible:false}});}
    if(x.images.length>1){heading(d,'相关图片','共 '+x.images.length+' 张');for(i=0;i<x.images.length&&i<30;i++)add(d,{title:'',pic_url:C.image(x.images[i],x.url),col_type:'pic_1_full',url:x.images[i],extra:{lineVisible:false}});}
    if(x.related.length){heading(d,'相关推荐','');renderPosts(d,x.related,14);}setResult(d);
  };

  R.favorites=function(){title('本地收藏');var d=[],a=C.safeList(C.readList(C.favoriteKey));add(d,{title:'我的收藏',desc:a.length+' 项 · 仅保存在本机',pic_url:ICON,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});renderPosts(d,a);if(!a.length)add(d,{title:'还没有收藏',desc:'从详情页点击收藏。',col_type:'text_1',url:'hiker://empty'});setResult(d);};
  R.history=function(){title('浏览历史');var d=[],a=C.safeList(C.readList(C.historyKey));add(d,{title:'最近浏览',desc:a.length+' 项 · 进入详情页自动记录',pic_url:ICON,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});renderPosts(d,a);if(!a.length)add(d,{title:'暂无历史',desc:'浏览详情后会自动记录。',col_type:'text_1',url:'hiker://empty'});setResult(d);};

  R.settings=function(){
    title('设置与诊断');var d=[],st=C.cfStatus(),fd=C.fetchDiag(),root=C.root();
    add(d,{title:'溏心次元 · Test4',desc:R.version+' · Build '+R.build+' · Cloudflare Session Bridge',pic_url:ICON,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    heading(d,'站点会话','验证由官网 Cloudflare 页面完成，小程序只复用会话');
    add(d,{title:'当前状态',desc:(st.state.ok?'已验证':'未确认')+' · Cookie '+st.live.count+' · '+(st.live.hasClearance?'检测到 clearance':'未检测到 clearance')+' · '+st.live.fingerprint,col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'打开安全验证',desc:root,col_type:'text_1',url:C.page('txcyVerify'),extra:{lineVisible:false}});
    add(d,{title:'立即检查当前 X5 会话',desc:'读取浏览器 Cookie 并重新请求首页',col_type:'text_1',url:syncAction(false),extra:{lineVisible:false}});
    heading(d,'最近请求','');
    add(d,{title:fd.challenge?'最近一次命中安全验证':'最近一次未判定为安全验证',desc:(fd.url||root)+'\nHTML '+(fd.len||0)+(fd.title?' · '+fd.title:'')+(fd.head?'\n'+fd.head:'')+(fd.error?'\n错误 '+fd.error:''),col_type:'long_text',url:'hiker://empty',extra:{lineVisible:false}});
    add(d,{title:'打开当前网页',col_type:'text_center_1',url:'x5://'+root,extra:{lineVisible:false,ua:C.ua,referer:root}});
    setResult(d);
  };

  R.module=function(){return R;};
})();
