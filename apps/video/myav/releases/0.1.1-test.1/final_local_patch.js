/* MyAv 0.1.1-test.1 Native Local-First delivery overlay */
(function(C,R){
  if(!C||!R)throw new Error('MyAv Stable runtime missing');
  if(typeof MyAvLocalPlayback!=='object'||String(MyAvLocalPlayback.version||'')!=='1.0.0-test.4')throw new Error('MyAv Local JAV Playback missing');
  var VERSION='0.1.1-test.1',BUILD=10201;
  var LOCAL_ROOT='hiker://files/rules/asset-core-local/myav-test/b10201/';
  var APP_ICON=LOCAL_ROOT+'myav_icon.svg';

  C.version=VERSION;C.build=BUILD;C.appIcon=APP_ICON;
  R.version=VERSION;R.build=BUILD;R.appIcon=APP_ICON;R.bootstrapUrl='';
  C.localFirstVersion=VERSION;C.localFirstBuild=BUILD;

  JAVPlaybackManager={
    load:function(){return MyAvLocalPlayback;}
  };

  function sec(t,d){return{title:'▌ '+t,desc:d||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function line(t,d,u){return{title:t,desc:d||'',url:u||'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
  function chip(t,u){return{title:t,url:u,col_type:'scroll_button',extra:{lineVisible:false}};}
  function choice(d,label,key){var c=C.layoutGet(key,'2');d.push(line(label,'当前 '+c+' 列'));d.push(chip((c==='2'?'● ':'')+'2列',$('#noLoading#').lazyRule(function(k){setItem('myav_layout_'+k,'2');refreshPage(false);return'hiker://empty';},key)));d.push(chip((c==='3'?'● ':'')+'3列',$('#noLoading#').lazyRule(function(k){setItem('myav_layout_'+k,'3');refreshPage(false);return'hiker://empty';},key)));}

  R.settings=function(){
    var d=[];setPageTitle('MyAv 设置');
    d.push(sec('页面排版','各页面独立设置海报密度'));
    choice(d,'首页影片','home');choice(d,'搜索结果','search');choice(d,'演员索引','actresses');choice(d,'排行榜','rankings');choice(d,'演员 / 片商 / TAG作品','entity');choice(d,'影片收藏','favorites_movies');choice(d,'演员收藏','favorites_actors');
    d.push(line('恢复默认排版','全部恢复双列',$('#noLoading#').lazyRule(function(){try{$.require('myav').core().layoutReset();}catch(e){}refreshPage(false);return'toast://已恢复默认排版';})));
    d.push(sec('本地数据','影片收藏、演员收藏与浏览历史仅保存在本机'));
    d.push(line('影片收藏',C.favoriteList().length+' 部',C.page('myavFavorites',{})));
    d.push(line('演员收藏',C.actorFavoriteList().length+' 位',$('#noLoading#').lazyRule(function(u){putMyVar('myav_fav_tab','actors');return u;},C.page('myavFavorites',{}))));
    d.push(line('浏览历史',C.historyList().length+' 条',C.page('myavHistory',{})));
    d.push(line('清除搜索记录',C.searchHistory().length+' 条',$('#noLoading#').lazyRule(function(){try{$.require('myav').core().clearSearchHistory();}catch(e){}return'toast://搜索记录已清除';})));
    d.push(sec('站点与缓存','业务网络仍访问 javlist.me；程序代码不在普通二次启动时访问 GitHub'));
    d.push(line('数据源',C.base,'web://'+C.base+'/'));
    d.push(line('重新发现站点导航','清除导航缓存，下次请求重新读取原站菜单',$('#noLoading#').lazyRule(function(k1,k2){clearItem(k1);clearItem(k2);return'toast://导航缓存已清除';},C.homeCacheKey,C.homeCacheTsKey)));
    d.push(sec('Local-First','0.1.1-test.1 · Build 10201'));
    d.push(line('本地化诊断','Runtime Bundle / Shared Playback / 本地图标',C.page('myavLocalFirst',{})));
    d.push(line('更新方式','由“我的规则仓库”覆盖测试版；本地 Runtime 不再自行加载 Remote Manager/Bootstrap。'));
    d.push(line('业务基线','Stable 0.1.0 / Build10112；本轮不主动改筛选、索引、详情、磁力、收藏或 Provider 业务逻辑。'));
    setResult(d);
  };
})(MyAvCore,MyAvRemoteRuntime);
