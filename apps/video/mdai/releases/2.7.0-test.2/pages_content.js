/* MDAI content pages 2.7.0-test.2 */
var MDAIContentPagesV270=(function(){
  var U=MDAIUIBaseV270,D=U.design;
  var ACTIVE_BG='#E7EBFF';
  var LIB={type:'mdai_library_type_v271',menu:'mdai_library_menu_v271',cat:'mdai_library_cat_v271',dramaSort:'mdai_library_drama_sort_v271'};
  var KNOWN=[
    {id:27,name:'每日更新',menuId:1,uiOrder:1},{id:10,name:'麻豆x性吧联合原创',menuId:1,uiOrder:2},{id:13,name:'清纯少女',menuId:1,uiOrder:3},{id:6,name:'麻豆原创AI',menuId:1,uiOrder:4},{id:19,name:'黑料吃瓜',menuId:1,uiOrder:5},{id:14,name:'重口调教',menuId:1,uiOrder:6},{id:15,name:'直播大秀',menuId:1,uiOrder:7},{id:16,name:'网红主播',menuId:1,uiOrder:8},{id:9,name:'麻豆传媒',menuId:1,uiOrder:9},{id:17,name:'媚黑母狗',menuId:1,uiOrder:10},{id:18,name:'白虎少女',menuId:1,uiOrder:11},
    {id:1,name:'国产自拍（最新更新）',menuId:2,uiOrder:1},{id:21,name:'反差母狗',menuId:2,uiOrder:2},{id:4,name:'探花大神',menuId:2,uiOrder:3},{id:7,name:'91大神',menuId:2,uiOrder:4},{id:20,name:'破解偷拍',menuId:2,uiOrder:5},{id:28,name:'世界杯专栏',menuId:2,uiOrder:6},{id:22,name:'白虎嫩妹',menuId:2,uiOrder:7},{id:23,name:'家庭乱伦',menuId:2,uiOrder:8},{id:24,name:'熟女偷情',menuId:2,uiOrder:9},{id:25,name:'网黄原创',menuId:2,uiOrder:10},
    {id:2,name:'AV - 中文字幕',menuId:3,uiOrder:1},{id:8,name:'AV - 无码流出',menuId:3,uiOrder:2}
  ];
  var SHORT={10:'联合原创',6:'麻豆原创 AI',1:'国产最新',2:'AV · 中文字幕',8:'AV · 无码流出'};
  function plainSection(c,t,s){return{title:c.maskText(t),desc:s?c.maskText(s):'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function chip(title,on,url,col){return{title:title,url:url,col_type:col||'flex_button',extra:{backgroundColor:on?ACTIVE_BG:'',lineVisible:false}};}
  function libSwitch(key,value,clearCat){return $('#noLoading#').lazyRule(function(k,v,cc){if(v==='')clearMyVar(k);else putMyVar(k,String(v));if(cc)clearMyVar('mdai_library_cat_v271');refreshPage(false);return'hiker://empty';},key,String(value==null?'':value),clearCat?1:0);}
  function clearFiltersUrl(){return $('#noLoading#').lazyRule(function(){clearMyVar('mdai_filter_time');clearMyVar('mdai_filter_duration');clearMyVar('mdai_filter_sort');refreshPage(false);return'hiker://empty';});}
  function toggleFilterUrl(key,value){return $('#noLoading#').lazyRule(function(k,v){if(getMyVar(k,'')===v)clearMyVar(k);else putMyVar(k,v);refreshPage(false);return'hiker://empty';},key,value);}
  function libraryEntry(type,menu,cat,sort){return $('#noLoading#').lazyRule(function(t,m,c,s){if(t)putMyVar('mdai_library_type_v271',t);if(m)putMyVar('mdai_library_menu_v271',m);if(c)putMyVar('mdai_library_cat_v271',c);else if(m)clearMyVar('mdai_library_cat_v271');if(s)putMyVar('mdai_library_drama_sort_v271',s);return'hiker://page/mdaiLibrary?rule=&simple=true';},type||'',menu||'',cat||'',sort||'');}
  function menuName(menu){return String(menu)==='2'?'国产视频':(String(menu)==='3'?'中文字幕':'原创精选');}
  function catLabel(c,x){var id=String(x&&x.id!=null?x.id:'');return c.maskText(SHORT[id]||x.name||('分类 '+id));}
  function catalogCategories(c,menu){
    var map={},baseOrder={},i,k,id,r,remote=[];
    for(i=0;i<KNOWN.length;i++){k=KNOWN[i];id=String(k.id);map[id]={id:k.id,name:k.name,menuId:k.menuId,uiOrder:k.uiOrder,sortOrder:k.uiOrder};baseOrder[id]=k.uiOrder;}
    try{remote=c.getCategories('video')||[];}catch(e){remote=[];}
    for(i=0;i<remote.length;i++){
      r=remote[i]||{};id=String(r.id==null?'':r.id);if(!id)continue;
      if(map[id]){
        if(r.name)map[id].name=r.name;
        if(r.sortOrder!=null)map[id].sortOrder=r.sortOrder;
        map[id].enabled=r.enabled;
      }else{
        var mm=parseInt(r.menuId||0);if(mm<1||mm>3)continue;
        map[id]={id:r.id,name:r.name||('分类 '+id),menuId:mm,uiOrder:1000+parseInt(r.sortOrder||0),sortOrder:parseInt(r.sortOrder||0),enabled:r.enabled};
      }
    }
    var out=[];Object.keys(map).forEach(function(xid){var x=map[xid];if(String(x.menuId)===String(menu)&&x.enabled!==false)out.push(x);});
    out.sort(function(a,b){var ao=baseOrder[String(a.id)]!=null?baseOrder[String(a.id)]:parseInt(a.uiOrder||1000),bo=baseOrder[String(b.id)]!=null?baseOrder[String(b.id)]:parseInt(b.uiOrder||1000);return ao-bo||parseInt(a.sortOrder||0)-parseInt(b.sortOrder||0)||parseInt(a.id||0)-parseInt(b.id||0);});
    return out;
  }
  function header(c,d){
    d.push({title:'搜索',col_type:'input',url:$.toString(function(){var w=String(input||'').trim();if(!w)return'toast://请输入关键词';putMyVar('keyword',w);$.require('mdai').saveSearchWord(w);return'hiker://page/mdaiSearch?rule=&simple=true&kw='+encodeURIComponent(w);}),extra:{defaultValue:'',titleVisible:true,onChange:$.toString(function(){})}});
    U.nav(c,d,'短剧','drama');U.nav(c,d,'最新','recent');U.nav(c,d,'原创','menu1');U.nav(c,d,'国产','menu2');U.nav(c,d,'社区','posts');d.push(U.blank());
    U.quick(d,'片库',D.icons.library,U.page('mdaiLibrary'));U.quick(d,'收藏',D.icons.fav,U.page('mdaiMine',{mode:'favorites'}));U.quick(d,'历史',D.icons.history,U.page('mdaiMine',{mode:'history'}));U.quick(d,'设置',D.icons.settings,U.page('mdaiSettings'));d.push(U.line());
  }
  function dramas(c,d,pg){if(pg>1)return;var h=c.payload(c.request('/api/v1/short-dramas/home?productId=1'))||{},banner=Array.isArray(h.banner)?h.banner:[],chase=Array.isArray(h.chaseRank)?h.chaseRank:[],featured=Array.isArray(h.featured)?h.featured:[];
    if(banner.length){d.push(U.section(c,'今日精选','AI 短剧'));var x=banner[0],cv=U.cover(c,x);d.push({title:U.title(c,x),desc:U.meta(c,x,'drama'),img:cv,pic_url:cv,url:U.detailUrl(c,x,'drama'),col_type:'movie_1_vertical_pic_blur',extra:{gradient:true,lineVisible:false}});banner.slice(1,4).forEach(function(v){d.push(U.card(c,v,'drama','movie_3'));});d.push(U.line());}
    if(chase.length){d.push(U.section(c,'热门追剧','热度上升',libraryEntry('drama','','','heat')));chase.slice(0,6).forEach(function(v){d.push(U.card(c,v,'drama','movie_3'));});d.push(U.line());}
    if(featured.length){d.push(U.section(c,'编辑精选','近期推荐'));featured.slice(0,6).forEach(function(v){d.push(U.card(c,v,'drama','movie_3'));});}
    if(!banner.length&&!chase.length&&!featured.length)d.push(U.empty('暂时没有短剧推荐','可以进入片库查看完整内容'));
  }
  function recent(c,d,pg){if(pg===1)d.push(U.section(c,'最近更新','按发布时间'));var a=c.items(c.request(c.buildVideoPath('',pg,c.pageSize(),false)));a.forEach(function(x){d.push(U.card(c,x,'video','movie_2'));});if(!a.length&&pg===1)d.push(U.empty('暂无最近更新'));}
  function channel(c,d,menu,pg){if(pg>1)return;var cats=catalogCategories(c,menu),shown=0;d.push(U.section(c,menu===1?'原创精选':'国产视频','按主题浏览',libraryEntry('video',String(menu),'','')));for(var i=0;i<cats.length&&shown<4;i++){var cat=cats[i],a=[];try{a=c.items(c.request('/api/v1/videos?categoryId='+U.enc(cat.id)+'&page=1&size=4'));}catch(e){}if(!a.length)continue;d.push(U.section(c,catLabel(c,cat),'精选 '+a.length+' 条',libraryEntry('video',String(menu),String(cat.id),'')));a.slice(0,4).forEach(function(x){d.push(U.card(c,x,'video','movie_2'));});shown++;if(shown<4)d.push(U.blank());}if(!shown)d.push(U.empty('当前频道暂无内容'));}
  function posts(c,d,pg){if(pg===1)d.push(U.section(c,'社区动态','最新帖子'));var a=c.items(c.request('/api/v1/posts?page='+pg+'&size=20&sort=latest'));a.forEach(function(x){var imgs=Array.isArray(x.images)?x.images:[],cv=c.image(x.coverUrl||x.cover||(imgs[0]||'')),desc=c.cleanText(x.content||x.description||'').replace(/\n+/g,' ');if(desc.length>46)desc=desc.slice(0,46)+'…';d.push({title:U.title(c,x),desc:desc,img:cv,pic_url:cv,url:U.detailUrl(c,x,'post'),col_type:'movie_1_left_pic',extra:{lineVisible:false}});});if(!a.length&&pg===1)d.push(U.empty('暂无社区内容'));}
  function home(c){var d=[],pg=MY_PAGE||1;try{if(pg===1)header(c,d);var t=getMyVar('mdai_home_tab_v270','drama');if(t==='drama')dramas(c,d,pg);else if(t==='recent')recent(c,d,pg);else if(t==='menu1')channel(c,d,1,pg);else if(t==='menu2')channel(c,d,2,pg);else posts(c,d,pg);}catch(e){d.push(U.empty('页面加载失败',String(e.message||e)));if(pg===1)d.push({title:'打开设置',url:U.page('mdaiSettings'),col_type:'text_center_1'});}setResult(d);}
  function library(c){
    var d=[],pg=MY_PAGE||1,type=getMyVar(LIB.type,'video')||'video';
    try{
      if(pg===1){
        setPageTitle('片库');
        d.push(plainSection(c,'内容类型','视频与短剧在同一片库内切换'));
        d.push(chip('视频',type==='video',libSwitch(LIB.type,'video',0),'text_2'));
        d.push(chip('短剧',type==='drama',libSwitch(LIB.type,'drama',0),'text_2'));
        d.push(U.line());
      }
      if(type==='drama'){
        var ds=getMyVar(LIB.dramaSort,'heat')||'heat';
        if(pg===1){
          d.push(plainSection(c,'短剧排序','原地切换，不新增页面'));
          d.push(chip('热播',ds==='heat',libSwitch(LIB.dramaSort,'heat',0),'text_2'));
          d.push(chip('最新',ds==='latest',libSwitch(LIB.dramaSort,'latest',0),'text_2'));
          d.push(U.line());
          d.push(plainSection(c,'短剧内容',ds==='heat'?'按热度浏览':'按更新时间浏览'));
        }
        var dl=c.items(c.request('/api/v1/short-dramas?productId=1&sortBy='+U.enc(ds)+'&page='+pg+'&size='+Math.min(c.pageSize(),30)));
        dl.forEach(function(x){d.push(U.card(c,x,'drama','movie_3'));});
        if(!dl.length&&pg===1)d.push(U.empty('暂无短剧数据'));
        setResult(d);return;
      }
      var menu=getMyVar(LIB.menu,'1')||'1',cat=getMyVar(LIB.cat,''),cats=catalogCategories(c,menu),selected=null;
      for(var ci=0;ci<cats.length;ci++)if(String(cats[ci].id)===String(cat)){selected=cats[ci];break;}
      if(cat&&!selected){clearMyVar(LIB.cat);cat='';}
      if(pg===1){
        d.push(plainSection(c,'视频栏目','固定三栏，不再出现横向溢出箭头'));
        [['1','原创'],['2','国产'],['3','字幕']].forEach(function(a){d.push(chip(a[1],String(menu)===a[0],libSwitch(LIB.menu,a[0],1),'text_3'));});
        d.push(U.line());
        d.push(plainSection(c,'主题分类',menuName(menu)+' · '+cats.length+' 个分类'));
        d.push(chip('全部',!cat,libSwitch(LIB.cat,'',0),'flex_button'));
        cats.forEach(function(x){d.push(chip(catLabel(c,x),String(cat)===String(x.id),libSwitch(LIB.cat,String(x.id),0),'flex_button'));});
        d.push(U.line());
        var ft=getMyVar('mdai_filter_time',''),fd=getMyVar('mdai_filter_duration',''),fs=getMyVar('mdai_filter_sort',''),any=!!(ft||fd||fs);
        d.push(plainSection(c,'高级筛选',any?'已启用筛选，可组合使用':'默认展示全部内容'));
        d.push(chip('默认',!any,clearFiltersUrl(),'text_4'));
        d.push(chip('近1月',ft==='1m',toggleFilterUrl('mdai_filter_time','1m'),'text_4'));
        d.push(chip('20分+',fd==='20',toggleFilterUrl('mdai_filter_duration','20'),'text_4'));
        d.push(chip('点赞',fs==='likes',toggleFilterUrl('mdai_filter_sort','likes'),'text_4'));
        d.push(U.line());
        d.push(plainSection(c,'内容结果',selected?catLabel(c,selected):menuName(menu)+' · 全部'));
      }
      var a=c.items(c.request(c.buildVideoPath(cat,pg,c.pageSize(),true)));
      a.forEach(function(x){d.push(U.card(c,x,'video','movie_2'));});
      if(!a.length&&pg===1)d.push(U.empty('当前筛选暂无内容','切换主题或重置高级筛选后再试'));
    }catch(e){d.push(U.empty('片库加载失败',String(e.message||e)));}
    setResult(d);
  }
  function search(c){var d=[],pg=MY_PAGE||1,kw=String(U.qp('kw',getMyVar('keyword',''))||'').trim();if(kw)putMyVar('keyword',kw);try{if(pg===1){setPageTitle('搜索');d.push({title:'搜索',col_type:'input',url:$.toString(function(){var w=String(input||'').trim();if(!w)return'toast://请输入关键词';putMyVar('keyword',w);$.require('mdai').saveSearchWord(w);return'hiker://page/mdaiSearch?rule=&simple=true&kw='+encodeURIComponent(w);}),extra:{defaultValue:kw,titleVisible:true,onChange:$.toString(function(){})}});}if(!kw){if(pg===1){try{var hot=c.payload(c.request('/api/v1/hot-searches?period=recent'));if(Array.isArray(hot)&&hot.length){d.push(U.section(c,'热门搜索','官方趋势'));hot.slice(0,10).forEach(function(x){d.push({title:c.cleanText(x.name),url:U.page('mdaiSearch',{kw:x.name}),col_type:'flex_button'});});d.push(U.line());}}catch(e){}var his=c.readList(c.searchKey);if(his.length){d.push(U.section(c,'最近搜索','本地记录'));his.slice(0,10).forEach(function(w){d.push({title:c.maskText(w),url:U.page('mdaiSearch',{kw:w}),col_type:'flex_button'});});}else d.push(U.empty('输入关键词开始搜索'));}setResult(d);return;}if(pg===1){c.saveSearchWord(kw);d.push(U.section(c,'搜索结果','“'+c.maskText(kw)+'”'));}var a=c.items(c.request('/api/v1/videos/search?q='+U.enc(kw)+'&page='+pg+'&size='+c.pageSize()));a.forEach(function(x){d.push(U.card(c,x,'video','movie_2'));});if(!a.length&&pg===1)d.push(U.empty('没有找到相关内容','尝试更短的关键词'));}catch(e){d.push(U.empty('搜索失败',String(e.message||e)));}setResult(d);}
  function mine(c){var d=[],mode=U.qp('mode','favorites');setPageTitle('我的');['favorites','history'].forEach(function(v){var on=mode===v;d.push({title:on?'““'+(v==='favorites'?'收藏':'历史')+'””':(v==='favorites'?'收藏':'历史'),url:U.page('mdaiMine',{mode:v}),col_type:'text_2',extra:{backgroundColor:on?D.brand:'',lineVisible:false}});});d.push(U.line());var key=mode==='favorites'?c.favKey:c.historyKey,a=c.readList(key);d.push(U.section(c,mode==='favorites'?'我的收藏':'观看历史',a.length+' 条'));if(!a.length)d.push(U.empty(mode==='favorites'?'还没有收藏内容':'还没有观看记录'));else{d.push({title:'清空'+(mode==='favorites'?'收藏':'历史'),url:'confirm://确认清空吗？.js:'+$.toString(function(k){setItem(k,'[]');refreshPage(false);return'toast://已清空';},key),col_type:'scroll_button'});d.push(U.blank());a.forEach(function(x){d.push(U.localCard(c,x));});}setResult(d);}
  function comments(c){var d=[],pg=MY_PAGE||1,target=U.qp('target','video'),id=U.qp('id',''),title=U.qp('title','评论');if(pg===1){setPageTitle(c.shortTitle(title,14)+' · 评论');d.push(U.section(c,'评论区',target==='post'?'帖子讨论':'视频讨论'));}try{var p=target==='post'?'/api/v1/comments?postId='+U.enc(id)+'&page='+pg+'&size=20':'/api/v1/comments?videoId='+U.enc(id)+'&page='+pg+'&size=20',a=c.items(c.request(p));a.forEach(function(x){d.push({title:c.cleanText(x.authorName||x.username||'匿名用户'),desc:c.fmtDate(x.createdAt||''),img:D.icons.user,url:'hiker://empty',col_type:'avatar',extra:{lineVisible:false}});d.push({title:c.cleanText(x.content||''),url:'hiker://empty',col_type:'rich_text',extra:{lineVisible:false,textSize:16,lineSpacing:5}});});if(!a.length&&pg===1)d.push(U.empty('暂无评论'));}catch(e){d.push(U.empty('评论加载失败',String(e.message||e)));}setResult(d);}
  return{version:'2.7.0-test.2',home:home,library:library,search:search,mine:mine,comments:comments,catalogCategories:catalogCategories};
})();
