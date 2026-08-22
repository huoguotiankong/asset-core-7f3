/* MDAI content pages 2.8.0-test.1 */
var MDAIContentPagesV280=(function(){
  var U=MDAIUIBaseV280,D=U.design;
  var LIB={type:'mdai_library_type_v280',menu:'mdai_library_menu_v280',cat:'mdai_library_cat_v280',expand:'mdai_library_expand_v280',adv:'mdai_library_adv_v280',dramaSort:'mdai_library_drama_sort_v280'};
  var KNOWN=[
    {id:27,name:'每日更新',menuId:1,uiOrder:1},{id:10,name:'麻豆x性吧联合原创',menuId:1,uiOrder:2},{id:13,name:'清纯少女',menuId:1,uiOrder:3},{id:6,name:'麻豆原创AI',menuId:1,uiOrder:4},{id:19,name:'黑料吃瓜',menuId:1,uiOrder:5},{id:14,name:'重口调教',menuId:1,uiOrder:6},{id:15,name:'直播大秀',menuId:1,uiOrder:7},{id:16,name:'网红主播',menuId:1,uiOrder:8},{id:9,name:'麻豆传媒',menuId:1,uiOrder:9},{id:17,name:'媚黑母狗',menuId:1,uiOrder:10},{id:18,name:'白虎少女',menuId:1,uiOrder:11},
    {id:1,name:'国产自拍（最新更新）',menuId:2,uiOrder:1},{id:21,name:'反差母狗',menuId:2,uiOrder:2},{id:4,name:'探花大神',menuId:2,uiOrder:3},{id:7,name:'91大神',menuId:2,uiOrder:4},{id:20,name:'破解偷拍',menuId:2,uiOrder:5},{id:28,name:'世界杯专栏',menuId:2,uiOrder:6},{id:22,name:'白虎嫩妹',menuId:2,uiOrder:7},{id:23,name:'家庭乱伦',menuId:2,uiOrder:8},{id:24,name:'熟女偷情',menuId:2,uiOrder:9},{id:25,name:'网黄原创',menuId:2,uiOrder:10},
    {id:2,name:'AV - 中文字幕',menuId:3,uiOrder:1},{id:8,name:'AV - 无码流出',menuId:3,uiOrder:2}
  ];
  var SHORT={10:'联合原创',6:'麻豆原创 AI',1:'国产最新',2:'中文字幕',8:'无码流出'};
  function catLabel(c,x){var k=String(x&&x.id!=null?x.id:'');return c.maskText(SHORT[k]||x.name||('分类 '+k));}
  function menuName(menu){return String(menu)==='2'?'国产':(String(menu)==='3'?'字幕':'原创');}
  function catalogCategories(c,menu){
    var map={},order={},remote=[],i,k,id,r;
    for(i=0;i<KNOWN.length;i++){k=KNOWN[i];id=String(k.id);map[id]={id:k.id,name:k.name,menuId:k.menuId,uiOrder:k.uiOrder,sortOrder:k.uiOrder,enabled:true};order[id]=k.uiOrder;}
    try{remote=c.getCategories('video')||[];}catch(e){remote=[];}
    for(i=0;i<remote.length;i++){
      r=remote[i]||{};id=String(r.id==null?'':r.id);if(!id)continue;
      if(map[id]){if(r.name)map[id].name=r.name;if(r.sortOrder!=null)map[id].sortOrder=r.sortOrder;if(r.enabled===false)map[id].enabled=false;}
      else{var mm=parseInt(r.menuId||0);if(mm<1||mm>3)continue;map[id]={id:r.id,name:r.name||('分类 '+id),menuId:mm,uiOrder:1000+parseInt(r.sortOrder||0),sortOrder:parseInt(r.sortOrder||0),enabled:r.enabled!==false};}
    }
    var out=[];Object.keys(map).forEach(function(xid){var x=map[xid];if(String(x.menuId)===String(menu)&&x.enabled!==false)out.push(x);});
    out.sort(function(a,b){var ao=order[String(a.id)]!=null?order[String(a.id)]:parseInt(a.uiOrder||1000),bo=order[String(b.id)]!=null?order[String(b.id)]:parseInt(b.uiOrder||1000);return ao-bo||parseInt(a.sortOrder||0)-parseInt(b.sortOrder||0)||parseInt(a.id||0)-parseInt(b.id||0);});
    return out;
  }
  function setLib(key,value,clearCat){return $('#noLoading#').lazyRule(function(k,v,cc){if(v==='')clearMyVar(k);else putMyVar(k,String(v));if(cc){clearMyVar('mdai_library_cat_v280');clearMyVar('mdai_library_expand_v280');}refreshPage(false);return'hiker://empty';},key,String(value==null?'':value),clearCat?1:0);}
  function libraryEntry(type,menu,cat,sort){return $('#noLoading#').lazyRule(function(t,m,c,s){if(t)putMyVar('mdai_library_type_v280',t);if(m)putMyVar('mdai_library_menu_v280',m);if(c)putMyVar('mdai_library_cat_v280',c);else if(m)clearMyVar('mdai_library_cat_v280');if(s)putMyVar('mdai_library_drama_sort_v280',s);return'hiker://page/mdaiLibrary?rule=&simple=true';},type||'',menu||'',cat||'',sort||'');}
  function searchBox(d,home){
    d.push({title:'搜索内容',col_type:'input',url:$.toString(function(isHome){var w=String(input||'').trim();if(!w)return'toast://请输入关键词';putMyVar('keyword',w);try{$.require('mdai').saveSearchWord(w);}catch(e){}if(isHome)return'hiker://page/mdaiSearch?rule=&simple=true';refreshPage(false);return'hiker://empty';},home?1:0),extra:{defaultValue:home?'':getMyVar('keyword',''),titleVisible:true,onChange:$.toString(function(){})}});
  }
  function homeHeader(c,d){
    searchBox(d,true);
    U.homeTab(c,d,'推荐','recommend');U.homeTab(c,d,'视频','video');U.homeTab(c,d,'短剧','drama');U.homeTab(c,d,'社区','posts');
    d.push(U.blank());
    U.quick(d,'片库',D.icons.library,U.page('mdaiLibrary'));U.quick(d,'收藏',D.icons.fav,U.page('mdaiMine',{mode:'favorites'}));U.quick(d,'历史',D.icons.history,U.page('mdaiMine',{mode:'history'}));U.quick(d,'设置',D.icons.settings,U.page('mdaiSettings'));
    d.push(U.line());
  }
  function recommend(c,d,pg){
    if(pg>1)return;
    var home={},banner=[],hot=[],featured=[];
    try{home=c.payload(c.request('/api/v1/short-dramas/home?productId=1'))||{};banner=Array.isArray(home.banner)?home.banner:[];hot=Array.isArray(home.chaseRank)?home.chaseRank:[];featured=Array.isArray(home.featured)?home.featured:[];}catch(e){}
    if(banner.length){d.push(U.section(c,'今日推荐','AI 短剧精选',libraryEntry('drama','','','heat')));d.push(U.hero(c,banner[0],'drama'));banner.slice(1,4).forEach(function(x){d.push(U.card(c,x,'drama','movie_3'));});d.push(U.line());}
    var latest=[];try{latest=c.items(c.request(c.buildVideoPath('27',1,8,false)));}catch(e2){}
    if(latest.length){d.push(U.section(c,'最近更新','刚刚上新',libraryEntry('video','1','27','')));latest.slice(0,6).forEach(function(x){d.push(U.card(c,x,'video','movie_2'));});d.push(U.line());}
    var dramas=hot.length?hot:featured;if(dramas.length){d.push(U.section(c,'热门短剧','热度上升',libraryEntry('drama','','','heat')));dramas.slice(0,6).forEach(function(x){d.push(U.card(c,x,'drama','movie_3'));});d.push(U.line());}
    var posts=[];try{posts=c.items(c.request('/api/v1/posts?page=1&size=4&sort=latest'));}catch(e3){}
    if(posts.length){d.push(U.section(c,'社区热帖','最新讨论'));posts.slice(0,4).forEach(function(x){var imgs=Array.isArray(x.images)?x.images:[],cv=c.image(x.coverUrl||x.cover||(imgs[0]||'')),desc=c.cleanText(x.content||x.description||'').replace(/\n+/g,' ');if(desc.length>42)desc=desc.slice(0,42)+'…';d.push({title:U.title(c,x),desc:desc,img:cv,pic_url:cv,url:U.detailUrl(c,x,'post'),col_type:'movie_1_left_pic',extra:{lineVisible:false}});});}
    if(!banner.length&&!latest.length&&!dramas.length&&!posts.length)d.push(U.empty('暂时没有推荐内容','可以进入片库继续浏览'));
  }
  function videos(c,d,pg){if(pg===1)d.push(U.section(c,'视频更新','按时间浏览',libraryEntry('video','1','','')));var a=[];try{a=c.items(c.request(c.buildVideoPath('',pg,c.pageSize(),false)));}catch(e){}a.forEach(function(x){d.push(U.card(c,x,'video','movie_2'));});if(!a.length&&pg===1)d.push(U.empty('暂无视频内容'));}
  function dramas(c,d,pg){if(pg===1)d.push(U.section(c,'短剧片库','热播优先',libraryEntry('drama','','','heat')));var a=[];try{a=c.items(c.request('/api/v1/short-dramas?productId=1&sortBy=heat&page='+pg+'&size='+Math.min(c.pageSize(),30)));}catch(e){}a.forEach(function(x){d.push(U.card(c,x,'drama','movie_3'));});if(!a.length&&pg===1)d.push(U.empty('暂无短剧内容'));}
  function posts(c,d,pg){if(pg===1)d.push(U.section(c,'社区','最新动态'));var a=[];try{a=c.items(c.request('/api/v1/posts?page='+pg+'&size=20&sort=latest'));}catch(e){}a.forEach(function(x){var imgs=Array.isArray(x.images)?x.images:[],cv=c.image(x.coverUrl||x.cover||(imgs[0]||'')),desc=c.cleanText(x.content||x.description||'').replace(/\n+/g,' ');if(desc.length>50)desc=desc.slice(0,50)+'…';d.push({title:U.title(c,x),desc:desc,img:cv,pic_url:cv,url:U.detailUrl(c,x,'post'),col_type:'movie_1_left_pic',extra:{lineVisible:false}});});if(!a.length&&pg===1)d.push(U.empty('暂无社区内容'));}
  function home(c){var d=[],pg=MY_PAGE||1;try{if(pg===1)homeHeader(c,d);var tab=getMyVar('mdai_home_tab_v280','recommend')||'recommend';if(tab==='video')videos(c,d,pg);else if(tab==='drama')dramas(c,d,pg);else if(tab==='posts')posts(c,d,pg);else recommend(c,d,pg);}catch(e){d.push(U.empty('页面加载失败',String(e.message||e)));if(pg===1)d.push({title:'打开设置',url:U.page('mdaiSettings'),col_type:'text_center_1'});}setResult(d);}
  function library(c){
    var d=[],pg=MY_PAGE||1,type=getMyVar(LIB.type,'video')||'video';
    try{
      if(pg===1){setPageTitle('片库');d.push(U.section(c,'片库','按内容类型与主题浏览'));d.push(U.chip('视频',type==='video',setLib(LIB.type,'video',0),'text_2'));d.push(U.chip('短剧',type==='drama',setLib(LIB.type,'drama',0),'text_2'));d.push(U.line());}
      if(type==='drama'){
        var ds=getMyVar(LIB.dramaSort,'heat')||'heat';
        if(pg===1){d.push(U.section(c,'短剧','选择排序'));d.push(U.chip('热播',ds==='heat',setLib(LIB.dramaSort,'heat',0),'text_2'));d.push(U.chip('最新',ds==='latest',setLib(LIB.dramaSort,'latest',0),'text_2'));d.push(U.line());}
        var dl=c.items(c.request('/api/v1/short-dramas?productId=1&sortBy='+U.enc(ds)+'&page='+pg+'&size='+Math.min(c.pageSize(),30)));dl.forEach(function(x){d.push(U.card(c,x,'drama','movie_3'));});if(!dl.length&&pg===1)d.push(U.empty('暂无短剧数据'));setResult(d);return;
      }
      var menu=getMyVar(LIB.menu,'1')||'1',cat=getMyVar(LIB.cat,''),cats=catalogCategories(c,menu),selected=null;
      for(var ci=0;ci<cats.length;ci++)if(String(cats[ci].id)===String(cat)){selected=cats[ci];break;}
      if(cat&&!selected){clearMyVar(LIB.cat);cat='';}
      if(pg===1){
        d.push(U.section(c,'视频分类',menuName(menu)+(selected?' · '+catLabel(c,selected):'')));
        d.push(U.chip('原创',menu==='1',setLib(LIB.menu,'1',1),'text_3'));d.push(U.chip('国产',menu==='2',setLib(LIB.menu,'2',1),'text_3'));d.push(U.chip('字幕',menu==='3',setLib(LIB.menu,'3',1),'text_3'));
        d.push(U.blank());
        var expanded=getMyVar(LIB.expand,'0')==='1',limit=expanded?cats.length:Math.min(6,cats.length);
        d.push(U.chip('全部',!cat,setLib(LIB.cat,'',0),'flex_button'));for(var i=0;i<limit;i++){var x=cats[i];d.push(U.chip(catLabel(c,x),String(cat)===String(x.id),setLib(LIB.cat,String(x.id),0),'flex_button'));}
        if(cats.length>6)d.push(U.chip(expanded?'收起':'展开全部 · '+cats.length,expanded,U.stateUrl(LIB.expand,expanded?'0':'1'),'flex_button'));
        d.push(U.line());
        var adv=getMyVar(LIB.adv,'0')==='1',ft=getMyVar('mdai_filter_time',''),fd=getMyVar('mdai_filter_duration',''),fs=getMyVar('mdai_filter_sort',''),filterText=[ft==='1m'?'近1月':'',fd==='20'?'20分+':'',fs==='likes'?'点赞':''].filter(Boolean).join(' · ');
        d.push({title:'筛选与排序',desc:filterText||'默认',url:U.stateUrl(LIB.adv,adv?'0':'1'),col_type:'text_1',extra:{lineVisible:false}});
        if(adv){
          var any=!!(ft||fd||fs);
          d.push(U.chip('默认',!any,$('#noLoading#').lazyRule(function(){clearMyVar('mdai_filter_time');clearMyVar('mdai_filter_duration');clearMyVar('mdai_filter_sort');refreshPage(false);return'hiker://empty';}),'text_4'));
          d.push(U.chip('近1月',ft==='1m',U.toggleVarUrl('mdai_filter_time','1m'),'text_4'));
          d.push(U.chip('20分+',fd==='20',U.toggleVarUrl('mdai_filter_duration','20'),'text_4'));
          d.push(U.chip('点赞',fs==='likes',U.toggleVarUrl('mdai_filter_sort','likes'),'text_4'));
        }
        d.push(U.line());d.push(U.section(c,'内容结果',selected?catLabel(c,selected):(menuName(menu)+' · 全部'));
      }
      var a=c.items(c.request(c.buildVideoPath(cat,pg,c.pageSize(),true)));a.forEach(function(x){d.push(U.card(c,x,'video','movie_2'));});if(!a.length&&pg===1)d.push(U.empty('当前筛选暂无内容','切换分类或清除筛选后再试'));
    }catch(e){d.push(U.empty('片库加载失败',String(e.message||e)));}
    setResult(d);
  }
  function search(c){
    var d=[],pg=MY_PAGE||1,kw=String(getMyVar('keyword','')||'').trim();
    try{
      if(pg===1){setPageTitle('搜索');searchBox(d,false);}
      if(!kw){if(pg===1){var hot=[];try{hot=c.payload(c.request('/api/v1/hot-searches?period=recent'))||[];}catch(e){}if(Array.isArray(hot)&&hot.length){d.push(U.section(c,'热门搜索','官方趋势'));hot.slice(0,8).forEach(function(x){var w=c.cleanText(x.name||'');if(w)d.push(U.chip(w,false,$('#noLoading#').lazyRule(function(v){putMyVar('keyword',v);$.require('mdai').saveSearchWord(v);refreshPage(false);return'hiker://empty';},w),'flex_button'));});d.push(U.line());}var his=c.readList(c.searchKey);if(his.length){d.push(U.section(c,'最近搜索','本地记录'));his.slice(0,8).forEach(function(w){d.push(U.chip(c.maskText(w),false,$('#noLoading#').lazyRule(function(v){putMyVar('keyword',v);refreshPage(false);return'hiker://empty';},w),'flex_button'));});}else d.push(U.empty('输入关键词开始搜索'));}setResult(d);return;}
      if(pg===1){c.saveSearchWord(kw);d.push(U.section(c,'搜索结果','“'+c.maskText(kw)+'”'));}
      var a=c.items(c.request('/api/v1/videos/search?q='+U.enc(kw)+'&page='+pg+'&size='+c.pageSize()));a.forEach(function(x){d.push(U.card(c,x,'video','movie_2'));});if(!a.length&&pg===1)d.push(U.empty('没有找到相关内容','尝试更短的关键词'));
    }catch(e){d.push(U.empty('搜索失败',String(e.message||e)));}
    setResult(d);
  }
  function mine(c){
    var d=[],requested=String(U.qp('mode','')||''),key='mdai_mine_tab_v280',cur=getMyVar(key,'');if(!cur&&requested){putMyVar(key,requested);cur=requested;}if(!cur)cur='favorites';setPageTitle('我的');
    d.push(U.chip('收藏',cur==='favorites',U.stateUrl(key,'favorites'),'text_2'));d.push(U.chip('历史',cur==='history',U.stateUrl(key,'history'),'text_2'));d.push(U.line());
    var dataKey=cur==='favorites'?c.favKey:c.historyKey,a=c.readList(dataKey);d.push(U.section(c,cur==='favorites'?'我的收藏':'观看历史',a.length+' 条'));
    if(!a.length)d.push(U.empty(cur==='favorites'?'还没有收藏内容':'还没有观看记录'));
    else{d.push({title:'清空'+(cur==='favorites'?'收藏':'历史'),desc:'不可撤销',url:'confirm://确认清空吗？.js:'+$.toString(function(k){setItem(k,'[]');refreshPage(false);return'toast://已清空';},dataKey),col_type:'text_1',extra:{lineVisible:false}});d.push(U.blank());a.forEach(function(x){d.push(U.localCard(c,x));});}
    setResult(d);
  }
  function comments(c){var d=[],pg=MY_PAGE||1,target=U.qp('target','video'),id=U.qp('id',''),title=U.qp('title','评论');if(pg===1){setPageTitle(c.shortTitle(title,14)+' · 评论');d.push(U.section(c,'评论区',target==='post'?'帖子讨论':'视频讨论'));}try{var p=target==='post'?'/api/v1/comments?postId='+U.enc(id)+'&page='+pg+'&size=20':'/api/v1/comments?videoId='+U.enc(id)+'&page='+pg+'&size=20',a=c.items(c.request(p));a.forEach(function(x){d.push({title:c.cleanText(x.authorName||x.username||'匿名用户'),desc:c.fmtDate(x.createdAt||''),img:D.icons.user,url:'hiker://empty',col_type:'avatar',extra:{lineVisible:false}});d.push({title:c.cleanText(x.content||''),url:'hiker://empty',col_type:'rich_text',extra:{lineVisible:false,textSize:16,lineSpacing:5}});});if(!a.length&&pg===1)d.push(U.empty('暂无评论'));}catch(e){d.push(U.empty('评论加载失败',String(e.message||e)));}setResult(d);}
  return{version:'2.8.0-test.1',home:home,library:library,search:search,mine:mine,comments:comments,catalogCategories:catalogCategories};
})();
