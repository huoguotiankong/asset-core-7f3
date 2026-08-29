/* 夜社短剧 Runtime/UI 0.1.0-test.5 */
var YesheRemoteRuntime=(function(){
  var VERSION='0.1.0-test.5',BUILD=10105,P=YesheProtocol,D=YesheProvider,PB=YeshePlayback;
  var BOOT='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/yeshe/bootstrap_test_v5_b10105.js?v=10105';
  var ASSET='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/yeshe/assets/';
  var FAV='yeshe_favorites_v1',HIS='yeshe_history_v1',SH='yeshe_search_history_v1',TAB='yeshe_home_tab_v1',DETAIL_SEED='yeshe_detail_seed_v2';
  function s(v){return v==null?'':String(v);}
  function clean(v){return P.clean(v);}
  function arr(key){try{var a=JSON.parse(getItem(key,'[]')||'[]');return Array.isArray(a)?a:[];}catch(e){return[];}}
  function saveArr(key,a){try{setItem(key,JSON.stringify(a));}catch(e){}}
  function hash(v){v=s(v);var h=0,i;for(i=0;i<v.length;i++)h=((h<<5)-h+v.charCodeAt(i))|0;return Math.abs(h);}
  function upsert(key,o,limit){var a=arr(key),b=[],i;if(!o||!o.url)return a;b.push(o);for(i=0;i<a.length&&b.length<(limit||80);i++)if(a[i]&&a[i].url!==o.url)b.push(a[i]);saveArr(key,b);return b;}
  function remove(key,url){var a=arr(key),b=[],i;for(i=0;i<a.length;i++)if(a[i]&&a[i].url!==url)b.push(a[i]);saveArr(key,b);return b;}
  function isFav(url){var a=arr(FAV),i;for(i=0;i<a.length;i++)if(a[i]&&a[i].url===url)return true;return false;}
  function ruleTitle(){try{return MY_RULE&&MY_RULE.title?String(MY_RULE.title):'夜社短剧';}catch(e){return'夜社短剧';}}
  function param(name,def){var u='';try{u=s(MY_URL);}catch(e){}var m=u.match(new RegExp('[?&]'+name+'=([^&#]*)'));if(!m)return def===undefined?'':def;try{return decodeURIComponent(m[1]);}catch(e2){return m[1];}}
  function route(path,params){var u='hiker://page/'+path+'?rule=&simple=true',k;params=params||{};for(k in params)if(params[k]!=null&&s(params[k])!=='')u+='&'+encodeURIComponent(k)+'='+encodeURIComponent(s(params[k]));return u;}
  function image(u,ref){u=s(u);if(!u)return ASSET+'icon_v1.svg?v=10101';try{return u+'@headers='+JSON.stringify({'Referer':ref||P.discover(false)+'/', 'User-Agent':P.ua});}catch(e){return u;}}
  function icon(name){return ASSET+name+'_v1.svg?v=10101';}
  function banner(){return ASSET+'banner_v1.svg?v=10101';}
  function tint(title){return '▌'+title;}
  function pageTitle(t){try{setPageTitle(t);}catch(e){}}
  function lazyPlay(url){return $('').lazyRule(function(boot,u){require(boot,{headers:{'Cache-Control':'no-cache'}},10105);return YesheBoot.module().play(u);},BOOT,url);}
  function lazyFavorite(item){return $('').lazyRule(function(boot,j){require(boot,{headers:{'Cache-Control':'no-cache'}},10105);var m=YesheBoot.module(),o={};try{o=JSON.parse(j);}catch(e){}return m.toggleFavorite(o);},BOOT,JSON.stringify(item||{}));}
  function lazyTab(key,val){return $('').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,val);}
  function openDetail(x){
    x=x||{};var seed={url:s(x.url),title:clean(x.title),cover:s(x.cover),desc:clean(x.desc),kind:s(x.kind||'unknown')};
    return $('').lazyRule(function(j){
      var o={};try{o=JSON.parse(j);}catch(e){}
      if(!o.url)return'toast://详情地址无效';
      try{setItem('yeshe_detail_seed_v2',j);}catch(ignore){}
      return'hiker://page/yesheDetail?rule=&simple=true&yeshe_url='+encodeURIComponent(String(o.url));
    },JSON.stringify(seed));
  }
  function card(x,cls){
    x=x||{};return{title:clean(x.title)||'未命名内容',desc:clean(x.desc)||'点击查看详情',pic_url:image(x.cover,x.url),url:openDetail(x),col_type:'movie_3',extra:{id:'yeshe-card-'+hash(x.url),cls:cls||'yeshe-cards'}};
  }
  function cards(xs,cls){var o=[],i;for(i=0;i<(xs||[]).length;i++)o.push(card(xs[i],cls));return o;}
  function section(t,desc){return{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}};}
  function searchBox(){return{title:'搜索夜社内容',desc:'短剧、视频、动漫、漫画、写真、小说…',col_type:'input',url:"'hiker://page/yesheSearch?rule=&simple=true&kw='+encodeURIComponent(input)",extra:{id:'yeshe-search-input'}};}
  function shortcut(title,pic,url){return{title:title,pic_url:pic,col_type:'icon_small_4',url:url};}
  function home(){
    var page=D.pageNo(),tab=getMyVar(TAB,'hot'),head=[],r,i,t,items=[];
    if(page>1){r=D.home(tab,page);setResult(cards(r.items,'yeshe-home-feed'));return;}
    pageTitle('夜社短剧');
    head.push({title:'夜社短剧',desc:'短剧 · 视频 · 动漫 · 漫画 · 写真 · 小说\n最近更新与热门内容',pic_url:icon('icon'),url:route('yesheCatalog'),col_type:'movie_1_left_pic',extra:{id:'yeshe-home-banner',lineVisible:false}});
    head.push(searchBox());
    head.push(shortcut('分类大全',icon('category'),route('yesheCatalog')));
    head.push(shortcut('热门短剧',icon('hot'),route('yesheCategory',{yeshe_category_name:'短剧',yeshe_category_url:D.shortUrl(''),yeshe_kind:'video'})));
    head.push(shortcut('我的收藏',icon('favorite'),route('yesheFavorites')));
    head.push(shortcut('浏览历史',icon('history'),route('yesheHistory')));
    head.push({title:tint('短剧频道'),desc:'热门类型横向切换 · 同页刷新',col_type:'text_1',url:'hiker://empty'});
    for(i=0;i<D.shortTabs.length;i++){t=D.shortTabs[i];head.push({title:t.name,col_type:'scroll_button',url:lazyTab(TAB,t.id),extra:{backgroundColor:t.id===tab?'#E93650':'#F4F4F4',fontColor:t.id===tab?'#FFFFFF':'#333333'}});}
    head.push({title:'最近更新',desc:'当前：'+(function(){for(var j=0;j<D.shortTabs.length;j++)if(D.shortTabs[j].id===tab)return D.shortTabs[j].name;return'热播';})(),col_type:'text_1',url:route('yesheCategory',{yeshe_category_name:'短剧',yeshe_category_url:D.shortUrl((function(){for(var j=0;j<D.shortTabs.length;j++)if(D.shortTabs[j].id===tab)return D.shortTabs[j].tid;return'';})()),yeshe_kind:'video'}),extra:{id:'yeshe-home-anchor'}});
    head.push({title:'正在加载内容…',desc:'首次打开会解析当前可用线路',col_type:'text_1',url:'hiker://empty',extra:{id:'yeshe-home-loading'}});
    setResult(head);
    r=D.home(tab,1);items=cards(r.items,'yeshe-home-feed');
    try{deleteItem('yeshe-home-loading');if(items.length)addItemAfter('yeshe-home-anchor',items);else {var dg=P.diag();addItemAfter('yeshe-home-anchor',{title:'暂未解析到内容',desc:'阶段：'+s(dg.stage||'未知')+' · '+s(dg.transport||'')+' · HTML '+s(dg.len||0)+'。进入设置可刷新线路并查看完整诊断。',col_type:'text_1',url:route('yesheSettings')});}}catch(e){setResult(head.concat(items));}
  }
  function catalog(){
    pageTitle('分类大全');var c=D.catalog(),d=[],i,j,g,x,u;
    d.push(searchBox());
    d.push({title:tint('全站分类'),desc:'已从当前线路合并首页 / type / filter 导航 · 识别 '+c.navCount+' 个分类入口',col_type:'text_1',url:'hiker://empty'});
    for(i=0;i<c.groups.length;i++){
      g=c.groups[i];d.push({title:'▌'+g.name,desc:'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
      for(j=0;j<g.items.length;j++){
        x=g.items[j];
        u=x.available?route('yesheCategory',{yeshe_category_name:x.name,yeshe_category_url:x.url,yeshe_kind:x.kind}):'toast://当前线路暂未解析到“'+x.name+'”的真实分类地址';
        d.push({title:x.name+(x.available?'':' · 待解析'),col_type:'flex_button',url:u,extra:{backgroundColor:x.available?'#F6F6F7':'#F1F1F1',fontColor:x.available?'#333333':'#999999'}});
      }
    }
    if(c.extras.length){
      d.push({title:'更多动态分类',desc:'来自当前站点真实导航',col_type:'text_1',url:'hiker://empty'});
      for(i=0;i<c.extras.length&&i<36;i++){x=c.extras[i];d.push({title:x.name,col_type:'flex_button',url:route('yesheCategory',{yeshe_category_name:x.name,yeshe_category_url:x.url,yeshe_kind:x.kind||'unknown'})});}
    }
    setResult(d);
  }
  function category(){
    var name=param('yeshe_category_name')||'分类',url=param('yeshe_category_url')||'',kind=param('yeshe_kind')||'unknown',page=D.pageNo(),r=D.category(name,url,page,kind),d=[];
    if(page===1){pageTitle(name);d.push(searchBox());d.push({title:tint(name),desc:r.url?'当前线路真实分类 · 支持翻页':'真实分类地址尚未恢复',col_type:'text_1',url:'hiker://empty'});}
    if(r.error&&page===1){
      var dg=P.diag();
      d.push({title:'分类暂不可用',desc:r.error+'\n导航诊断：'+s(dg.stage||'')+' · count '+s(dg.count||0)+' · HTML '+s(dg.len||0),col_type:'text_1',url:route('yesheSettings')});
      setResult(d);return;
    }
    d=d.concat(cards(r.items,'yeshe-category-feed'));
    if(!r.items.length&&page===1)d.push({title:'当前分类没有解析到内容卡',desc:'分类 URL 已恢复，但列表 DOM 仍未命中。请把此页与设置诊断截图发回。',col_type:'text_1',url:route('yesheSettings')});
    setResult(d);
  }
  function search(){
    var kw=param('kw')||param('yeshe_kw')||'',page=D.pageNo(),d=[],r;if(page===1){pageTitle('搜索');d.push(searchBox());if(kw){var sh=arr(SH),b=[kw],i;for(i=0;i<sh.length&&b.length<20;i++)if(sh[i]!==kw)b.push(sh[i]);saveArr(SH,b);}else{var hs=arr(SH);if(hs.length){d.push(section('最近搜索','点词直接搜索'));for(var j=0;j<hs.length;j++)d.push({title:hs[j],col_type:'flex_button',url:route('yesheSearch',{kw:hs[j]})});}setResult(d);return;}}
    r=D.search(kw,page);if(page===1)d.push({title:tint('搜索：'+kw),desc:r.items.length?'已找到 '+r.items.length+' 个当前页结果':'正在使用站点搜索结构',col_type:'text_1',url:'hiker://empty'});d=d.concat(cards(r.items,'yeshe-search-feed'));if(!r.items.length&&page===1)d.push({title:'没有解析到结果',desc:'可能是站点搜索路由变化；设置页可查看最近协议诊断。',col_type:'text_1',url:route('yesheSettings')});setResult(d);
  }
  function detailSeed(url){
    var seed={};try{seed=JSON.parse(getItem(DETAIL_SEED,'{}')||'{}');}catch(e){seed={};}
    if(seed&&seed.url===url)return seed;
    return{url:url,title:param('yeshe_title')||'',cover:'',desc:'',kind:param('yeshe_kind')||'unknown'};
  }
  function detail(){
    var url=param('yeshe_url')||'',seed=detailSeed(url),o=D.detail(url,seed),d=[],i,lineMap={},lines=[],ln,key='yeshe_line_'+hash(url),sel='',ordKey='yeshe_order_'+hash(url),order=getMyVar(ordKey,'asc'),eps=[],chapters=o.chapters||[],playable=(o.kind==='video'||o.kind==='anime'||o.kind==='audio');
    pageTitle(o.title||'内容详情');
    upsert(HIS,{url:o.url,title:o.title,cover:o.cover,desc:o.desc,kind:o.kind,time:new Date().getTime()},100);

    d.push({title:o.title||'夜社内容',desc:(o.desc||('类型：'+o.kind)).substring(0,260),pic_url:image(o.cover,o.url),url:'hiker://empty',col_type:o.cover?'movie_1_left_pic':'text_1',extra:{id:'yeshe-detail-hero',lineVisible:false}});

    if(playable){
      for(i=0;i<o.episodes.length;i++){ln=o.episodes[i].line;if(!lineMap[ln]){lineMap[ln]=[];lines.push(ln);}lineMap[ln].push(o.episodes[i]);}
      if(lines.length){
        sel=getMyVar(key,String(lines[0]));if(!lineMap[Number(sel)])sel=String(lines[0]);
        eps=lineMap[Number(sel)]||[];if(order==='desc')eps=eps.slice(0).reverse();
        d.push({title:'▶ 立即播放 · '+(eps[0]?eps[0].title:'第1集'),desc:'只使用当前作品真实 /play/<id>/<line>/<episode> 剧集',col_type:'text_center_1',url:eps[0]?lazyPlay(eps[0].url):'hiker://empty',extra:{backgroundColor:'#E93650',lineVisible:false}});
      }else{
        d.push({title:'▶ 智能播放',desc:'当前页未解析到标准选集，交给播放适配器继续解析',col_type:'text_center_1',url:lazyPlay(o.url),extra:{backgroundColor:'#E93650',lineVisible:false}});
      }
    }else if((o.kind==='comic'||o.kind==='photo'||o.kind==='gallery')&&o.gallery.length){
      d.push({title:'查看全部图片 · '+o.gallery.length+' 张',desc:o.kind==='comic'?'漫画阅读':'写真 / 图集阅读',col_type:'text_center_1',url:galleryUrl(o.gallery,o.url),extra:{backgroundColor:'#E93650',lineVisible:false}});
    }else if((o.kind==='novel'||o.kind==='text')&&o.article){
      d.push({title:'开始阅读',desc:'正文已独立解析，不混入视频详情',col_type:'text_center_1',url:'hiker://empty',extra:{backgroundColor:'#E93650',lineVisible:false}});
    }

    d.push({title:isFav(o.url)?'已收藏':'加入本地收藏',pic_url:icon('favorite'),col_type:'icon_small_4',url:lazyFavorite({url:o.url,title:o.title,cover:o.cover,desc:o.desc,kind:o.kind})});
    d.push({title:'网站原页',pic_url:icon('browser'),col_type:'icon_small_4',url:'web://'+o.url});
    d.push({title:'登录账号',pic_url:icon('account'),col_type:'icon_small_4',url:'web://'+P.loginUrl()});
    d.push({title:'设置诊断',pic_url:icon('settings'),col_type:'icon_small_4',url:route('yesheSettings')});

    if(playable&&lines.length){
      d.push(section('选集','共 '+o.episodes.length+' 集 · 线路 '+sel+' · '+(order==='asc'?'正序':'倒序')));
      for(i=0;i<lines.length;i++)d.push({title:'线路 '+lines[i],col_type:'scroll_button',url:lazyTab(key,String(lines[i])),extra:{backgroundColor:String(lines[i])===String(sel)?'#E93650':'#F4F4F4',fontColor:String(lines[i])===String(sel)?'#FFFFFF':'#333333'}});
      d.push({title:order==='asc'?'切换倒序':'切换正序',col_type:'flex_button',url:lazyTab(ordKey,order==='asc'?'desc':'asc')});
      for(i=0;i<eps.length;i++)d.push({title:'第'+eps[i].episode+'集',desc:'',col_type:'text_4',url:lazyPlay(eps[i].url),extra:{cls:'yeshe-episode'}});
    }

    if((o.kind==='comic'||o.kind==='photo'||o.kind==='gallery')&&o.gallery.length){
      d.push(section('图片预览','共 '+o.gallery.length+' 张'));
      for(i=0;i<o.gallery.length&&i<3;i++)d.push({title:'',pic_url:image(o.gallery[i],o.url),col_type:'pic_1_full',url:galleryUrl(o.gallery,o.url),extra:{lineVisible:false}});
    }

    if((o.kind==='novel'||o.kind==='text')){
      if(chapters.length){
        d.push(section('章节目录','共 '+chapters.length+' 章'));
        for(i=0;i<chapters.length;i++)d.push({title:chapters[i].title,col_type:'text_1',url:openDetail({url:chapters[i].url,title:chapters[i].title,kind:'novel'})});
      }else if(o.article){
        d.push(section('正文',''));
        d.push({title:o.article,col_type:'long_text',url:'hiker://empty'});
      }
    }

    if(o.related.length){
      d.push(section('相关推荐','继续发现'));
      d=d.concat(cards(o.related,'yeshe-related'));
    }
    setResult(d);
  }
  function galleryUrl(imgs,ref){var a=[],i,h={'Referer':ref,'User-Agent':P.ua};for(i=0;i<imgs.length;i++)a.push(imgs[i]+'@headers='+JSON.stringify(h));return'pics://'+a.join('&&');}
  function toggleFavorite(o){if(!o||!o.url)return'toast://收藏对象无效';if(isFav(o.url)){remove(FAV,o.url);refreshPage(false);return'toast://已取消收藏';}upsert(FAV,o,100);refreshPage(false);return'toast://已收藏';}
  function listLocal(key,title){pageTitle(title);var a=arr(key),d=[],i;d.push(searchBox());d.push(section(title,'共 '+a.length+' 条'));for(i=0;i<a.length;i++)d.push(card(a[i],'yeshe-local'));if(!a.length)d.push({title:'这里还没有内容',desc:key===FAV?'在详情页点“加入本地收藏”即可保存':'打开内容详情后会自动记录',col_type:'text_1',url:route('yesheCatalog')});setResult(d);}
  function favorites(){listLocal(FAV,'我的收藏');}
  function history(){listLocal(HIS,'浏览历史');}
  function mine(){
    pageTitle('我的');var d=[],tools=D.toolLinks(),i,t;d.push(shortcut('我的收藏',icon('favorite'),route('yesheFavorites')));d.push(shortcut('浏览历史',icon('history'),route('yesheHistory')));d.push(shortcut('网站登录',icon('account'),'web://'+P.loginUrl()));d.push(shortcut('设置诊断',icon('settings'),route('yesheSettings')));d.push(section('站点功能','登录/签到/社区类功能先复用网站会话，后续再按实机协议原生化'));for(i=0;i<tools.length;i++){t=tools[i];d.push({title:t.name,desc:t.url,col_type:'text_1',url:'web://'+t.url});}setResult(d);
  }
  function settings(){
    pageTitle('设置与诊断');var d=[],pd=P.diag(),bd=PB.diag(),host=P.discover(false),fb=getItem(PB.fallbackKey,'sniff'),label=fb==='web'?'网页兜底':fb==='none'?'关闭兜底':'自动嗅探';
    d.push({title:'当前线路',desc:host,col_type:'text_1',url:$('').lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10105);var h=YesheBoot.module().refreshHost();refreshPage(false);return'toast://当前线路：'+h;},BOOT)});
    d.push({title:'播放兜底 · '+label,desc:'结构化直链优先；只在直链失败时使用',col_type:'text_1',url:$(['自动嗅探','网页兜底','关闭兜底'],1,'播放兜底').select(function(){var m={'自动嗅探':'sniff','网页兜底':'web','关闭兜底':'none'};setItem('yeshe_play_fallback_v1',m[input]||'sniff');refreshPage(false);return'toast://已切换：'+input;})});
    d.push({title:'网站登录',desc:'打开当前线路登录页并保留网站 Cookie',col_type:'text_1',url:'web://'+P.loginUrl()});
    d.push({title:'程序版本',desc:VERSION+' · Build '+BUILD+' · Test',col_type:'text_1',url:'hiker://empty'});
    d.push({title:'协议诊断\n'+JSON.stringify(pd),desc:'',col_type:'long_text',url:'hiker://empty'});
    d.push({title:'播放诊断\n'+JSON.stringify(bd),desc:'',col_type:'long_text',url:'hiker://empty'});
    d.push({title:'清理页面缓存',desc:'仅清分类导航/分页/搜索路由缓存，不清收藏历史和登录 Cookie',col_type:'text_1',url:$('').lazyRule(function(){clearItem('yeshe_nav_cache_v2');clearItem('yeshe_pager_mode_v2');clearItem('yeshe_search_route_v2');refreshPage(false);return'toast://页面缓存已清理';})});
    setResult(d);
  }
  function refreshHost(){clearItem('yeshe_last_good_origin_v2');clearItem('yeshe_nav_cache_v2');return P.discover(true);}
  function play(u){return PB.play(u);}
  function routePage(){var path=param('yeshe_page')||'';if(path==='catalog')return catalog();if(path==='mine')return mine();return home();}
  function module(){return{version:VERSION,build:BUILD,home:home,catalog:catalog,category:category,search:search,detail:detail,favorites:favorites,history:history,mine:mine,settings:settings,play:play,toggleFavorite:toggleFavorite,refreshHost:refreshHost,route:routePage};}
  return{version:VERSION,build:BUILD,module:module};
})();