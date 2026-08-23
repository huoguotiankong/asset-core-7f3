/* 麻豆传媒 Remote Runtime 0.1.0-test.1 */
var MadouRemoteRuntime=(function(){
  var R={version:'0.1.0-test.1',build:10101};
  function add(d,x){d.push(x);}
  function title(t){try{setPageTitle(t);}catch(e){}}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  function routeCard(c){return MadouCore.page('madouDetail',{u:c.url});}
  function renderCards(d,cards,limit){limit=limit||cards.length;for(var i=0;i<cards.length&&i<limit;i++){var c=cards[i];add(d,{title:c.title,desc:c.desc||'',pic_url:c.img||'',url:routeCard(c),col_type:'movie_2',extra:{id:'madou_card_'+c.url}});}}

  R.home=function(){title('麻豆传媒');var d=[],h=MadouCore.fetchHtml(MadouCore.base+'/',false);if(MadouCore.isBadHtml(h)){section(d,'麻豆传媒','原站暂时无法直接解析，先用原站入口确认网络/域名状态。');add(d,{title:'🌐 打开原站',desc:MadouCore.base,col_type:'text_1',url:'web://'+MadouCore.base+'/'});add(d,{title:'🔄 强制重新加载',col_type:'text_1',url:$(MadouCore.base).lazyRule(function(boot,u){require(boot,{headers:{'Cache-Control':'no-cache'}},10101);MadouBoot.loadOnly();MadouCore.fetchHtml(u,true);refreshPage(false);return'toast://已重新请求';},MadouCore.bootstrap,MadouCore.base)});setResult(d);return;}
    add(d,{title:'🔎 搜索',desc:'站内内容',col_type:'icon_4',url:'input://'+JSON.stringify({value:'',hint:'输入关键词',js:"'hiker://search?s='+encodeURIComponent(input)+'&rule='+encodeURIComponent('"+MadouCore.ruleTitle()+"')"})});
    add(d,{title:'🧭 全部分类',desc:'动态同步原站菜单',col_type:'icon_4',url:MadouCore.page('madouCategories')});
    add(d,{title:'⭐ 本地收藏',desc:'仅保存在本机',col_type:'icon_4',url:MadouCore.page('madouFavorites')});
    add(d,{title:'🕘 浏览历史',desc:'最近浏览',col_type:'icon_4',url:MadouCore.page('madouHistory')});
    var menu=MadouCore.menu(h),i;for(i=0;i<menu.length&&i<14;i++){add(d,{title:menu[i].name,col_type:'scroll_button',url:MadouCore.page('madouList',{u:menu[i].url,page:'fypage',n:menu[i].name})});}
    var cards=MadouCore.parseCards(h,MadouCore.base);section(d,'🔥 首页精选',cards.length?'已解析 '+cards.length+' 项，广告位默认不进入内容流。':'未识别到内容卡片，可从分类页或原站入口继续。');renderCards(d,cards,18);
    if(cards.length>18)add(d,{title:'查看更多首页内容 ›',col_type:'text_1',url:MadouCore.page('madouList',{u:MadouCore.base+'/',page:'fypage',n:'首页'})});
    section(d,'工具','');add(d,{title:'⚙️ 设置与诊断',desc:R.version+' · Build '+R.build,col_type:'text_1',url:MadouCore.page('madouSettings')});add(d,{title:'🌐 原站网页',desc:MadouCore.base,col_type:'text_1',url:'web://'+MadouCore.base+'/'});setResult(d);
  };

  R.list=function(){var name=MadouCore.param('n','分类'),base=MadouCore.param('u',MadouCore.base+'/'),page=parseInt(MadouCore.param('page','1'),10)||1;title(name);var d=[],h1='',u=base;if(page>1)h1=MadouCore.fetchHtml(base,false);u=MadouCore.pageUrl(base,page,h1);var h=MadouCore.fetchHtml(u,page===1?false:true),cards=MadouCore.parseCards(h,u);if(page===1){var sub=MadouCore.menu(h);for(var i=0;i<sub.length&&i<12;i++)add(d,{title:sub[i].name,col_type:'scroll_button',url:MadouCore.page('madouList',{u:sub[i].url,page:'fypage',n:sub[i].name})});}renderCards(d,cards);if(!cards.length&&page===1){section(d,'暂无可展示内容','页面已请求，但本版自适应解析器未识别到有效视频卡片。');add(d,{title:'用原站页面打开',desc:u,col_type:'text_1',url:'web://'+u});}setResult(d);};

  R.categories=function(){title('全部分类');var d=[],h=MadouCore.fetchHtml(MadouCore.base+'/',false),menu=MadouCore.menu(h);section(d,'站点导航','从原站菜单动态提取；原站新增分类后无需改壳。');for(var i=0;i<menu.length;i++)add(d,{title:menu[i].name,desc:menu[i].url.replace(MadouCore.base,''),col_type:'text_1',url:MadouCore.page('madouList',{u:menu[i].url,page:'fypage',n:menu[i].name}),extra:{lineVisible:false}});setResult(d);};

  R.detail=function(){var u=MadouCore.param('u','');title('影片详情');var d=[],h=MadouCore.fetchHtml(u,true);if(MadouCore.isBadHtml(h)){section(d,'详情加载失败','原站返回内容异常或触发验证。');add(d,{title:'🌐 原站打开',col_type:'text_1',url:'web://'+u});setResult(d);return;}var x=MadouCore.detail(h,u);title(x.title||'影片详情');MadouCore.addHistory({url:u,title:x.title||'影片',img:MadouCore.image(x.cover,u),rawImg:x.cover,desc:x.date||x.duration||''});
    add(d,{title:x.title||'影片',desc:[x.date,x.duration].filter(function(v){return!!v;}).join(' · '),pic_url:MadouCore.image(x.cover,u),url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    add(d,{title:'▶ 立即播放',desc:x.sources.length?'检测到 '+x.sources.length+' 个直链候选':'自动嗅探网页媒体',col_type:'text_1',url:$(u).lazyRule(function(boot,target){require(boot,{headers:{'Cache-Control':'no-cache'}},10101);MadouBoot.loadOnly();return MadouCore.resolvePlay(target);},MadouCore.bootstrap,u),extra:{id:'madou_play_'+u,lineVisible:false}});
    var fav=MadouCore.isFav(u);add(d,{title:fav?'★ 取消收藏':'☆ 加入本地收藏',desc:'收藏信息只保存在当前设备',col_type:'text_1',url:$(u).lazyRule(function(boot,target,tt,im,ds){require(boot,{headers:{'Cache-Control':'no-cache'}},10101);MadouBoot.loadOnly();var on=MadouCore.toggleFav({url:target,title:tt,img:im,rawImg:im,desc:ds});refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},MadouCore.bootstrap,u,x.title||'影片',x.cover||'',x.date||x.duration||''),extra:{lineVisible:false}});
    add(d,{title:'🌐 原站详情',col_type:'text_1',url:'web://'+u,extra:{lineVisible:false}});
    if(x.desc){section(d,'简介','');add(d,{title:x.desc,col_type:'rich_text',url:'hiker://empty'});}if(x.tags.length){section(d,'标签 / 相关分类','');for(var i=0;i<x.tags.length&&i<20;i++)add(d,{title:x.tags[i].name,col_type:'scroll_button',url:MadouCore.page('madouList',{u:x.tags[i].url,page:'fypage',n:x.tags[i].name})});}
    if(x.related.length){section(d,'相关推荐','');renderCards(d,x.related,16);}setResult(d);
  };

  R.search=function(){var kw='';try{kw=String(MY_KEYWORD||'');}catch(e){kw=MadouCore.param('kw','');}var page=1;try{page=MY_PAGE||1;}catch(e2){}title('搜索 · '+kw);var d=[],r=MadouCore.searchHtml(kw,page),cards=MadouCore.parseCards(r.html,r.url);renderCards(d,cards);if(!cards.length&&page===1){section(d,'没有匹配结果','可尝试更短关键词，或进入原站搜索。');add(d,{title:'🌐 原站打开',col_type:'text_1',url:'web://'+MadouCore.base+'/'});}setResult(d);};

  R.favorites=function(){title('本地收藏');var d=[],a=MadouCore.readList(MadouCore.favoriteKey);section(d,'⭐ 本地收藏',a.length+' 项 · 仅本机保存');for(var i=0;i<a.length;i++){var c=a[i];add(d,{title:c.title||'影片',desc:c.desc||'',pic_url:c.img||MadouCore.image(c.rawImg,c.url),url:MadouCore.page('madouDetail',{u:c.url}),col_type:'movie_2'});}if(!a.length)section(d,'还没有收藏','进入详情页点击“加入本地收藏”。');setResult(d);};
  R.history=function(){title('浏览历史');var d=[],a=MadouCore.readList(MadouCore.historyKey);section(d,'🕘 最近浏览',a.length+' 项');for(var i=0;i<a.length;i++){var c=a[i];add(d,{title:c.title||'影片',desc:c.desc||'',pic_url:c.img||MadouCore.image(c.rawImg,c.url),url:MadouCore.page('madouDetail',{u:c.url}),col_type:'movie_2'});}if(!a.length)section(d,'暂无历史','打开过的详情页会自动记录。');setResult(d);};

  R.settings=function(){title('设置与诊断');var d=[],h=MadouCore.fetchHtml(MadouCore.base+'/',true),menu=MadouCore.menu(h),cards=MadouCore.parseCards(h,MadouCore.base);section(d,'运行信息','');add(d,{title:'版本',desc:R.version+' · Build '+R.build,col_type:'text_1',url:'hiker://empty'});add(d,{title:'站点',desc:MadouCore.base,col_type:'text_1',url:'web://'+MadouCore.base+'/'});add(d,{title:'首页诊断',desc:'HTML '+String(h.length)+' 字符 · 分类 '+menu.length+' · 内容卡 '+cards.length,col_type:'text_1',url:'hiker://empty'});add(d,{title:'🔄 清首页缓存并重试',desc:'重新请求普通 HTML，必要时自动回退 WebView 渲染',col_type:'text_1',url:$(MadouCore.base).lazyRule(function(boot,u){require(boot,{headers:{'Cache-Control':'no-cache'}},10101);MadouBoot.loadOnly();setItem(MadouCore.cacheKey(u),'');setItem(MadouCore.cacheKey(u)+'_ts','0');MadouCore.fetchHtml(u,true);refreshPage(false);return'toast://已刷新';},MadouCore.bootstrap,MadouCore.base)});add(d,{title:'🗑 清空浏览历史',col_type:'text_1',url:$(MadouCore.historyKey).lazyRule(function(boot,key){require(boot,{headers:{'Cache-Control':'no-cache'}},10101);MadouBoot.loadOnly();MadouCore.writeList(key,[]);refreshPage(false);return'toast://历史已清空';},MadouCore.bootstrap,MadouCore.historyKey)});setResult(d);};

  R.module=function(){return{home:R.home,list:R.list,categories:R.categories,detail:R.detail,search:R.search,favorites:R.favorites,history:R.history,settings:R.settings};};
  return R;
})();
