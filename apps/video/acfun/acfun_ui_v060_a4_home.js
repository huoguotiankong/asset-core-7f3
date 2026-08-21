/** ACFun 0.6.0-alpha4 / Build 155 - content-first home, resource hubs and universal search. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.21-v0.6.0-alpha4';
ac.runtimeMode='test-ui-v060-alpha4';

var A='#FF4D4F',M='#8A8A8A',BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';
function S(v){return String(v===undefined||v===null?'':v)}
function E(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function P(){try{return Math.max(1,Number(MY_PAGE||1)||1)}catch(e){return 1}}
function I(n){return BASE+n+'.svg'}
function rich(t,sub){return'<b>'+E(t)+'</b>'+(sub?'  <font color="'+M+'">'+E(sub)+'</font>':'')}
function sel(t,on){return on?'““””<b><font color="'+A+'">✓ '+E(t)+'</font></b>':E(t)}
function mainName(s){return({featured:'精选',comic:'漫画',anime:'动漫',video:'视频',lifan:'里番',short:'短视频'})[s]||'内容'}
function mainIcon(s,on){var n=({featured:'featured',comic:'comic',anime:'anime',video:'video',lifan:'lifan',short:'short'})[s]||'featured';return I(n+(on?'':'_off'))}
function extName(v){return({community:'社区',fiction:'小说',audio:'有声'})[v]||mainName(v)}
function extIcon(v,on){var n=({community:'community',fiction:'novel',audio:'audio',short:'short'})[v]||'more';return I(n+(on?'':'_off'))}
function section(d,t,sub){d.push({title:rich(t,sub||''),col_type:'rich_text',extra:{textSize:15,lineVisible:false}})}
function state(k,def){var v=S(getMyVar(k,'')||'');if(!v)v=S(getItem('acfun_v060_state_'+k,def||'')||'');if(v)putMyVar(k,v);return v}
function routeView(v){return'hiker://page/acfun_category?rule=ACFun&simple=true&view='+encodeURIComponent(v)+'#noRecordHistory#'}
function extra(info){
    info=info||{};var kind=S(info.kind||'video'),x={content_kind:kind,content_id:info.id,pageTitle:info.title,lineVisible:false};
    if(kind==='comic'){x.comics_id=info.id;x.comics_title=info.title;x.comics_img=info.img}
    else if(kind==='fiction'){x.fiction_id=info.id;x.fiction_title=info.title;x.fiction_img=info.img}
    else if(kind==='dynamic'){x.dynamic_id=info.id;x.dynamic_title=info.title}
    else{x.video_id=info.id;x.video_title=info.title;x.video_img=info.img;x.video_uri=info.uri;x.video_data=JSON.stringify(info.raw||{})}
    return x;
}
function clean(rows,kind){var out=[],seen={};for(var i=0;i<(rows||[]).length;i++){var x=rows[i]||{},id=S(x.id),name=S(x.name).replace(/\s+/g,' ').trim();if(!id||!name||seen[id])continue;if(ac.__v060VisibleCategoryName&&!ac.__v060VisibleCategoryName(name,kind||''))continue;seen[id]=1;out.push(x)}return out}
function age(ts){var d=Math.max(0,Date.now()-Number(ts||0));if(d<60000)return'刚刚';if(d<3600000)return Math.floor(d/60000)+'分钟前';if(d<86400000)return Math.floor(d/3600000)+'小时前';return Math.floor(d/86400000)+'天前'}

function setMain(k){return $('hiker://empty#noLoading#').lazyRule(function(v){putMyVar('acfun_v050_section',v);setItem('acfun_v060_section',v);refreshPage(false);return'hiker://empty'},k)}
function top(d){
    d.push({title:'搜索视频、漫画、小说与社区',pic_url:I('search'),img:I('search'),col_type:'text_icon',url:'hiker://page/acfun_search_center?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:'ACFun 全站搜索',lineVisible:false}});
    var cur=ac.__v050Section();
    ac.__v060Sections.forEach(function(x){d.push({title:x.name,pic_url:mainIcon(x.key,cur===x.key),img:mainIcon(x.key,cur===x.key),col_type:'icon_5',url:setMain(x.key),extra:{lineVisible:false}})});
    if(getItem('acfun_v060_show_extensions','1')==='1'){
        [{key:'short',name:'短视频'},{key:'community',name:'社区'},{key:'fiction',name:'小说'},{key:'audio',name:'有声'}].forEach(function(x){var u=x.key==='short'?setMain('short'):routeView(x.key);d.push({title:x.name,pic_url:extIcon(x.key,cur===x.key),img:extIcon(x.key,cur===x.key),col_type:'icon_small_4',url:u,extra:{inheritTitle:false,pageTitle:x.name,lineVisible:false}})})
    }
    if(getItem('acfun_v060_show_personal','1')==='1'){
        [{name:'分类',page:'acfun_category'},{name:'收藏',page:'acfun_favorites'},{name:'历史',page:'acfun_history'},{name:'设置',page:'acfun_settings'}].forEach(function(x){d.push({title:x.name,col_type:'text_4',url:'hiker://page/'+x.page+'?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:x.name,lineVisible:false}})})
    }
}
function continueWatching(d){if(getItem('acfun_v060_continue','1')!=='1')return;var h=ac.historyList();if(!h.length)return;var it=h[0],raw=ac.safeJson(it.data)||{},info=ac.itemInfo({videoId:it.id,title:it.title,cover:it.img,videoUri:it.uri,video:raw});if(!info.id)return;info.kind='video';section(d,'继续观看',age(it.time));d.push({title:info.title,desc:(info.author?info.author+' · ':'')+'继续上次播放',pic_url:ac.image(info.img),img:ac.image(info.img),url:ac.__v060a4Route(info),col_type:'movie_1_left_pic',extra:extra(info)});d.push({col_type:'line'})}
function videoCard(d,x,col){var info=ac.itemInfo(x),m=[];if(!info.id)return;info.kind='video';if(info.watch)m.push('▶ '+ac.fmtNum(info.watch));if(info.like)m.push('♥ '+ac.fmtNum(info.like));if(info.duration)m.push(info.duration);if(!m.length&&info.author)m.push(info.author);d.push({title:info.title||('视频 '+info.id),desc:m.join('  '),pic_url:ac.image(info.img),img:ac.image(info.img),url:ac.__v060a4Route(info),col_type:col||getItem('acfun_v060_video_layout','movie_2'),extra:extra(info)})}
function comicCard(d,x,col){var info=ac.__v060a4ComicInfo(x);if(!info.id)return;d.push({title:info.title,desc:[info.author,info.desc].filter(function(v){return!!v}).join(' · '),pic_url:ac.image(info.img),img:ac.image(info.img),url:ac.__v060a4Route(info),col_type:col||'movie_3',extra:extra(info)})}
function fictionCard(d,x,col){var info=ac.__v060a4FictionInfo(x);if(!info.id)return;d.push({title:info.title,desc:[info.author,info.status].filter(function(v){return!!v}).join(' · '),pic_url:ac.image(info.img),img:ac.image(info.img),url:ac.__v060a4Route(info),col_type:col||'movie_3',extra:extra(info)})}
function dynamicCard(d,x){var info=ac.__v060a4DynamicInfo(x);if(!info.id)return;var title=info.content||info.title||'社区动态';if(title.length>48)title=title.slice(0,48)+'…';d.push({title:title,desc:info.author||'ACFun 社区',pic_url:ac.image(info.img),img:ac.image(info.img),url:ac.__v060a4Route(info),col_type:info.img?'movie_1_left_pic':'text_1',extra:extra(info)})}

ac.home=function(){
    var d=[],p=P(),s=ac.__v050Section();ac.__v060Hydrate(s);
    if(p===1){top(d);continueWatching(d);d.push({title:'筛选：'+ac.__v060Summary(s)+(s==='short'?'':' · '+ac.__v060SortName(s)),pic_url:I('filter'),img:I('filter'),col_type:'text_icon',url:'hiker://page/acfun_category?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:'分类与筛选',lineVisible:false}});d.push({col_type:'line'});section(d,mainName(s),ac.__v060Summary(s)+(s==='short'?'':' · '+ac.__v060SortName(s)))}
    var list=[];try{if(s==='featured')list=ac.__v050StationList(p,0);else if(s==='lifan')list=ac.__v050StationList(p,1);else if(s==='comic')list=ac.__v050ComicList(p);else if(s==='short')list=ac.__v050ShortList(p);else list=ac.__v050CatalogList(p,s)}catch(e){try{setItem('acfun_v060_a4_home_error',S(e.message||e))}catch(e0){}}
    if(s==='comic')for(var i=0;i<list.length;i++)comicCard(d,list[i]);
    else if(s==='short')for(var j=0;j<list.length;j++)videoCard(d,list[j],'movie_3');
    else{var start=0;if(p===1&&getItem('acfun_v060_hero','1')==='1'&&list.length){var hi=ac.itemInfo(list[0]);if(hi.id){hi.kind='video';d.push({title:hi.title,desc:[hi.author,hi.watch?('▶ '+ac.fmtNum(hi.watch)):''].filter(function(v){return!!v}).join(' · '),pic_url:ac.image(hi.img),img:ac.image(hi.img),url:ac.__v060a4Route(hi),col_type:'card_pic_1',extra:extra(hi)});start=1}}for(var q=start;q<list.length;q++)videoCard(d,list[q])}
    if(!list.length&&p===1){d.push({title:s==='short'?'短视频接口暂未返回内容':'当前条件暂时没有内容',desc:s==='short'?'Alpha4 已按 APK 的 video/list + loadType 做有限回退，空结果不会写入成功缓存。可刷新或查看诊断。':'进入分类中心切换频道；当前有效缓存不会被空响应覆盖。',col_type:'long_text',url:'hiker://empty'});d.push({title:'重新加载',pic_url:I('history'),img:I('history'),col_type:'text_icon',url:$('hiker://empty#noLoading#').lazyRule(function(){refreshPage(false);return'hiker://empty'}),extra:{lineVisible:false}})}
    setResult(d);
};

function stateButton(d,x,current,key,clearKey){d.push({title:sel(x.name,S(current)===S(x.id)),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(v,k,ck){if(v)putMyVar(k,String(v));else clearMyVar(k);setItem('acfun_v060_state_'+k,String(v||''));if(ck){clearMyVar(ck);setItem('acfun_v060_state_'+ck,'')}refreshPage(false);return'hiker://empty'},x.id,key,clearKey||''),extra:{lineVisible:false}})}
function strip(d,rows,current,key,clearKey,kind){rows=clean(rows,kind);for(var i=0;i<rows.length;i++)stateButton(d,rows[i],current,key,clearKey);return rows}
function sortStrip(d,rows,current,key){for(var i=0;i<rows.length;i++)(function(x){d.push({title:sel(x.name,S(current)===S(x.value)),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(v,k){putMyVar(k,String(v));setItem('acfun_v060_state_'+k,String(v));refreshPage(false);return'hiker://empty'},x.value,key),extra:{lineVisible:false}})})(rows[i])}
function extensionNav(d,active){section(d,'内容扩展','短视频 · 社区 · 小说 · 有声');[{key:'short',name:'短视频'},{key:'community',name:'社区'},{key:'fiction',name:'小说'},{key:'audio',name:'有声'}].forEach(function(x){var u=x.key==='short'?$('hiker://empty#noLoading#').lazyRule(function(){putMyVar('acfun_v050_section','short');setItem('acfun_v060_section','short');return'hiker://home@ACFun'}):routeView(x.key);d.push({title:x.name,pic_url:extIcon(x.key,active===x.key),img:extIcon(x.key,active===x.key),col_type:'icon_small_4',url:u,extra:{lineVisible:false}})});d.push({col_type:'line'})}

ac.__v060a4MainCategory=function(){
    var d=[],s=ac.__v050Section();setPageTitle('分类与筛选');
    d.push({title:rich('当前条件',mainName(s)+' · '+ac.__v060Summary(s)+(s==='short'?'':' · '+ac.__v060SortName(s))),col_type:'rich_text',extra:{textSize:16,lineVisible:false}});
    section(d,'内容频道','五大主栏目');ac.__v060Sections.forEach(function(x){d.push({title:x.name,pic_url:mainIcon(x.key,s===x.key),img:mainIcon(x.key,s===x.key),col_type:'icon_5',url:$('hiker://empty#noLoading#').lazyRule(function(k){putMyVar('acfun_v050_section',k);setItem('acfun_v060_section',k);refreshPage(false);return'hiker://empty'},x.key),extra:{lineVisible:false}})});
    s=ac.__v050Section();ac.__v060Hydrate(s);
    if(s==='short'){section(d,'短视频模式','APK video/list');strip(d,ac.__v050ShortTabs,state('acfun_v050_short_load_type','3'),'acfun_v050_short_load_type','','short')}
    else if(s==='featured'||s==='lifan'){var r=s==='lifan'?1:0,key=r?'acfun_v050_station_lifan':'acfun_v050_station_featured',rows=clean(ac.__v050Stations(r),'station'),cur=state(key,'');if(!cur&&rows.length)cur=S(rows[0].id);section(d,s==='lifan'?'里番频道':'精选频道',rows.length+' 个 · 横向滑动');strip(d,rows,cur,key,'','station')}
    else if(s==='comic'){var comics=clean(ac.__v050ComicStations(),'comic'),cc=state('acfun_v050_comic_station','');if(!cc&&comics.length)cc=S(comics[0].id);section(d,'漫画频道',comics.length+' 个有效分类 · 已移除布局/测试项');strip(d,comics,cc,'acfun_v050_comic_station','','comic')}
    else if(s==='anime'||s==='video'){
        var ck=s==='video'?'acfun_v050_class_video':'acfun_v050_class_anime',tk=s==='video'?'acfun_v050_tag_video':'acfun_v050_tag_anime',classes=clean(ac.__v050Catalog(s),'catalog'),cv=state(ck,'');if(!cv&&classes.length)cv=S(classes[0].id);section(d,'内容分类',classes.length+' 个');strip(d,classes,cv,ck,tk,'catalog');
        var cls=ac.__v050Class(s),tags=clean(ac.__v050Tags(s,cls),'tag'),tv=state(tk,'');if(tags.length){section(d,'标签',tags.length+' 个 · 横向滑动');d.push({title:sel('全部',!tv),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(k){clearMyVar(k);setItem('acfun_v060_state_'+k,'');refreshPage(false);return'hiker://empty'},tk),extra:{lineVisible:false}});strip(d,tags,tv,tk,'','tag')}
    }
    if(s!=='short'){section(d,'排序');sortStrip(d,ac.__v050Sorts,ac.__v050Sort(s),'acfun_v050_sort_'+s)}
    d.push({col_type:'line'});d.push({title:'完成并返回首页',pic_url:I('featured'),img:I('featured'),col_type:'text_icon',url:'hiker://home@ACFun',extra:{lineVisible:false}});
    d.push({title:'重置当前栏目',pic_url:I('filter'),img:I('filter'),col_type:'text_icon',url:$('hiker://empty#noLoading#').lazyRule(function(sec){function r(k){clearMyVar(k);setItem('acfun_v060_state_'+k,'')}if(sec==='featured')r('acfun_v050_station_featured');else if(sec==='lifan')r('acfun_v050_station_lifan');else if(sec==='comic')r('acfun_v050_comic_station');else if(sec==='anime'){r('acfun_v050_class_anime');r('acfun_v050_tag_anime')}else if(sec==='video'){r('acfun_v050_class_video');r('acfun_v050_tag_video')}else r('acfun_v050_short_load_type');r('acfun_v050_sort_'+sec);refreshPage(false);return'toast://已重置当前栏目'},s),extra:{lineVisible:false}});
    setResult(d);
};

ac.__v060a4CommunityPage=function(){
    var d=[],p=P();setPageTitle('ACFun 社区');if(p===1){extensionNav(d,'community');section(d,'热门 UP 主','来自 blogger/hotUpBloggers');var ups=ac.__v060a4HotBloggers();for(var i=0;i<Math.min(ups.length,8);i++){var u=ac.__v060a4BloggerInfo(ups[i]);d.push({title:u.name,desc:u.desc||('ID · '+u.id),pic_url:ac.image(u.img),img:ac.image(u.img),col_type:'avatar',url:'hiker://search?s='+encodeURIComponent(u.name)+'&rule=ACFun&scope=dynamic',extra:{lineVisible:false}})}if(!ups.length)d.push({title:'热门 UP 主暂未返回',col_type:'text_center_1',url:'hiker://empty'});var circles=ac.__v060a4Coteries();if(circles.length){section(d,'圈子',circles.length+' 个');for(var c=0;c<circles.length;c++){var cx=circles[c],cn=S(ac.pick(cx,['coterieName','name','title'],'圈子'));d.push({title:cn,col_type:'scroll_button',url:'hiker://search?s='+encodeURIComponent(cn)+'&rule=ACFun&scope=dynamic',extra:{lineVisible:false}})}}var cats=clean(ac.__v060a4CommunityCategories(),'category'),cur=state('acfun_v060_dynamic_category','');section(d,'社区动态',cats.length?(cats.length+' 个分类'):'全站');d.push({title:sel('全部',!cur),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(){clearMyVar('acfun_v060_dynamic_category');refreshPage(false);return'hiker://empty'}),extra:{lineVisible:false}});strip(d,cats,cur,'acfun_v060_dynamic_category','','category');sortStrip(d,[{name:'热门',value:'hot'},{name:'最新',value:'new'}],state('acfun_v060_dynamic_sort','hot'),'acfun_v060_dynamic_sort');d.push({col_type:'line'})}
    var list=ac.__v060a4DynamicList(p);for(var j=0;j<list.length;j++)dynamicCard(d,list[j]);if(!list.length&&p===1)d.push({title:'社区暂未加载到动态',desc:'已接入 dynamic/category/tree、community/dynamic/list、热门 UP 主与圈子资源；空响应不会覆盖有效缓存。',col_type:'long_text',url:'hiker://empty'});setResult(d);
};
ac.__v060a4FictionPage=function(mode){
    mode=mode==='audio'?'audio':'fiction';var d=[],p=P();setPageTitle(mode==='audio'?'ACFun 有声':'ACFun 小说');if(p===1){extensionNav(d,mode);section(d,'阅读方式','普通小说与有声内容');[{key:'fiction',name:'普通'},{key:'audio',name:'有声'}].forEach(function(x){d.push({title:sel(x.name,mode===x.key),col_type:'scroll_button',url:routeView(x.key),extra:{lineVisible:false}})});var tags=clean(ac.__v060a4FictionTags(),'category'),tk='acfun_v060_fiction_tag_'+mode,cur=state(tk,'');section(d,'内容分类',tags.length+' 个 · 横向滑动');d.push({title:sel('全部',!cur),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(k){clearMyVar(k);refreshPage(false);return'hiker://empty'},tk),extra:{lineVisible:false}});strip(d,tags,cur,tk,'','category');sortStrip(d,[{name:'最新',value:'1'},{name:'热门',value:'2'},{name:'完结',value:'3'}],state('acfun_v060_fiction_sort_'+mode,'1'),'acfun_v060_fiction_sort_'+mode);d.push({col_type:'line'});section(d,mode==='audio'?'有声书库':'小说书库',mode==='audio'?'章节存在音频时可直接播放':'章节阅读与本地进度')}
    var list=ac.__v060a4FictionList(p,mode);for(var i=0;i<list.length;i++)fictionCard(d,list[i]);if(!list.length&&p===1)d.push({title:mode==='audio'?'有声接口暂未返回内容':'小说接口暂未返回内容',desc:'已接入 fiction/other/tagList、fiction/base/findList、info 与 chapterInfo；有声会尝试 APK 字段 fictionType / longFormAudio。',col_type:'long_text',url:'hiker://empty'});setResult(d);
};
ac.categoryCenter=function(){var view=S(getParam('view','')||(typeof MY_PARAMS==='object'&&MY_PARAMS.view)||'');if(view==='community')return ac.__v060a4CommunityPage();if(view==='fiction'||view==='audio')return ac.__v060a4FictionPage(view);return ac.__v060a4MainCategory()};

function histories(){try{var a=JSON.parse(getItem('acfun_v060_search_history','[]'))||[];if(!Array.isArray(a))return[];return a.map(function(x){return typeof x==='string'?{q:x,scope:'video'}:x}).filter(function(x){return x&&x.q})}catch(e){return[]}}
var scopes=[{key:'video',name:'视频'},{key:'comic',name:'漫画'},{key:'fiction',name:'小说'},{key:'audio',name:'有声'},{key:'dynamic',name:'社区'}];
ac.searchCenter=function(){
    var d=[],scope=state('acfun_v060_search_scope','video');setPageTitle('ACFun 全站搜索');section(d,'搜索范围','选择后输入关键词');for(var i=0;i<scopes.length;i++)(function(x){d.push({title:sel(x.name,scope===x.key),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(k){putMyVar('acfun_v060_search_scope',k);setItem('acfun_v060_state_acfun_v060_search_scope',k);refreshPage(false);return'hiker://empty'},x.key),extra:{lineVisible:false}})})(scopes[i]);
    d.push({title:'搜索'+extName(scope),desc:'标题、关键词或标签',col_type:'input',url:$.toString(function(sc){var q=String(input||'').trim();if(!q)return'toast://请输入搜索关键词';var a=[];try{a=JSON.parse(getItem('acfun_v060_search_history','[]'))||[]}catch(e){}a=(Array.isArray(a)?a:[]).map(function(x){return typeof x==='string'?{q:x,scope:'video'}:x}).filter(function(x){return x&&!(String(x.q||'')===q&&String(x.scope||'')===sc)});a.unshift({q:q,scope:sc});setItem('acfun_v060_search_history',JSON.stringify(a.slice(0,24)));return'hiker://search?s='+encodeURIComponent(q)+'&rule=ACFun&scope='+encodeURIComponent(sc)},scope),extra:{titleVisible:false,defaultValue:'',lineVisible:false}});
    var h=histories();if(h.length){section(d,'最近搜索',h.length+' 条');for(var j=0;j<h.length;j++){var z=h[j];d.push({title:z.q+' · '+extName(z.scope),col_type:'flex_button',url:'hiker://search?s='+encodeURIComponent(z.q)+'&rule=ACFun&scope='+encodeURIComponent(z.scope||'video'),extra:{lineVisible:false}})}d.push({title:'清空搜索记录',pic_url:I('history_off'),img:I('history_off'),col_type:'text_icon',url:$('hiker://empty#noLoading#').lazyRule(function(){setItem('acfun_v060_search_history','[]');refreshPage(false);return'toast://已清空'}),extra:{lineVisible:false}})}else d.push({title:'还没有搜索记录',desc:'视频、漫画、小说、有声和社区关键词会统一保存在本机。',col_type:'long_text',url:'hiker://empty'});setResult(d);
};
ac.search=function(){
    var d=[],kw=S(getParam('s','')||getParam('kw','')||getMyVar('acfun_search_kw','')),scope=S(getParam('scope','')||getMyVar('acfun_v060_search_scope','video')||'video');if(!kw)try{kw=decodeURIComponent(getParam('q',''))}catch(e){}putMyVar('acfun_search_kw',kw);if(P()===1)section(d,'搜索结果',kw+' · '+extName(scope));var list=ac.__v060a4Search(scope,kw,P(),Number(getItem('acfun_page_size','12'))||12);if(scope==='comic')for(var i=0;i<list.length;i++)comicCard(d,list[i]);else if(scope==='fiction'||scope==='audio')for(var j=0;j<list.length;j++)fictionCard(d,list[j]);else if(scope==='dynamic')for(var q=0;q<list.length;q++)dynamicCard(d,list[q]);else for(var k=0;k<list.length;k++)videoCard(d,list[k]);if(!list.length&&P()===1)d.push({title:'没有找到匹配内容',desc:'范围：'+extName(scope)+'\n关键词：'+kw+'\n可返回全站搜索切换资源类型，或缩短关键词。',col_type:'long_text',url:'hiker://empty'});setResult(d)
};

try{setItem('acfun_test_runtime','0.6.0-alpha4 home/resources/search')}catch(e){}
})();
