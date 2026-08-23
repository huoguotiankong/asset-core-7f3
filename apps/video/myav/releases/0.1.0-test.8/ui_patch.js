/* MyAv 0.1.0-test.8 - actress entry fallback + ranking layout */
(function(R,C){
if(!R||!C)throw new Error('MyAv runtime/core missing for Test8');
R.version='0.1.0-test.8';R.build=10108;R.bootstrapUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/myav/bootstrap_test_v8_b10108.js';
var A='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/myav/assets/';
var NORMAL_ACTRESS_FALLBACK='https://javlist.me/cat.py?type=0TActtgu02YfLieZ7SleLw==';
function S(v){return v===undefined||v===null?'':String(v);}function pg(){try{return parseInt(MY_PAGE,10)||1;}catch(e){return 1;}}
function sec(t,d){return{title:'▌ '+t,desc:d||'',url:'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
function emp(t,d){return{title:t,desc:d||'',url:'hiker://empty',col_type:'text_center_1',extra:{lineVisible:false}};}
function chip(t,u){return{title:t,url:u,col_type:'scroll_button',extra:{lineVisible:false}};}
function state(t,id,cur,k){return chip((id===cur?'● ':'')+t,$('#noLoading#').lazyRule(function(a,b){putMyVar(a,b);refreshPage(false);return'hiker://empty';},k,id));}
function col(k){return C.layoutGet(k,'2')==='3'?'movie_3':'movie_2';}
function card(m,s,k){var a=[];if(m.code)a.push(S(m.code).toUpperCase());if(m.date)a.push(m.date);if(m.flags&&m.flags.length)a.push(m.flags.join(' · '));return{title:m.title||m.code||'影片',desc:a.join(' · '),img:m.img||'',pic_url:m.img||'',url:C.page('myavDetail',{u:m.href,code:m.code||'',sec:s||m.section||'normal'}),col_type:col(k),extra:{lineVisible:false,pageTitle:m.code||m.title||'影片'}};}
function eroute(x,s,e){var p={u:x.href||x.key,name:x.name||x.text||'资料',sec:s||x.sec||x.section||'normal',etype:e||x.etype||'entity'};if(x.rawImg)p.img=x.rawImg;else if(x.img)p.img=x.img;return C.page('myavList',p);}
function actressUrl(def){var u='';try{u=C.indexUrlExact(def.label)||'';}catch(e){}if(!u&&def.id==='normalActress')u=NORMAL_ACTRESS_FALLBACK;return u;}

R.actresses=function(){
 var d=[],p=pg(),ds=C.actorIndexDefs(),kid=getMyVar('myav_actor_index','normalActress'),q=getMyVar('myav_actor_filter',''),df=ds[0],i,u,f,t,h,it,x;
 for(i=0;i<ds.length;i++)if(ds[i].id===kid){df=ds[i];break;}
 u=actressUrl(df);
 if(!u){setPageTitle('女优');setResult([emp('未找到 '+df.label+' 入口','可在设置中重新发现导航；有码女优另有当前站点兜底入口')]);return;}
 f=C.fetchHtml(u);t=C.paginatedUrl(u,p,f);h=p===1?f:C.fetchHtml(t);it=C.parseIndexEntries(h,t,df.label);q=S(q).trim();
 if(q){var z=[];for(i=0;i<it.length;i++)if(S(it[i].text).toLowerCase().indexOf(q.toLowerCase())>=0)z.push(it[i]);it=z;}
 if(p===1){
   setPageTitle('女优');
   d.push({title:'女优资料库',desc:'有码 / 欧美 / 国产女优与男优 · 原站真实分页',img:A+'actress.svg',pic_url:A+'actress.svg',url:'hiker://empty',col_type:'icon_1_left_pic',extra:{lineVisible:false}});
   for(i=0;i<ds.length;i++)d.push(state(ds[i].label,ds[i].id,kid,'myav_actor_index'));
   d.push({title:q||'',desc:'',url:"(function(){var q=String(input||'').trim();putMyVar('myav_actor_filter',q);refreshPage(false);return 'hiker://empty';})()",col_type:'input',extra:{defaultValue:q,hint:'筛选当前页姓名',lineVisible:false}});
   d.push(chip('演员收藏',$('#noLoading#').lazyRule(function(v){putMyVar('myav_fav_tab','actors');return v;},C.page('myavFavorites',{}))));
   d.push(sec(df.label,(df.id==='normalActress'&&u===NORMAL_ACTRESS_FALLBACK?'当前站点兜底入口 · ':'')+(q?'本页筛选：'+q+' · ':'')+C.layoutGet('actresses','2')+' 列'));
 }
 if(!it.length)d.push(emp(q?'当前页没有匹配姓名':'当前页未识别到演员','当前地址：'+t));
 for(i=0;i<it.length;i++){x=it[i];d.push({title:x.text,desc:df.etype==='actor'?'男优资料':'女优资料',img:x.img||A+'actress.svg',pic_url:x.img||A+'actress.svg',url:eroute({href:x.href,text:x.text,rawImg:x.rawImg},df.sec,df.etype),col_type:col('actresses'),extra:{lineVisible:false,pageTitle:x.text}});}
 setResult(d);
};

R.rankings=function(){
 var d=[],p=pg(),root=C.rankRoot(),rootHtml=C.fetchHtml(root),modes=C.rankModes(rootHtml),current=getMyVar('myav_rank_url',modes.length?modes[0].href:root),i,target,html,items,first,m;
 if(p===1){setPageTitle('排行榜');d.push(sec('热门排名','TOP20 / 周榜 / 月榜 · '+C.layoutGet('rankings','2')+' 列'));for(i=0;i<modes.length;i++)d.push({title:(current===modes[i].href?'● ':'')+modes[i].text,url:$('#noLoading#').lazyRule(function(v){putMyVar('myav_rank_url',v);refreshPage(false);return'hiker://empty';},modes[i].href),col_type:'scroll_button',extra:{lineVisible:false}});}
 first=current===root?rootHtml:C.fetchHtml(current);target=C.paginatedUrl(current,p,first);html=p===1?first:C.fetchHtml(target);items=C.parseMovies(html,'normal');
 if(!items.length){d.push(emp('当前榜单暂无内容',target));setResult(d);return;}
 for(i=0;i<items.length;i++){m=items[i];m.title='#'+(((p-1)*20)+i+1)+'  '+(m.title||m.code||'影片');d.push(card(m,'normal','rankings'));}
 setResult(d);
};

function line(t,d,u){return{title:t,desc:d||'',url:u||'hiker://empty',col_type:'text_1',extra:{lineVisible:false}};}
function choice(d,l,k){var c=C.layoutGet(k,'2');d.push(line(l,'当前 '+c+' 列'));d.push(chip((c==='2'?'● ':'')+'2列',$('#noLoading#').lazyRule(function(x){setItem('myav_layout_'+x,'2');refreshPage(false);return'hiker://empty';},k)));d.push(chip((c==='3'?'● ':'')+'3列',$('#noLoading#').lazyRule(function(x){setItem('myav_layout_'+x,'3');refreshPage(false);return'hiker://empty';},k)));}
R.settings=function(){
 var d=[],b=R.bootstrapUrl;setPageTitle('MyAv 设置');
 d.push(sec('页面排版','各页面独立设置海报密度'));
 choice(d,'首页影片','home');choice(d,'搜索结果','search');choice(d,'女优索引','actresses');choice(d,'排行榜','rankings');choice(d,'演员 / 片商 / TAG作品','entity');choice(d,'本地收藏','favorites');
 d.push(line('恢复默认排版','全部恢复双列',$('#noLoading#').lazyRule(function(){try{$.require('myav').core().layoutReset();deleteItem('myav_layout_rankings');}catch(e){}refreshPage(false);return'toast://已恢复默认排版';})));
 d.push(sec('本地数据','影片收藏与演员收藏独立保存'));
 d.push(line('影片收藏',C.favoriteList().length+' 部',C.page('myavFavorites',{})));
 d.push(line('演员收藏',C.actorFavoriteList().length+' 位',$('#noLoading#').lazyRule(function(u){putMyVar('myav_fav_tab','actors');return u;},C.page('myavFavorites',{}))));
 d.push(line('清除搜索记录',C.searchHistory().length+' 条',$('#noLoading#').lazyRule(function(){try{$.require('myav').core().clearSearchHistory();}catch(e){}return'toast://搜索记录已清除';})));
 d.push(sec('运行状态','Test 通道 · 自用远程版'));
 d.push(line('版本',R.version+' · Build '+R.build));
 d.push(line('女优入口','动态发现优先；有码入口失败时使用当前站点兜底',C.page('myavActresses',{})));
 d.push(line('更多站点','FC2 / 漫画 / 小说等',C.page('myavMore',{})));
 d.push(line('重新发现站点导航','清除导航缓存并重新读取原站菜单',$('#noLoading#').lazyRule(function(k1,k2){clearItem(k1);clearItem(k2);return'toast://导航缓存已清除';},C.homeCacheKey,C.homeCacheTsKey)));
 d.push(line('检查 Test 更新','',$('#noLoading#').lazyRule(function(u){try{require(u+'?v=10108',{headers:{'Cache-Control':'no-cache'}},10108);return MyAvBoot.check();}catch(e){return'toast://检查失败：'+String(e.message||e);}},b)));
 d.push(line('回退上一 Test','',$('#noLoading#').lazyRule(function(u){try{require(u+'?v=10108',{headers:{'Cache-Control':'no-cache'}},10108);return MyAvBoot.rollback();}catch(e){return'toast://回退失败：'+String(e.message||e);}},b)));
 setResult(d);
};
})(MyAvRemoteRuntime,MyAvCore);
