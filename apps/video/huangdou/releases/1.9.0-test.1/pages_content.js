/* 黄豆短剧 Content Pages 1.9.0-test.1 */
var HuangDouContentV190=(function(){
  var U=HuangDouUIV190,D=U.design;
  var HOME='hddj_home_tab_v190',LIB='hddj_library_cat_v190',MINE='hddj_mine_tab_v190';
  var CATS=[
    {id:'yuandou',name:'独家原创',path:'/category/yuandou/'},
    {id:'mgdj',name:'魔改短剧',path:'/category/mgdj/'},
    {id:'ai',name:'AI漫剧',path:'/category/ai/'},
    {id:'erciyuan',name:'二次元',path:'/category/erciyuan/'},
    {id:'cbdj',name:'擦边短剧',path:'/category/cbdj/'},
    {id:'real',name:'真人短剧',path:'/category/real/'},
    {id:'heiliao',name:'黑料',path:'/category/heiliao/'}
  ];
  function catById(id){for(var i=0;i<CATS.length;i++)if(CATS[i].id===id)return CATS[i];return CATS[0];}
  function libraryEntry(id){return $('#noLoading#').lazyRule(function(v){putMyVar('hddj_library_cat_v190',String(v||'yuandou'));return'hiker://page/hddjLibrary?rule=&simple=true';},id||'yuandou');}
  function searchBox(c,d){d.push({title:'搜索短剧、剧情、关键词',col_type:'input',url:$.toString(function(){var w=String(input||'').trim();if(!w)return'toast://请输入关键词';putMyVar('hddj_search_kw',w);$.require('hddj').saveSearchHistory(w);return'hiker://page/hddjSearch?rule=&simple=true&kw='+encodeURIComponent(w);}),extra:{defaultValue:'',titleVisible:true,onChange:$.toString(function(){})}});}
  function header(c,d){
    searchBox(c,d);
    [['recommend','推荐'],['mgdj','魔改'],['ai','AI漫'],['real','真人']].forEach(function(a){d.push(U.chip(a[1],getMyVar(HOME,'recommend')===a[0],U.stateUrl(HOME,a[0]),'text_4'));});
    d.push(U.blank());
    U.quick(d,'片库',D.icons.library,U.page('hddjLibrary'));
    U.quick(d,'专题',D.icons.topic,U.page('hddjTopic',{index:'1'}));
    U.quick(d,'我的',D.icons.mine,U.page('hddjMine'));
    U.quick(d,'设置',D.icons.settings,U.page('hddjSettings'));
    d.push(U.line());
  }
  function continueWatching(c,d){try{var a=JSON.parse(getItem('hddj_history','[]')||'[]');if(Array.isArray(a)&&a.length){a=a.filter(function(x){return x&&x.url;}).slice(0,3);if(a.length){d.push(U.section(c,'继续观看','最近 '+a.length+' 部'));a.forEach(function(x){d.push(U.card(c,x,'movie_3'));});d.push(U.line());}}}catch(e){}
  }
  function recommendation(c,d){
    var html=c.req('/'),list=c.parseCards(html)||[];
    continueWatching(c,d);
    var hot=c.hotSort(list).slice(0,6);
    if(hot.length){d.push(U.section(c,'热门推荐','按当前热度'));hot.forEach(function(x){d.push(U.card(c,x,'movie_3'));});d.push(U.line());}
    d.push(U.section(c,'最近更新',list.length?list.length+' 部':''));
    list.forEach(function(x){d.push(U.card(c,x,'movie_3'));});
    if(!list.length)d.push(U.empty('首页暂无内容','稍后重试或进入片库'));
  }
  function categoryFeed(c,d,id){var cat=catById(id),html=c.req(cat.path),list=c.parseCards(html)||[];d.push(U.section(c,cat.name,'分类精选',libraryEntry(cat.id)));list.forEach(function(x){d.push(U.card(c,x,'movie_3'));});if(!list.length)d.push(U.empty('当前分类暂无内容'));}
  function home(c){var d=[],pg=MY_PAGE||1;setPageTitle('黄豆短剧');try{if(pg===1)header(c,d);if(pg>1){setResult(d);return;}var t=getMyVar(HOME,'recommend');if(t==='recommend')recommendation(c,d);else categoryFeed(c,d,t);}catch(e){d.push(U.empty('页面加载失败',String(e.message||e)));}setResult(d);}
  function library(c){var d=[],pg=MY_PAGE||1,catId=getMyVar(LIB,'yuandou')||'yuandou',cat=catById(catId);setPageTitle('短剧片库');try{if(pg===1){d.push(U.section(c,'全部分类','点击后原地切换'));CATS.forEach(function(x){d.push(U.chip(c.maskText(x.name),cat.id===x.id,U.stateUrl(LIB,x.id),'flex_button'));});d.push(U.line());d.push(U.section(c,cat.name,'全部作品'));}if(pg>1){setResult(d);return;}var list=c.parseCards(c.req(cat.path))||[];list.forEach(function(x){d.push(U.card(c,x,getItem('hddj_col_v190','movie_3')));});if(!list.length)d.push(U.empty('当前分类暂无内容','可切换其它分类'));}catch(e){d.push(U.empty('片库加载失败',String(e.message||e)));}setResult(d);}
  function topics(c){var d=[],pg=MY_PAGE||1;setPageTitle('专题合集');if(pg>1){setResult(d);return;}try{var a=c.parseTopics(c.req('/topic/'))||[];d.push(U.section(c,'专题合集',a.length?a.length+' 个专题':''));a.forEach(function(x){d.push(U.topicCard(c,x));});if(!a.length)d.push(U.empty('暂无专题','没有解析到专题卡片'));}catch(e){d.push(U.empty('专题加载失败',String(e.message||e)));}setResult(d);}
  function search(c){var d=[],pg=MY_PAGE||1,kw=String(U.qp('kw',getMyVar('hddj_search_kw',''))||'').trim();if(kw)putMyVar('hddj_search_kw',kw);setPageTitle('搜索');if(pg>1){setResult(d);return;}d.push({title:'搜索短剧、剧情、关键词',col_type:'input',url:$.toString(function(){var w=String(input||'').trim();if(!w)return'toast://请输入关键词';putMyVar('hddj_search_kw',w);$.require('hddj').saveSearchHistory(w);refreshPage(false);return'hiker://empty';}),extra:{defaultValue:kw,titleVisible:true,onChange:$.toString(function(){})}});try{if(!kw){var his=c.getSearchHistory();if(his.length){d.push(U.section(c,'最近搜索','点击直接搜索'));his.forEach(function(w){d.push(U.chip(c.maskText(w),false,$('#noLoading#').lazyRule(function(x){putMyVar('hddj_search_kw',x);refreshPage(false);return'hiker://empty';},w),'flex_button'));});}else d.push(U.empty('输入关键词开始搜索'));setResult(d);return;}c.saveSearchHistory(kw);var list=c.parseCards(c.req('/search/?keyword='+encodeURIComponent(kw)))||[];d.push(U.section(c,'搜索结果',list.length+' 条'));list.forEach(function(x){d.push(U.card(c,x,'movie_3'));});if(!list.length)d.push(U.empty('暂无搜索结果','尝试更短的关键词'));}catch(e){d.push(U.empty('搜索失败',String(e.message||e)));}setResult(d);}
  function mine(c){var d=[],mode=getMyVar(MINE,'fav')||'fav';setPageTitle('我的');d.push(U.chip('收藏',mode==='fav',U.stateUrl(MINE,'fav'),'text_2'));d.push(U.chip('历史',mode==='history',U.stateUrl(MINE,'history'),'text_2'));d.push(U.line());try{var a=[];if(mode==='fav')a=c.getFavs();else{try{a=JSON.parse(getItem('hddj_history','[]')||'[]');}catch(e){a=[];}}if(!Array.isArray(a))a=[];d.push(U.section(c,mode==='fav'?'我的收藏':'观看历史',a.length+' 条'));a.forEach(function(x){d.push(U.card(c,x,'movie_3'));});if(!a.length)d.push(U.empty(mode==='fav'?'还没有收藏':'还没有观看记录'));}catch(e){d.push(U.empty('读取本地记录失败',String(e.message||e)));}setResult(d);}
  return{version:'1.9.0-test.1',home:home,library:library,topics:topics,search:search,mine:mine,libraryEntry:libraryEntry};
})();
