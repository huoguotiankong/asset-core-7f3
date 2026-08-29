/* 夜社短剧 Runtime/UI 0.1.0-test.1 */
var YesheRemoteRuntime=(function(){
  var VERSION='0.1.0-test.1',BUILD=10101,P=YesheProtocol,D=YesheProvider,PB=YeshePlayback;
  var BOOT='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/yeshe/bootstrap_test_v1_b10101.js?v=10101';
  var ASSET='https://cdn.jsdelivr.net/gh/huoguotiankong/asset-core-7f3@main/apps/video/yeshe/assets/';
  var FAV='yeshe_favorites_v1',HIS='yeshe_history_v1',SH='yeshe_search_history_v1',TAB='yeshe_home_tab_v1';
  function s(v){return v==null?'':String(v);}
  function clean(v){return P.clean(v);}
  function arr(key){try{var a=JSON.parse(getItem(key,'[]')||'[]');return Array.isArray(a)?a:[];}catch(e){return[];}}
  function saveArr(key,a){try{setItem(key,JSON.stringify(a));}catch(e){}}
  function hash(v){v=s(v);var h=0,i;for(i=0;i<v.length;i++)h=((h<<5)-h+v.charCodeAt(i))|0;return Math.abs(h);}
  function upsert(key,o,limit){var a=arr(key),b=[],i;if(!o||!o.url)return a;b.push(o);for(i=0;i<a.length&&b.length<(limit||80);i++)if(a[i]&&a[i].url!==o.url)b.push(a[i]);saveArr(key,b);return b;}
  function remove(key,url){var a=arr(key),b=[],i;for(i=0;i<a.length;i++)if(a[i]&&a[i].url!==url)b.push(a[i]);saveArr(key,b);return b;}
  function isFav(url){var a=arr(FAV),i;for(i=0;i<a.length;i++)if(a[i]&&a[i].url===url)return true;return false;}
  function route(path,params){var u='hiker://page/'+path+'?rule=&simple=true',k;params=params||{};for(k in params)if(params[k]!=null&&s(params[k])!=='')u+='&'+k+'='+encodeURIComponent(s(params[k]));return u;}
  function image(u,ref){u=s(u);if(!u)return ASSET+'icon_v1.svg?v=10101';try{return u+'@headers='+JSON.stringify({'Referer':ref||P.discover(false)+'/', 'User-Agent':P.ua});}catch(e){return u;}}
  function icon(name){return ASSET+name+'_v1.svg?v=10101';}
  function banner(){return ASSET+'banner_v1.svg?v=10101';}
  function tint(title){return '▌'+title;}
  function pageTitle(t){try{setPageTitle(t);}catch(e){}}
  function lazyPlay(url){return $('').lazyRule(function(boot,u){require(boot,{headers:{'Cache-Control':'no-cache'}},10101);return YesheBoot.module().play(u);},BOOT,url);}
  function lazyFavorite(item){return $('').lazyRule(function(boot,j){require(boot,{headers:{'Cache-Control':'no-cache'}},10101);var m=YesheBoot.module(),o={};try{o=JSON.parse(j);}catch(e){}return m.toggleFavorite(o);},BOOT,JSON.stringify(item||{}));}
  function lazyTab(key,val){return $('').lazyRule(function(k,v){putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,val);}
  function card(x,cls){
    x=x||{};return{title:clean(x.title)||'未命名内容',desc:clean(x.desc)||'点击查看详情',pic_url:image(x.cover,x.url),url:route('yesheDetail',{yeshe_url:x.url,yeshe_title:x.title,yeshe_cover:x.cover,yeshe_desc:x.desc}),col_type:'movie_3',extra:{id:'yeshe-card-'+hash(x.url),cls:cls||'yeshe-cards'}};
  }
  function cards(xs,cls){var o=[],i;for(i=0;i<(xs||[]).length;i++)o.push(card(xs[i],cls));return o;}
  function section(t,desc){return{title:t,desc:desc||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}};}
  function searchBox(){return{title:'搜索夜社内容',desc:'短剧、视频、动漫、漫画、写真、小说…',col_type:'input',url:"'hiker://page/yesheSearch?rule=&simple=true&kw='+encodeURIComponent(input)",extra:{id:'yeshe-search-input'}};}
  function shortcut(title,pic,url){return{title:title,pic_url:pic,col_type:'icon_small_4',url:url};}
  function home(){
    var page=D.pageNo(),tab=getMyVar(TAB,'hot'),head=[],r,i,t,items=[];
    if(page>1){r=D.home(tab,page);setResult(cards(r.items,'yeshe-home-feed'));return;}
    pageTitle('夜社短剧');
    head.push({title:'',desc:'',pic_url:banner(),url:'hiker://empty',col_type:'pic_1_full',extra:{id:'yeshe-home-banner'}});
    head.push(searchBox());
    head.push(shortcut('分类大全',icon('category'),route('yesheCatalog')));
    head.push(shortcut('热门短剧',icon('hot'),route('yesheCategory',{yeshe_category_name:'短剧',yeshe_category_url:D.shortUrl('')})));
    head.push(shortcut('我的收藏',icon('favorite'),route('yesheFavorites')));
    head.push(shortcut('浏览历史',icon('history'),route('yesheHistory')));
    head.push({title:tint('短剧频道'),desc:'热门类型横向切换 · 同页刷新',col_type:'text_1',url:'hiker://empty'});
    for(i=0;i<D.shortTabs.length;i++){t=D.shortTabs[i];head.push({title:t.name,col_type:'scroll_button',url:lazyTab(TAB,t.id),extra:{backgroundColor:t.id===tab?'#E93650':'#F4F4F4',fontColor:t.id===tab?'#FFFFFF':'#333333'}});}
    head.push({title:'最近更新',desc:'当前：'+(function(){for(var j=0;j<D.shortTabs.length;j++)if(D.shortTabs[j].id===tab)return D.shortTabs[j].name;return'热播';})(),col_type:'text_1',url:route('yesheCategory',{yeshe_category_name:'短剧',yeshe_category_url:D.shortUrl((function(){for(var j=0;j<D.shortTabs.length;j++)if(D.shortTabs[j].id===tab)return D.shortTabs[j].tid;return'';})())}),extra:{id:'yeshe-home-anchor'}});
    head.push({title:'正在加载内容…',desc:'首次打开会解析当前可用线路',col_type:'text_1',url:'hiker://empty',extra:{id:'yeshe-home-loading'}});
    setResult(head);
    r=D.home(tab,1);items=cards(r.items,'yeshe-home-feed');
    try{deleteItem('yeshe-home-loading');if(items.length)addItemAfter('yeshe-home-anchor',items);else addItemAfter('yeshe-home-anchor',{title:'暂未解析到内容',desc:'可进入设置刷新线路并查看诊断',col_type:'text_1',url:route('yesheSettings')});}catch(e){setResult(head.concat(items));}
  }
  function catalog(){
    pageTitle('分类大全');var c=D.catalog(),d=[],i,j,g,x;
    d.push(searchBox());d.push({title:tint('全站分类'),desc:'按网站栏目重排为原生分类中心；低频分类不挤首页',col_type:'text_1',url:'hiker://empty'});
    for(i=0;i<c.groups.length;i++){g=c.groups[i];d.push({title:'▌'+g.name,desc:'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});for(j=0;j<g.items.length;j++){x=g.items[j];d.push({title:x.name,col_type:'flex_button',url:route('yesheCategory',{yeshe_category_name:x.name,yeshe_category_url:x.url}),extra:{backgroundColor:'#F6F6F7'}});}}
    if(c.extras.length){d.push({title:'更多动态分类',desc:'来自当前站点导航',col_type:'text_1',url:'hiker://empty'});for(i=0;i<c.extras.length&&i<30;i++){x=c.extras[i];d.push({title:x.name,col_type:'flex_button',url:route('yesheCategory',{yeshe_category_name:x.name,yeshe_category_url:x.url})});}}
    setResult(d);
  }
  function category(){
    var name=getParam('yeshe_category_name')||'分类',url=getParam('yeshe_category_url')||'',page=D.pageNo(),r=D.category(name,url,page),d=[];
    if(page===1){pageTitle(name);d.push(searchBox());d.push({title:tint(name),desc:r.url?'按当前站点分类读取 · 支持翻页':'分类地址待解析',col_type:'text_1',url:'hiker://empty'});}
    if(r.error&&page===1)d.push({title:'分类暂不可用',desc:r.error+'。可先返回分类大全或设置中刷新线路。',col_type:'text_1',url:route('yesheSettings')});
    d=d.concat(cards(r.items,'yeshe-category-feed'));if(!r.items.length&&page===1&&!r.error)d.push({title:'当前分类没有解析到卡片',desc:'已保留分类入口；下一版可根据实机诊断继续冻结准确选择器。',col_type:'text_1',url:route('yesheSettings')});setResult(d);
  }
  function search(){
    var kw=getParam('kw')||getParam('yeshe_kw')||'',page=D.pageNo(),d=[],r;if(page===1){pageTitle('搜索');d.push(searchBox());if(kw){var sh=arr(SH),b=[kw],i;for(i=0;i<sh.length&&b.length<20;i++)if(sh[i]!==kw)b.push(sh[i]);saveArr(SH,b);}else{var hs=arr(SH);if(hs.length){d.push(section('最近搜索','点词直接搜索'));for(var j=0;j<hs.length;j++)d.push({title:hs[j],col_type:'flex_button',url:route('yesheSearch',{kw:hs[j]})});}setResult(d);return;}}
    r=D.search(kw,page);if(page===1)d.push({title:tint('搜索：'+kw),desc:r.items.length?'已找到 '+r.items.length+' 个当前页结果':'正在使用站点搜索结构',col_type:'text_1',url:'hiker://empty'});d=d.concat(cards(r.items,'yeshe-search-feed'));if(!r.items.length&&page===1)d.push({title:'没有解析到结果',desc:'可能是站点搜索路由变化；设置页可查看最近协议诊断。',col_type:'text_1',url:route('yesheSettings')});setResult(d);
  }
  function detailSeed(){return{title:getParam('yeshe_title')||'',cover:getParam('yeshe_cover')||'',desc:getParam('yeshe_desc')||''};}
  function detail(){
    var url=getParam('yeshe_url')||'',o=D.detail(url,detailSeed()),d=[],i,lineMap={},lines=[],ln,key='yeshe_line_'+hash(url),sel='',ordKey='yeshe_order_'+hash(url),order=getMyVar(ordKey,'asc'),eps=[],chapters=o.chapters||[];
    pageTitle(o.title||'内容详情');upsert(HIS,{url:o.url,title:o.title,cover:o.cover,desc:o.desc,time:new Date().getTime()},100);
    d.push({title:o.title,desc:o.desc||('类型：'+o.kind),pic_url:image(o.cover,o.url),url:'hiker://empty',col_type:o.cover?'movie_1_vertical_pic_blur':'text_1',extra:{id:'yeshe-detail-hero'}});
    if(o.episodes.length){for(i=0;i<o.episodes.length;i++){ln=o.episodes[i].line;if(!lineMap[ln]){lineMap[ln]=[];lines.push(ln);}lineMap[ln].push(o.episodes[i]);}sel=getMyVar(key,String(lines[0]));if(!lineMap[Number(sel)])sel=String(lines[0]);eps=lineMap[Number(sel)]||[];if(order==='desc')eps=eps.slice(0).reverse();
      d.push({title:'▶ 立即播放 · '+(eps[0]?eps[0].title:'第1集'),desc:'优先解析直链；结构化解析失败才进入嗅探兜底',col_type:'text_1',url:eps[0]?lazyPlay(eps[0].url):'hiker://empty',extra:{backgroundColor:'#E93650'}});
    }else if(o.kind==='gallery'&&o.gallery.length){d.push({title:'查看图集 · '+o.gallery.length+' 张',desc:'使用海阔图片阅读',col_type:'text_1',url:galleryUrl(o.gallery,o.url)});}else if(o.kind==='text'&&o.article){d.push({title:'正文',desc:'',col_type:'text_1',url:'hiker://empty'});d.push({title:o.article,col_type:'long_text',url:'hiker://empty'});}
    d.push({title:isFav(o.url)?'已收藏':'加入本地收藏',pic_url:icon('favorite'),col_type:'icon_small_4',url:lazyFavorite({url:o.url,title:o.title,cover:o.cover,desc:o.desc})});
    d.push({title:'网站原页',pic_url:icon('browser'),col_type:'icon_small_4',url:'web://'+o.url});
    d.push({title:'登录账号',pic_url:icon('account'),col_type:'icon_small_4',url:'web://'+P.loginUrl()});
    d.push({title:'设置诊断',pic_url:icon('settings'),col_type:'icon_small_4',url:route('yesheSettings')});
    if(o.episodes.length){d.push({title:'选集 · '+eps.length+' 集',desc:'线路 '+sel+' · '+(order==='asc'?'正序':'倒序'),col_type:'text_1',url:'hiker://empty'});for(i=0;i<lines.length;i++)d.push({title:'线路 '+lines[i],col_type:'scroll_button',url:lazyTab(key,String(lines[i])),extra:{backgroundColor:String(lines[i])===String(sel)?'#E93650':'#F4F4F4',fontColor:String(lines[i])===String(sel)?'#FFFFFF':'#333333'}});d.push({title:order==='asc'?'切换倒序':'切换正序',col_type:'flex_button',url:lazyTab(ordKey,order==='asc'?'desc':'asc')});for(i=0;i<eps.length;i++)d.push({title:eps[i].title||('第'+eps[i].episode+'集'),desc:'',col_type:'text_4',url:lazyPlay(eps[i].url),extra:{cls:'yeshe-episode'}});}
    if(chapters.length){d.push(section('章节目录','共 '+chapters.length+' 章'));for(i=0;i<chapters.length;i++)d.push({title:chapters[i].title,col_type:'text_1',url:route('yesheDetail',{yeshe_url:chapters[i].url,yeshe_title:chapters[i].title})});}
    if(o.article&&o.kind!=='text'){d.push(section('内容简介',''));d.push({title:o.article.length>1200?o.article.substring(0,1200)+'…':o.article,col_type:'long_text',url:'hiker://empty'});}
    if(o.gallery.length>=3&&o.kind!=='gallery'){d.push({title:'图集 / 正文图片 · '+o.gallery.length+' 张',desc:'点击全屏查看',col_type:'text_1',url:galleryUrl(o.gallery,o.url)});}
    if(o.related.length){d.push(section('相关推荐','继续发现'));d=d.concat(cards(o.related,'yeshe-related'));}
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
    d.push({title:'当前线路',desc:host,col_type:'text_1',url:$('').lazyRule(function(boot){require(boot,{headers:{'Cache-Control':'no-cache'}},10101);var h=YesheBoot.module().refreshHost();refreshPage(false);return'toast://当前线路：'+h;},BOOT)});
    d.push({title:'播放兜底 · '+label,desc:'结构化直链优先；只在直链失败时使用',col_type:'text_1',url:$(['自动嗅探','网页兜底','关闭兜底'],1,'播放兜底').select(function(){var m={'自动嗅探':'sniff','网页兜底':'web','关闭兜底':'none'};setItem('yeshe_play_fallback_v1',m[input]||'sniff');refreshPage(false);return'toast://已切换：'+input;})});
    d.push({title:'网站登录',desc:'打开当前线路登录页并保留网站 Cookie',col_type:'text_1',url:'web://'+P.loginUrl()});
    d.push({title:'程序版本',desc:VERSION+' · Build '+BUILD+' · Test',col_type:'text_1',url:'hiker://empty'});
    d.push({title:'协议诊断',desc:JSON.stringify(pd),col_type:'long_text',url:'hiker://empty'});
    d.push({title:'播放诊断',desc:JSON.stringify(bd),col_type:'long_text',url:'hiker://empty'});
    d.push({title:'清理页面缓存',desc:'仅清分类导航/分页/搜索路由缓存，不清收藏历史和登录 Cookie',col_type:'text_1',url:$('').lazyRule(function(){clearItem('yeshe_nav_cache_v1');clearItem('yeshe_pager_mode_v1');clearItem('yeshe_search_route_v1');refreshPage(false);return'toast://页面缓存已清理';})});
    setResult(d);
  }
  function refreshHost(){clearItem('yeshe_last_good_origin_v1');clearItem('yeshe_nav_cache_v1');return P.discover(true);}
  function play(u){return PB.play(u);}
  function routePage(){var path=getParam('yeshe_page')||'';if(path==='catalog')return catalog();if(path==='mine')return mine();return home();}
  function module(){return{version:VERSION,build:BUILD,home:home,catalog:catalog,category:category,search:search,detail:detail,favorites:favorites,history:history,mine:mine,settings:settings,play:play,toggleFavorite:toggleFavorite,refreshHost:refreshHost,route:routePage};}
  return{version:VERSION,build:BUILD,module:module};
})();