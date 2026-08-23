/* MyAv 0.1.0-test.9 - complete category center + version wiring */
(function(R,C){
if(!R||!C)throw new Error('MyAv runtime/core missing for Test9');
R.version='0.1.0-test.9';R.build=10109;R.bootstrapUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/myav/bootstrap_test_v9_b10109.js';
function sec(t,d){return{title:'▌ '+t,desc:d||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
function emp(t,d){return{title:t,desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
function block(t,u){return{title:t,url:u,col_type:'text_3',extra:{lineVisible:false}};}
function chip(t,u){return{title:t,url:u,col_type:'scroll_button',extra:{lineVisible:false}};}
function line(t,d,u){return{title:t,desc:d||'',url:u||'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
function routeList(label,href,s){return C.page('myavList',{u:href,name:label,sec:s||'normal'});}
function choice(d,l,k){var c=C.layoutGet(k,'2');d.push(line(l,'当前 '+c+' 列'));d.push(chip((c==='2'?'● ':'')+'2列',$('#noLoading#').lazyRule(function(x){setItem('myav_layout_'+x,'2');refreshPage(false);return'hiker://empty';},k)));d.push(chip((c==='3'?'● ':'')+'3列',$('#noLoading#').lazyRule(function(x){setItem('myav_layout_'+x,'3');refreshPage(false);return'hiker://empty';},k)));}

R.indices=function(){
 var d=[],g=C.menuGroups(),defs=C.tagIndexDefs(),i,x,u,ext=C.externalSites();setPageTitle('分类中心');
 d.push(sec('资源频道','主库与外围站点'));
 d.push(block('有码',routeList('有码',C.sectionUrl('normal'),'normal')));
 d.push(block('欧美',routeList('欧美',C.sectionUrl('western'),'western')));
 d.push(block('国产',routeList('国产',C.sectionUrl('domestic'),'domestic')));
 d.push(block('无码',routeList('无码',C.sectionUrl('uncensored'),'uncensored')));
 for(i=0;i<ext.length;i++){if(ext[i].name==='MyAv原站'||ext[i].name==='欧美独立站')continue;d.push(block(ext[i].name,'web://'+ext[i].url));}
 d.push(block('视频在线','toast://原站当前未暴露稳定直链，暂不伪造入口'));
 d.push(block('韩漫','toast://原站当前未暴露稳定直链，暂不伪造入口'));
 d.push(sec('标签分类','九类入口 · 动态导航优先，当前站点地址兜底'));
 for(i=0;i<defs.length;i++){x=defs[i];u=C.indexUrlExact(x.label);if(u)d.push(block(x.label,C.page('myavIndexList',{u:u,name:x.label,sec:x.sec,etype:x.etype})));else d.push(block(x.label,'toast://当前入口暂不可用'));}
 d.push(sec('有码热门','原站热门专题'));
 for(i=0;i<(g.hot||[]).length;i++){x=g.hot[i];d.push(block(x.text,routeList(x.text,x.href,'normal')));}
 d.push(sec('片商新番','原站当前重点片商'));
 for(i=0;i<(g.studios||[]).length;i++){x=g.studios[i];d.push(block(x.text,routeList(x.text,x.href,'normal')));}
 d.push(sec('发现工具','排行与三类搜索'));
 d.push(block('排行榜',C.page('myavRankings',{})));
 var sp=C.page('myavSearch',{});
 d.push(block('有码查询',$('#noLoading#').lazyRule(function(k,u2){putMyVar('myav_search_kind',k);return u2;},'normal',sp)));
 d.push(block('欧美查询',$('#noLoading#').lazyRule(function(k,u2){putMyVar('myav_search_kind',k);return u2;},'western',sp)));
 d.push(block('国产查询',$('#noLoading#').lazyRule(function(k,u2){putMyVar('myav_search_kind',k);return u2;},'domestic',sp)));
 setResult(d);
};

R.settings=function(){
 var d=[],b=R.bootstrapUrl;setPageTitle('MyAv 设置');
 d.push(sec('页面排版','各页面独立设置海报密度'));
 choice(d,'首页影片','home');choice(d,'搜索结果','search');choice(d,'演员索引','actresses');choice(d,'排行榜','rankings');choice(d,'演员 / 片商 / TAG作品','entity');choice(d,'本地收藏','favorites');
 d.push(line('恢复默认排版','全部恢复双列',$('#noLoading#').lazyRule(function(){try{$.require('myav').core().layoutReset();deleteItem('myav_layout_rankings');}catch(e){}refreshPage(false);return'toast://已恢复默认排版';})));
 d.push(sec('本地数据','影片收藏与演员收藏独立保存'));
 d.push(line('影片收藏',C.favoriteList().length+' 部',C.page('myavFavorites',{})));
 d.push(line('演员收藏',C.actorFavoriteList().length+' 位',$('#noLoading#').lazyRule(function(u){putMyVar('myav_fav_tab','actors');return u;},C.page('myavFavorites',{}))));
 d.push(line('清除搜索记录',C.searchHistory().length+' 条',$('#noLoading#').lazyRule(function(){try{$.require('myav').core().clearSearchHistory();}catch(e){}return'toast://搜索记录已清除';})));
 d.push(sec('运行状态','Test 通道 · 自用远程版'));
 d.push(line('版本',R.version+' · Build '+R.build));
 d.push(line('九类标签入口','动态发现优先；失败使用当前站点兜底',C.page('myavIndices',{})));
 d.push(line('演员中心','有码 / 欧美 / 国产女演员 + 男演员',C.page('myavActresses',{})));
 d.push(line('更多站点','FC2 / 漫画 / 小说等',C.page('myavMore',{})));
 d.push(line('重新发现站点导航','清除导航缓存并重新读取原站菜单',$('#noLoading#').lazyRule(function(k1,k2){clearItem(k1);clearItem(k2);return'toast://导航缓存已清除';},C.homeCacheKey,C.homeCacheTsKey)));
 d.push(line('检查 Test 更新','',$('#noLoading#').lazyRule(function(u){try{require(u+'?v=10109',{headers:{'Cache-Control':'no-cache'}},10109);return MyAvBoot.check();}catch(e){return'toast://检查失败：'+String(e.message||e);}},b)));
 d.push(line('回退上一 Test','',$('#noLoading#').lazyRule(function(u){try{require(u+'?v=10109',{headers:{'Cache-Control':'no-cache'}},10109);return MyAvBoot.rollback();}catch(e){return'toast://回退失败：'+String(e.message||e);}},b)));
 setResult(d);
};
})(MyAvRemoteRuntime,MyAvCore);
