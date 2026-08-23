/* 麻豆传媒 Test4 - hierarchical categories + large-detail safety + direct-page runtime patch */
(function(){
  if(typeof MadouCore==='undefined'||typeof MadouRemoteRuntime==='undefined') throw new Error('Madou runtime unavailable');
  var C=MadouCore,R=MadouRemoteRuntime;
  var ROOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/madou/';
  var ICON={search:ROOT+'assets/quick_search.svg',categories:ROOT+'assets/quick_categories.svg',favorite:ROOT+'assets/quick_favorite.svg',history:ROOT+'assets/quick_history.svg'};
  var MAJORS=['精选推荐','欧美P站','原创AV','网黄','乱伦','日韩','男同百合','Onlyfans','三级','猛料-SM','成人综艺','短视频','性爱教学','影视剧'];

  C.version='0.1.0-test.4';C.build=10104;
  R.version='0.1.0-test.4';R.build=10104;
  C.bootstrap=ROOT+'bootstrap_test_v4_b10104.js?v=10104';

  function s(v){return v===undefined||v===null?'':String(v);}
  function short(v,n){v=s(v);return v.length>n?v.substring(0,n):v;}
  function cleanName(v){return C.cleanLabel(s(v)).replace(/^🔥+|🔥+$/g,'').replace(/^\s+|\s+$/g,'');}
  function sameMajor(a,b){a=cleanName(a).toLowerCase();b=cleanName(b).toLowerCase();return a===b||a.indexOf(b)>=0||b.indexOf(a)>=0;}
  function add(d,x){d.push(x);}
  function section(d,t,desc){add(d,{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});}
  function renderCards(d,cards,limit){limit=limit||cards.length;for(var i=0;i<cards.length&&i<limit;i++){var c=cards[i]||{};add(d,{title:c.title||'影片',desc:c.desc||'',img:c.img||'',pic_url:c.img||'',url:C.page('madouDetail',{u:c.url}),col_type:'movie_2',extra:{lineVisible:false,id:'madou_v4_card_'+i}});}}
  function quick(d,t,img,u){add(d,{title:t,img:img,pic_url:img,url:u,col_type:'icon_small_4',extra:{lineVisible:false}});}

  // Important: never let a large rendered page flow through fetchCodeByWebView here.
  // Real-device Test3 showed detail pages can again hit Hiker's private-storage 1 MB ceiling.
  C._v4HtmlMem=C._v4HtmlMem||{};
  C._v4HtmlTs=C._v4HtmlTs||{};
  C.fetchPlainHtml=function(url){
    url=s(url||C.base+'/');var h='';
    try{h=s(fetch(url,{timeout:12000,headers:C.headers(url)}));}catch(e1){h='';}
    if(C.isBadHtml(h)){
      try{if(typeof request==='function')h=s(request(url,{timeout:12000,headers:C.headers(url)}));}catch(e2){}
    }
    return h;
  };
  C.fetchHtml=function(url,force){
    url=s(url||C.base+'/');var now=new Date().getTime(),old=C._v4HtmlMem[url]||'',ts=Number(C._v4HtmlTs[url]||0),h='';
    if(!force&&old&&now-ts<3*60*1000)return old;
    h=C.fetchPlainHtml(url);
    if(!C.isBadHtml(h)){
      C._v4HtmlMem[url]=h;C._v4HtmlTs[url]=now;
      try{setItem('madou_diag_last_html_len',String(h.length));}catch(e3){}
      try{setItem('madou_diag_last_fetch_ts',String(now));}catch(e4){}
      return h;
    }
    return old||h;
  };

  // Keep history/favorites bounded even if a malformed page exposes a huge data URI or text blob.
  C.slimItem=function(item){item=item||{};var im=short(item.img||'',6000),raw=short(item.rawImg||'',6000);if(/^data:/i.test(im))im='';if(/^data:/i.test(raw))raw='';return{url:short(item.url||'',3000),title:short(item.title||'影片',300),img:im,rawImg:raw,desc:short(item.desc||'',500),time:Number(item.time||new Date().getTime())};};
  C.writeList=function(key,a){
    a=a||[];var out=[],max=key===C.historyKey?120:200;
    for(var i=0;i<a.length&&out.length<max;i++)out.push(C.slimItem(a[i]));
    var text=JSON.stringify(out);
    if(text.length>700000){out=out.slice(0,Math.max(20,Math.floor(out.length/2)));text=JSON.stringify(out);}
    setItem(key,text);
  };
  C.addHistory=function(item){var a=C.readList(C.historyKey),x=C.slimItem(item),out=[x];for(var i=0;i<a.length&&out.length<120;i++)if(a[i]&&a[i].url!==x.url)out.push(C.slimItem(a[i]));C.writeList(C.historyKey,out);};
  C.toggleFav=function(item){var a=C.readList(C.favoriteKey),x=C.slimItem(item),out=[],hit=false;for(var i=0;i<a.length;i++){if(a[i]&&a[i].url===x.url){hit=true;continue;}out.push(C.slimItem(a[i]));}if(!hit)out.unshift(x);C.writeList(C.favoriteKey,out);return!hit;};

  C.majorNames=MAJORS.slice();
  C.categoryGroups=function(html){
    var region=C.menuRegion(html)||s(html),anchors=C.allAnchors(region,C.base),markers=[],i,j,m,pos,url;
    for(i=0;i<MAJORS.length;i++){
      pos=-1;url='';
      for(j=0;j<anchors.length;j++)if(sameMajor(anchors[j].text||anchors[j].title,MAJORS[i])){pos=anchors[j].index;url=anchors[j].href;break;}
      if(pos<0){pos=region.indexOf(MAJORS[i]);if(pos<0&&MAJORS[i]==='成人综艺')pos=region.indexOf('成人综艺🔥');}
      if(pos>=0)markers.push({name:MAJORS[i],pos:pos,url:url});
    }
    markers.sort(function(a,b){return a.pos-b.pos;});
    var groups=[],used={},start,end,a,t,k,children,seen;
    for(i=0;i<markers.length;i++){
      start=markers[i].pos;end=i+1<markers.length?markers[i+1].pos:region.length;children=[];seen={};
      for(j=0;j<anchors.length;j++){
        a=anchors[j];if(a.index<=start||a.index>=end)continue;t=cleanName(a.text||a.title);if(!t||t.length>22||!C.internal(a.href)||C.isUtilityLabel(t))continue;
        if(/^(首页|上一页|下一页|上页|下页|更多|展开|收起|arrow|next|prev|menu)$/i.test(t))continue;
        var isMajor=false;for(m=0;m<MAJORS.length;m++)if(sameMajor(t,MAJORS[m])){isMajor=true;break;}if(isMajor)continue;
        k=t+'|'+a.href;if(seen[k])continue;seen[k]=1;used[a.href]=1;children.push({name:t,url:a.href});
      }
      groups.push({name:markers[i].name,url:markers[i].url,children:children});
    }
    // If the DOM exposes headings differently, keep the real links useful instead of flattening the whole page.
    if(groups.length<3){
      groups=[];var all=C.menu(html),fallback=[];seen={};
      for(i=0;i<all.length;i++){
        t=cleanName(all[i].name);if(!t||/^(首页|最新)$/i.test(t))continue;
        var major=false;for(j=0;j<MAJORS.length;j++)if(sameMajor(t,MAJORS[j])){major=true;break;}if(major)continue;
        k=t+'|'+all[i].url;if(seen[k])continue;seen[k]=1;fallback.push({name:t,url:all[i].url});
      }
      groups.push({name:'精选推荐',url:'',children:fallback});
    }
    // Preserve real major links even when a group has no detected children.
    for(i=0;i<groups.length;i++)if(groups[i].url)used[groups[i].url]=1;
    return groups;
  };
  C.findGroupForUrl=function(groups,url){for(var i=0;i<groups.length;i++){if(groups[i].url===url)return groups[i];for(var j=0;j<groups[i].children.length;j++)if(groups[i].children[j].url===url)return groups[i];}return null;};

  R.home=function(){
    try{setPageTitle('麻豆传媒');}catch(e){}
    var d=[],h=C.fetchHtml(C.base+'/',false);
    if(C.isBadHtml(h)){section(d,'麻豆传媒','原站直连未返回有效 HTML；Test4 已停止使用大型 WebView HTML 回传，避免再次触发 1MB 私有存储错误。');add(d,{title:'打开原站',desc:C.base,col_type:'text_1',url:'web://'+C.base+'/'});setResult(d);return;}
    var searchJs="'hiker://page/madouSearch?rule=&simple=true&kw='+encodeURIComponent(input)";
    quick(d,'搜索',ICON.search,'input://'+JSON.stringify({value:'',hint:'输入关键词',js:searchJs}));quick(d,'全部分类',ICON.categories,C.page('madouCategories'));quick(d,'本地收藏',ICON.favorite,C.page('madouFavorites'));quick(d,'浏览历史',ICON.history,C.page('madouHistory'));
    var groups=C.categoryGroups(h),i;
    add(d,{title:'首页',col_type:'scroll_button',url:C.page('madouList',{u:C.base+'/',page:'fypage',n:'首页'})});
    for(i=0;i<groups.length&&i<8;i++)add(d,{title:groups[i].name,col_type:'scroll_button',url:C.page('madouCategories',{g:groups[i].name})});
    if(groups.length>8)add(d,{title:'更多 ›',col_type:'scroll_button',url:C.page('madouCategories')});
    var cards=C.parseCards(h,C.base);section(d,'🔥 首页精选',cards.length?'已解析 '+cards.length+' 项 · 大分类与子分类已拆分。':'未识别到内容卡片。');renderCards(d,cards,18);
    if(cards.length>18)add(d,{title:'查看更多首页内容 ›',col_type:'text_1',url:C.page('madouList',{u:C.base+'/',page:'fypage',n:'首页'})});
    section(d,'工具','');add(d,{title:'⚙️ 设置与诊断',desc:R.version+' · Build '+R.build,col_type:'text_1',url:C.page('madouSettings')});add(d,{title:'🌐 原站网页',desc:C.base,col_type:'text_1',url:'web://'+C.base+'/'});setResult(d);
  };

  R.categories=function(){
    try{setPageTitle('全部分类');}catch(e){}
    var d=[],h=C.fetchHtml(C.base+'/',false),groups=C.categoryGroups(h),focus=C.param('g',''),open=-1,i,j,total=0;
    for(i=0;i<groups.length;i++){total+=groups[i].children.length;if(focus&&sameMajor(groups[i].name,focus))open=i;}
    if(open<0){var ov='';try{ov=getMyVar('madou_cat_open_v4','');}catch(e2){}open=ov===''?0:parseInt(ov,10);if(isNaN(open))open=0;}
    section(d,'分类中心',groups.length+' 个大分类 · '+total+' 个已识别子分类。点击大分类展开/收起。');
    add(d,{title:'首页',desc:'返回站点首页内容',col_type:'text_2',url:C.page('madouList',{u:C.base+'/',page:'fypage',n:'首页'}),extra:{lineVisible:false}});
    var menu=C.menu(h),latest=null;for(i=0;i<menu.length;i++)if(cleanName(menu[i].name)==='最新'){latest=menu[i];break;}if(latest)add(d,{title:'最新',desc:'最新更新',col_type:'text_2',url:C.page('madouList',{u:latest.url,page:'fypage',n:'最新'}),extra:{lineVisible:false}});
    for(i=0;i<groups.length;i++){
      var g=groups[i],on=i===open;
      add(d,{title:(on?'▼ ':'▶ ')+g.name,desc:(g.children.length?g.children.length+' 个子分类':'进入该大分类'),col_type:'text_1',url:$('#noLoading#').lazyRule(function(idx){var cur=getMyVar('madou_cat_open_v4','');putMyVar('madou_cat_open_v4',String(cur===String(idx)?-1:idx));refreshPage(false);return'hiker://empty';},i),extra:{lineVisible:false,id:'madou_v4_group_'+i}});
      if(!on)continue;
      if(g.url)add(d,{title:'全部'+g.name,col_type:'text_3',url:C.page('madouList',{u:g.url,page:'fypage',n:'全部'+g.name,g:g.name}),extra:{lineVisible:false}});
      for(j=0;j<g.children.length;j++)add(d,{title:g.children[j].name,col_type:'text_3',url:C.page('madouList',{u:g.children[j].url,page:'fypage',n:g.children[j].name,g:g.name}),extra:{lineVisible:false}});
      if(!g.children.length&&!g.url)add(d,{title:'暂未识别到子分类',desc:'该组在当前 DOM 中没有独立链接，可等待后续协议收紧。',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
    }
    setResult(d);
  };

  R.list=function(){
    var name=C.param('n','分类'),base=C.param('u',C.base+'/'),groupName=C.param('g',''),page=parseInt(C.param('page','1'),10)||1;try{setPageTitle(name);}catch(e){}
    var d=[],home='',groups=[],g=null,h1='',u=base;
    if(page===1){home=C.fetchHtml(C.base+'/',false);groups=C.categoryGroups(home);if(groupName){for(var gi=0;gi<groups.length;gi++)if(sameMajor(groups[gi].name,groupName)){g=groups[gi];break;}}if(!g)g=C.findGroupForUrl(groups,base);if(g){for(var sj=0;sj<g.children.length;sj++)add(d,{title:g.children[sj].name,col_type:'scroll_button',url:C.page('madouList',{u:g.children[sj].url,page:'fypage',n:g.children[sj].name,g:g.name})});}}
    if(page>1)h1=C.fetchHtml(base,false);u=C.pageUrl(base,page,h1);var h=C.fetchHtml(u,page>1),cards=C.parseCards(h,u);renderCards(d,cards);
    if(!cards.length&&page===1){section(d,'暂无可展示内容','页面已请求，但当前解析器没有识别到有效视频卡片。');add(d,{title:'用原站页面打开',desc:u,col_type:'text_1',url:'web://'+u});}
    setResult(d);
  };

  R.detail=function(){
    var u=C.param('u','');try{setPageTitle('影片详情');}catch(e){}var d=[],h=C.fetchPlainHtml(u);
    if(C.isBadHtml(h)){section(d,'详情直连失败','Test4 已禁止使用可能触发 1MB 私有存储上限的大型 WebView HTML 回传。');add(d,{title:'▶ 网页媒体嗅探',desc:'让海阔播放器直接从原详情页提取媒体',col_type:'text_1',url:'video://'+u,extra:{lineVisible:false}});add(d,{title:'🌐 原站详情',col_type:'text_1',url:'web://'+u,extra:{lineVisible:false}});setResult(d);return;}
    var x=C.detail(h,u);try{setPageTitle(x.title||'影片详情');}catch(e2){}
    C.addHistory({url:u,title:x.title||'影片',img:C.image(x.cover,u),rawImg:x.cover,desc:x.date||x.duration||''});
    add(d,{title:x.title||'影片',desc:[x.date,x.duration].filter(function(v){return!!v;}).join(' · '),img:C.image(x.cover,u),pic_url:C.image(x.cover,u),url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    add(d,{title:'▶ 立即播放',desc:x.sources.length?'检测到 '+x.sources.length+' 个媒体候选':'未发现直链，使用网页嗅探',col_type:'text_1',url:$(u).lazyRule(function(boot,target){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);MadouBoot.loadOnly();return MadouCore.resolvePlay(target);},C.bootstrap,u),extra:{lineVisible:false,id:'madou_v4_play'}});
    var fav=C.isFav(u);add(d,{title:fav?'★ 取消收藏':'☆ 加入本地收藏',desc:'收藏信息只保存在当前设备',col_type:'text_1',url:$(u).lazyRule(function(boot,target,tt,im,ds){require(boot,{headers:{'Cache-Control':'no-cache'}},10104);MadouBoot.loadOnly();var on=MadouCore.toggleFav({url:target,title:tt,img:im,rawImg:im,desc:ds});refreshPage(false);return'toast://'+(on?'已收藏':'已取消收藏');},C.bootstrap,u,x.title||'影片',x.cover||'',x.date||x.duration||''),extra:{lineVisible:false}});
    add(d,{title:'🌐 原站详情',col_type:'text_1',url:'web://'+u,extra:{lineVisible:false}});
    if(x.desc){section(d,'简介','');add(d,{title:short(x.desc,3000),col_type:'rich_text',url:'hiker://empty'});}if(x.tags&&x.tags.length){section(d,'标签 / 相关分类','');for(var i=0;i<x.tags.length&&i<20;i++)add(d,{title:x.tags[i].name,col_type:'scroll_button',url:C.page('madouList',{u:x.tags[i].url,page:'fypage',n:x.tags[i].name})});}if(x.related&&x.related.length){section(d,'相关推荐','');renderCards(d,x.related,16);}setResult(d);
  };

  var oldResolve=C.resolvePlay;
  C.resolvePlay=function(url){
    var h=C.fetchPlainHtml(url),src=C.mediaSources(h,url);src.sort(function(a,b){return C.mediaScore(b)-C.mediaScore(a);});
    if(src.length)return src[0]+';{User-Agent@'+C.ua+'&&Referer@'+url+'}#isVideo=true#';
    try{return oldResolve?('video://'+url):('video://'+url);}catch(e){return'video://'+url;}
  };
})();
