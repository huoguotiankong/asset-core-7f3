/**
 * ACFun 0.6.0-alpha6 / Build 157
 * Product UI overlay: compact filter panel, cleaner home utilities,
 * community/fiction resource hubs and productized empty states.
 */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');

var A='#FF4D4F',M='#8A8A8A',BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';
function S(v){return String(v===undefined||v===null?'':v)}
function E(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function P(){try{return Math.max(1,Number(MY_PAGE||1)||1)}catch(e){return 1}}
function I(n){return BASE+n+'.svg'}
function nameOf(s){return({featured:'精选',comic:'漫画',anime:'动漫',video:'视频',lifan:'里番',short:'短视频',community:'社区',fiction:'小说',audio:'有声'})[s]||'内容'}
function mainIcon(s,on){var n=({featured:'featured',comic:'comic',anime:'anime',video:'video',lifan:'lifan',short:'short'})[s]||'featured';return I(n+(on?'':'_off'))}
function extIcon(s,on){var n=({community:'community',fiction:'novel',audio:'audio',short:'short'})[s]||'more';return I(n+(on?'':'_off'))}
function rich(t,sub){return'<b>'+E(t)+'</b>'+(sub?'  <font color="'+M+'">'+E(sub)+'</font>':'')}
function selected(t,on){return on?'““””<b><font color="'+A+'">✓ '+E(t)+'</font></b>':E(t)}
function section(d,t,sub){d.push({title:rich(t,sub||''),col_type:'rich_text',extra:{textSize:15,lineVisible:false}})}
function routeView(v){return'hiker://page/acfun_category?rule=ACFun&simple=true&view='+encodeURIComponent(v)+'#noRecordHistory#'}
function state(k,def){var v=S(getMyVar(k,'')||'');if(!v)v=S(getItem('acfun_v060_state_'+k,def||'')||'');if(v)putMyVar(k,v);return v}
function setStateUrl(key,val,clearKey){return $('hiker://empty#noLoading#').lazyRule(function(k,v,ck){if(v){putMyVar(k,String(v));setItem('acfun_v060_state_'+k,String(v))}else{clearMyVar(k);setItem('acfun_v060_state_'+k,'')}if(ck){clearMyVar(ck);setItem('acfun_v060_state_'+ck,'')}refreshPage(false);return'hiker://empty'},key,val,clearKey||'')}
function setSectionUrl(sec){return $('hiker://empty#noLoading#').lazyRule(function(s){putMyVar('acfun_v050_section',s);setItem('acfun_v060_section',s);refreshPage(false);return'hiker://empty'},sec)}
function setSortUrl(sec,val){return $('hiker://empty#noLoading#').lazyRule(function(s,v){putMyVar('acfun_v050_sort_'+s,String(v));setItem('acfun_v060_sort_'+s,String(v));refreshPage(false);return'hiker://empty'},sec,val)}
function extra(info){
    info=info||{};var kind=S(info.kind||'video'),x={content_kind:kind,content_id:info.id,pageTitle:info.title,lineVisible:false};
    if(kind==='comic'){x.comics_id=info.id;x.comics_title=info.title;x.comics_img=info.img}
    else if(kind==='fiction'){x.fiction_id=info.id;x.fiction_title=info.title;x.fiction_img=info.img}
    else if(kind==='dynamic'){x.dynamic_id=info.id;x.dynamic_title=info.title}
    else{x.video_id=info.id;x.video_title=info.title;x.video_img=info.img;x.video_uri=info.uri;x.video_data=JSON.stringify(info.raw||{})}
    return x;
}
function cleaned(rows,kind){try{return ac.__v060a6SanitizeRows?ac.__v060a6SanitizeRows(rows,kind):rows||[]}catch(e){return rows||[]}}
function infoLine(a){return a.filter(function(v){return!!S(v)}).join(' · ')}

function top(d){
    d.push({title:'搜索视频、漫画、小说与社区',pic_url:I('search'),img:I('search'),col_type:'text_icon',url:'hiker://page/acfun_search_center?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:'ACFun 全站搜索',lineVisible:false}});
    var cur=ac.__v050Section();
    ac.__v060Sections.forEach(function(x){d.push({title:x.name,pic_url:mainIcon(x.key,cur===x.key),img:mainIcon(x.key,cur===x.key),col_type:'icon_5',url:setSectionUrl(x.key),extra:{lineVisible:false}})});
    if(getItem('acfun_v060_show_extensions','1')==='1'){
        [{key:'short',name:'短视频'},{key:'community',name:'社区'},{key:'fiction',name:'小说'},{key:'audio',name:'有声'}].forEach(function(x){d.push({title:x.name,pic_url:extIcon(x.key,cur===x.key),img:extIcon(x.key,cur===x.key),col_type:'icon_small_4',url:x.key==='short'?setSectionUrl('short'):routeView(x.key),extra:{inheritTitle:false,pageTitle:x.name,lineVisible:false}})})
    }
    if(getItem('acfun_v060_show_personal','1')==='1'){
        [{name:'筛选',icon:'filter',page:'acfun_category'},{name:'收藏',icon:'favorite_off',page:'acfun_favorites'},{name:'历史',icon:'history_off',page:'acfun_history'},{name:'设置',icon:'settings_off',page:'acfun_settings'}].forEach(function(x){d.push({title:x.name,pic_url:I(x.icon),img:I(x.icon),col_type:'icon_small_4',url:'hiker://page/'+x.page+'?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:x.name,lineVisible:false}})})
    }
}
function videoCard(d,x,col){var info=ac.itemInfo(x),m=[];if(!info.id)return;info.kind='video';if(info.watch)m.push('▶ '+ac.fmtNum(info.watch));if(info.like)m.push('♥ '+ac.fmtNum(info.like));if(info.duration)m.push(info.duration);if(!m.length&&info.author)m.push(info.author);d.push({title:info.title||('视频 '+info.id),desc:m.join('  '),pic_url:ac.image(info.img),img:ac.image(info.img),url:ac.__v060a4Route(info),col_type:col||getItem('acfun_v060_video_layout','movie_2'),extra:extra(info)})}
function comicCard(d,x){var info=ac.__v060a4ComicInfo(x);if(!info.id)return;d.push({title:info.title,desc:infoLine([info.author,info.desc]),pic_url:ac.image(info.img),img:ac.image(info.img),url:ac.__v060a4Route(info),col_type:'movie_3',extra:extra(info)})}
function fictionCard(d,x){var info=ac.__v060a4FictionInfo(x);if(!info.id)return;d.push({title:info.title,desc:infoLine([info.author,info.status]),pic_url:ac.image(info.img),img:ac.image(info.img),url:ac.__v060a4Route(info),col_type:'movie_3',extra:extra(info)})}
function dynamicCard(d,x){
    var info=ac.__v060a4DynamicInfo(x);if(!info.id)return;var t=info.content||info.title||'社区动态';if(t.length>60)t=t.slice(0,60)+'…';var meta=[];if(info.author)meta.push(info.author);if(info.like)meta.push('♥ '+ac.fmtNum(info.like));if(info.comment)meta.push('评论 '+ac.fmtNum(info.comment));if(info.time)meta.push(S(info.time));d.push({title:t,desc:meta.join(' · '),pic_url:info.img?ac.image(info.img):'',img:info.img?ac.image(info.img):'',url:ac.__v060a4Route(info),col_type:info.img?'movie_1_left_pic':'text_1',extra:extra(info)})
}

function clearCurrentUrl(sec){return $('hiker://empty#noLoading#').lazyRule(function(s){
    function c(k){clearMyVar(k);setItem('acfun_v060_state_'+k,'')}
    if(s==='featured')c('acfun_v050_station_featured');else if(s==='lifan')c('acfun_v050_station_lifan');else if(s==='comic')c('acfun_v050_comic_station');else if(s==='anime'){c('acfun_v050_class_anime');c('acfun_v050_tag_anime')}else if(s==='video'){c('acfun_v050_class_video');c('acfun_v050_tag_video')}else if(s==='short'){putMyVar('acfun_v050_short_load_type','2');setItem('acfun_v060_state_acfun_v050_short_load_type','2')}
    clearMyVar('acfun_v050_sort_'+s);setItem('acfun_v060_sort_'+s,'1');refreshPage(false);return'toast://已恢复默认筛选'
},sec)}

ac.home=function(){
    var d=[],p=P(),s=ac.__v050Section();ac.__v060Hydrate(s);
    if(p===1){top(d);d.push({title:'筛选 · '+ac.__v060Summary(s)+(s==='short'?'':' · '+ac.__v060SortName(s)),pic_url:I('filter'),img:I('filter'),col_type:'text_icon',url:'hiker://page/acfun_category?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:'筛选',lineVisible:false}});d.push({col_type:'line'});section(d,nameOf(s),ac.__v060Summary(s)+(s==='short'?'':' · '+ac.__v060SortName(s)))}
    var list=[];try{if(s==='featured')list=ac.__v050StationList(p,0);else if(s==='lifan')list=ac.__v050StationList(p,1);else if(s==='comic')list=ac.__v050ComicList(p);else if(s==='short')list=ac.__v050ShortList(p);else list=ac.__v050CatalogList(p,s)}catch(e){try{setItem('acfun_v060_a6_home_error',S(e.message||e))}catch(e0){}}
    if(s==='comic')for(var i=0;i<list.length;i++)comicCard(d,list[i]);
    else if(s==='short')for(var j=0;j<list.length;j++)videoCard(d,list[j],'movie_3');
    else{var start=0;if(p===1&&getItem('acfun_v060_hero','1')==='1'&&list.length){var hi=ac.itemInfo(list[0]);if(hi.id){hi.kind='video';d.push({title:hi.title,desc:infoLine([hi.author,hi.watch?('▶ '+ac.fmtNum(hi.watch)):'']),pic_url:ac.image(hi.img),img:ac.image(hi.img),url:ac.__v060a4Route(hi),col_type:'card_pic_1',extra:extra(hi)});start=1}}for(var q=start;q<list.length;q++)videoCard(d,list[q])}
    if(!list.length&&p===1){
        d.push({title:s==='short'?'短视频暂时没有返回内容':'这个筛选暂时没有内容',desc:s==='short'?'Alpha6 已优先尝试 APK 1.9.7 中出现的 loadType=2，并保留 3/4 兼容链。':'可以换一个分类，或恢复本栏目默认筛选。',col_type:'long_text',url:'hiker://empty'});
        d.push({title:'换个筛选',pic_url:I('filter'),img:I('filter'),col_type:'text_icon',url:'hiker://page/acfun_category?rule=ACFun&simple=true#noRecordHistory#',extra:{lineVisible:false}});
        d.push({title:'恢复默认筛选',pic_url:I('history_off'),img:I('history_off'),col_type:'text_icon',url:clearCurrentUrl(s),extra:{lineVisible:false}})
    }
    setResult(d)
};

function group(d,t,sub){section(d,t,sub||'')}
function button(d,name,on,key,val,clearKey){d.push({title:selected(name,on),col_type:'flex_button',url:setStateUrl(key,val,clearKey||''),extra:{lineVisible:false}})}
function visibleRows(rows,current,limit){
    rows=rows||[];if(rows.length<=limit)return rows;var out=rows.slice(0,limit),found=false;for(var i=0;i<out.length;i++)if(S(out[i].id)===S(current))found=true;if(!found&&current)for(var j=limit;j<rows.length;j++)if(S(rows[j].id)===S(current)){out.push(rows[j]);break}return out;
}
function rowGroup(d,rows,current,key,clearKey,groupKey,kind,allowAll){
    rows=cleaned(rows,kind);var expanded=getMyVar('acfun_v060_a6_expand_'+groupKey,'')==='1',show=expanded?rows:visibleRows(rows,current,12);
    if(allowAll)button(d,'全部',!current,key,'',clearKey||'');
    for(var i=0;i<show.length;i++)button(d,show[i].name,S(show[i].id)===S(current),key,show[i].id,clearKey||'');
    if(rows.length>12)d.push({title:(expanded?'收起':'展开全部')+' · '+rows.length+' 个',col_type:'flex_button',url:$('hiker://empty#noLoading#').lazyRule(function(k){var v=getMyVar(k,'')==='1'?'0':'1';putMyVar(k,v);refreshPage(false);return'hiker://empty'},'acfun_v060_a6_expand_'+groupKey),extra:{lineVisible:false}});
    return rows;
}
function currentHeader(d,s){d.push({title:nameOf(s),desc:ac.__v060Summary(s)+(s==='short'?'':' · '+ac.__v060SortName(s)),col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}})}

ac.__v060a6MainCategory=function(){
    var d=[],s=ac.__v050Section();setPageTitle('筛选');ac.__v060Hydrate(s);currentHeader(d,s);
    group(d,'栏目');for(var i=0;i<ac.__v060Sections.length;i++){var x=ac.__v060Sections[i];d.push({title:selected(x.name,s===x.key),col_type:'scroll_button',url:setSectionUrl(x.key),extra:{lineVisible:false}})}
    s=ac.__v050Section();ac.__v060Hydrate(s);
    if(s==='short'){
        group(d,'短视频');var sv=state('acfun_v050_short_load_type','2');rowGroup(d,ac.__v050ShortTabs,sv,'acfun_v050_short_load_type','','short-mode','short',false)
    }else if(s==='featured'||s==='lifan'){
        var r=s==='lifan'?1:0,key=r?'acfun_v050_station_lifan':'acfun_v050_station_featured',rows=cleaned(ac.__v050Stations(r),'station'),cur=state(key,'');if(!cur&&rows.length)cur=S(rows[0].id);group(d,s==='lifan'?'里番频道':'精选频道');rowGroup(d,rows,cur,key,'',s+'-station','station',false)
    }else if(s==='comic'){
        var comics=cleaned(ac.__v050ComicStations(),'comic'),cc=state('acfun_v050_comic_station','');if(!cc&&comics.length)cc=S(comics[0].id);group(d,'漫画分类');rowGroup(d,comics,cc,'acfun_v050_comic_station','','comic-station','comic',false)
    }else if(s==='anime'||s==='video'){
        var ck=s==='video'?'acfun_v050_class_video':'acfun_v050_class_anime',tk=s==='video'?'acfun_v050_tag_video':'acfun_v050_tag_anime',classes=cleaned(ac.__v050Catalog(s),'catalog'),cv=state(ck,'');if(!cv&&classes.length)cv=S(classes[0].id);group(d,'分类');rowGroup(d,classes,cv,ck,tk,s+'-class','catalog',false);
        var cls=ac.__v050Class(s),tags=cleaned(ac.__v050Tags(s,cls),'tag'),tv=state(tk,'');if(tags.length){group(d,'标签','可选');rowGroup(d,tags,tv,tk,'',s+'-tag','tag',true)}
    }
    if(s!=='short'){
        group(d,'排序');var sort=ac.__v050Sort(s);for(var z=0;z<ac.__v050Sorts.length;z++){var so=ac.__v050Sorts[z];d.push({title:selected(so.name,S(so.value)===S(sort)),col_type:'flex_button',url:setSortUrl(s,so.value),extra:{lineVisible:false}})}
    }
    d.push({col_type:'line'});
    d.push({title:'应用筛选',col_type:'text_2',url:'hiker://home@ACFun',extra:{lineVisible:false}});
    d.push({title:'恢复默认',col_type:'text_2',url:clearCurrentUrl(s),extra:{lineVisible:false}});
    setResult(d)
};

function extensionTabs(d,active){
    var xs=[{key:'short',name:'短视频'},{key:'community',name:'社区'},{key:'fiction',name:'小说'},{key:'audio',name:'有声'}];
    for(var i=0;i<xs.length;i++){var x=xs[i],u=x.key==='short'?$('hiker://empty#noLoading#').lazyRule(function(){putMyVar('acfun_v050_section','short');setItem('acfun_v060_section','short');return'hiker://home@ACFun'}):routeView(x.key);d.push({title:selected(x.name,active===x.key),col_type:'scroll_button',url:u,extra:{lineVisible:false}})}d.push({col_type:'line'})
}

ac.__v060a6CommunityPage=function(){
    var d=[],p=P();setPageTitle('ACFun 社区');if(p===1){
        extensionTabs(d,'community');
        var ups=ac.__v060a4HotBloggers();if(ups.length){group(d,'热门 UP');for(var i=0;i<Math.min(ups.length,8);i++){var u=ac.__v060a4BloggerInfo(ups[i]),pic=u.img?ac.image(u.img):I('community_off');d.push({title:u.name,pic_url:pic,img:pic,col_type:'icon_small_4',url:'hiker://search?s='+encodeURIComponent(u.name)+'&rule=ACFun&scope=dynamic',extra:{lineVisible:false}})}}
        var cats=cleaned(ac.__v060a4CommunityCategories(),'community'),cur=state('acfun_v060_dynamic_category','');var valid=false;for(var c=0;c<cats.length;c++)if(S(cats[c].id)===cur)valid=true;if(cur&&!valid){clearMyVar('acfun_v060_dynamic_category');setItem('acfun_v060_state_acfun_v060_dynamic_category','');cur=''}
        if(cats.length){group(d,'动态分类');rowGroup(d,cats,cur,'acfun_v060_dynamic_category','','community-cat','community',true)}
        group(d,'排序');var ds=state('acfun_v060_dynamic_sort','hot');[['热门','hot'],['最新','new']].forEach(function(x){button(d,x[0],ds===x[1],'acfun_v060_dynamic_sort',x[1],'')});d.push({col_type:'line'});section(d,'社区动态',cur?'已按分类筛选':'全部动态')
    }
    var list=ac.__v060a4DynamicList(p);for(var j=0;j<list.length;j++)dynamicCard(d,list[j]);if(!list.length&&p===1){d.push({title:'暂时没有动态',desc:'已自动忽略服务端机器分类名，并尝试分类/排序兼容参数。',col_type:'long_text',url:'hiker://empty'});d.push({title:'查看全部动态',col_type:'text_1',url:setStateUrl('acfun_v060_dynamic_category','',''),extra:{lineVisible:false}})}setResult(d)
};

ac.__v060a6FictionPage=function(mode){
    mode=mode==='audio'?'audio':'fiction';var d=[],p=P();setPageTitle(mode==='audio'?'ACFun 有声':'ACFun 小说');if(p===1){
        extensionTabs(d,mode);group(d,'阅读方式');d.push({title:selected('小说',mode==='fiction'),col_type:'scroll_button',url:routeView('fiction'),extra:{lineVisible:false}});d.push({title:selected('有声',mode==='audio'),col_type:'scroll_button',url:routeView('audio'),extra:{lineVisible:false}});
        var tags=cleaned(ac.__v060a4FictionTags(),'fiction'),tk='acfun_v060_fiction_tag_'+mode,cur=state(tk,'');var valid=false;for(var t=0;t<tags.length;t++)if(S(tags[t].id)===cur)valid=true;if(cur&&!valid){clearMyVar(tk);setItem('acfun_v060_state_'+tk,'');cur=''}
        if(tags.length){group(d,'分类');rowGroup(d,tags,cur,tk,'','fiction-'+mode,'fiction',true)}
        group(d,'排序');var sk='acfun_v060_fiction_sort_'+mode,sv=state(sk,'1');[['最新','1'],['热门','2'],['完结','3']].forEach(function(x){button(d,x[0],sv===x[1],sk,x[1],'')});d.push({col_type:'line'});section(d,mode==='audio'?'有声书库':'小说书库',cur?'已按分类筛选':'全部内容')
    }
    var list=ac.__v060a4FictionList(p,mode);for(var i=0;i<list.length;i++)fictionCard(d,list[i]);if(!list.length&&p===1){d.push({title:mode==='audio'?'暂时没有匹配的有声内容':'暂时没有匹配的小说',desc:'已尝试当前 APP 的 fiction/base/findList 参数组合；可以先查看全部分类。',col_type:'long_text',url:'hiker://empty'});d.push({title:'查看全部',col_type:'text_1',url:setStateUrl('acfun_v060_fiction_tag_'+mode,'',''),extra:{lineVisible:false}})}setResult(d)
};

ac.categoryCenter=function(){var view=S(getParam('view','')||(typeof MY_PARAMS==='object'&&MY_PARAMS.view)||'');if(view==='community')return ac.__v060a6CommunityPage();if(view==='fiction'||view==='audio')return ac.__v060a6FictionPage(view);return ac.__v060a6MainCategory()};

ac.build='2026.08.22-v0.6.0-alpha6';
ac.runtimeMode='test-ui-v060-alpha6';
try{setItem('acfun_test_runtime','0.6.0-alpha6 product-ui')}catch(e){}
})();
