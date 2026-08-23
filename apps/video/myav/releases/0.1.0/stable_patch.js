/* MyAv 0.1.0 Stable - promoted from Test11 */
(function(C,R){
if(!C||!R)throw new Error('MyAv stable base runtime missing');
C.version='0.1.0';C.build=10112;R.version='0.1.0';R.build=10112;
R.bootstrapUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/myav/bootstrap_stable_v1_b10112.js';
function sec(t,d){return{title:'▌ '+t,desc:d||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
function line(t,d,u){return{title:t,desc:d||'',url:u||'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
function chip(t,u){return{title:t,url:u,col_type:'scroll_button',extra:{lineVisible:false}};}
function choice(d,label,key){var c=C.layoutGet(key,'2');d.push(line(label,'当前 '+c+' 列'));d.push(chip((c==='2'?'● ':'')+'2列',$('#noLoading#').lazyRule(function(k){setItem('myav_layout_'+k,'2');refreshPage(false);return'hiker://empty';},key)));d.push(chip((c==='3'?'● ':'')+'3列',$('#noLoading#').lazyRule(function(k){setItem('myav_layout_'+k,'3');refreshPage(false);return'hiker://empty';},key)));}
function stableAction(action){return $('#noLoading#').lazyRule(function(action,b){try{require(b+'?v=10112',{headers:{'Cache-Control':'no-cache'}},10112);var r=MyAvBoot[action]();if(action==='check')return'toast://'+(r&&r.hasUpdate?('发现新版本 '+r.latest.version):('当前已是最新 '+(r&&r.current?r.current.version:'0.1.0')));if(r&&r.ok){refreshPage(false);return'toast://操作完成';}return'toast://'+String(r&&r.error||'操作失败');}catch(e){return'toast://'+String(e.message||e);}},action,R.bootstrapUrl);}
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
 d.push(sec('正式版维护','Stable 0.1.0 · Build 10112'));
 d.push(line('数据源',C.base,'web://'+C.base+'/'));
 d.push(line('重新发现站点导航','清除导航缓存，下次请求重新读取原站菜单',$('#noLoading#').lazyRule(function(k1,k2){clearItem(k1);clearItem(k2);return'toast://导航缓存已清除';},C.homeCacheKey,C.homeCacheTsKey)));
 d.push(line('检查 Stable 更新','',stableAction('check')));d.push(line('更新到最新 Stable','',stableAction('update')));d.push(line('回退上一 Stable','',stableAction('rollback')));d.push(line('重新加载当前 Stable','',stableAction('reinstall')));
 d.push(sec('版本说明','由 0.1.0-test.11 按用户明确要求晋级。保留完整筛选双链、九类索引、演员/影片双收藏、磁链与共享 JAV Playback。'));
 setResult(d);
};
})(MyAvCore,MyAvRemoteRuntime);
