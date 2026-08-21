/**
 * ACFun 0.6.0-alpha3 / Build 154
 * Home / category / search UI rebuilt from GUIDE 2.1 Native Design System.
 */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.21-v0.6.0-alpha3';
ac.runtimeMode='test-ui-v060-alpha3';

var A='#FF4D4F',M='#8A8A8A',BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';
function S(v){return String(v===undefined||v===null?'':v)}
function E(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function P(){try{return Math.max(1,Number(MY_PAGE||1)||1)}catch(e){return 1}}
function I(n){return BASE+n+'.svg'}
function sectionName(s){return({featured:'精选',comic:'漫画',anime:'动漫',video:'视频',lifan:'里番',short:'短视频'})[s]||'内容'}
function sectionIcon(s,on){var n=({featured:'featured',comic:'comic',anime:'anime',video:'video',lifan:'lifan'})[s]||'featured';return I(n+(on?'':'_off'))}
function rich(t,sub){return'<b>'+E(t)+'</b>'+(sub?'  <font color="'+M+'">'+E(sub)+'</font>':'')}
function selectedText(name,on){return on?'““””<b><font color="'+A+'">✓ '+E(name)+'</font></b>':E(name)}
function getState(k,def){var v=S(getMyVar(k,'')||'');if(!v)v=S(getItem('acfun_v060_state_'+k,def||'')||'');if(v)putMyVar(k,v);return v}
function clean(rows,kind){var out=[],seen={};(rows||[]).forEach(function(x){x=x||{};var id=S(x.id),name=S(x.name).replace(/\s+/g,' ').trim();if(!id||!name)return;if(ac.__v060VisibleCategoryName&&!ac.__v060VisibleCategoryName(name,kind||''))return;var k=id+'|'+name;if(seen[k])return;seen[k]=1;out.push({id:id,name:name,value:x.value,raw:x.raw})});return out}
function extra(info){return{video_id:info.id,video_title:info.title,video_img:info.img,video_uri:info.uri,video_data:JSON.stringify(info.raw||{}),pageTitle:info.title,lineVisible:false,longClick:[{title:'加入本地收藏',js:$.toString(function(){var s=getItem('acfun_core_src_v018','');if(!s)return'toast://核心缓存不存在';eval(s);return ac.favoriteFromParams()})},{title:'复制标题',js:$.toString(function(){return'copy://'+String(MY_PARAMS.video_title||'')})}]}}
function age(ts){var d=Math.max(0,Date.now()-Number(ts||0));if(d<60000)return'刚刚';if(d<3600000)return Math.floor(d/60000)+'分钟前';if(d<86400000)return Math.floor(d/3600000)+'小时前';if(d<604800000)return Math.floor(d/86400000)+'天前';var x=new Date(Number(ts||0));return(x.getMonth()+1)+'/'+x.getDate()}

ac.__v060Sections=[{key:'featured',name:'精选'},{key:'comic',name:'漫画'},{key:'anime',name:'动漫'},{key:'video',name:'视频'},{key:'lifan',name:'里番'}];
ac.__v050Section=function(){var v=S(getMyVar('acfun_v050_section','')||'');if(!v&&getItem('acfun_v060_remember_section','1')==='1')v=S(getItem('acfun_v060_section','featured')||'featured');if(!v)v='featured';var ok=v==='short';ac.__v060Sections.forEach(function(x){if(x.key===v)ok=true});if(!ok)v='featured';putMyVar('acfun_v050_section',v);return v};
ac.__v050Sorts=[{name:'综合',value:'0'},{name:'最新',value:'1'},{name:'最多观看',value:'2'},{name:'最多点赞',value:'3'}];
ac.__v050Sort=function(sec){sec=sec||ac.__v050Section();var v=S(getMyVar('acfun_v050_sort_'+sec,'')||getItem('acfun_v060_sort_'+sec,'1')||'1');putMyVar('acfun_v050_sort_'+sec,v);return v};
ac.__v060SortName=function(sec){var v=ac.__v050Sort(sec),n='最新';ac.__v050Sorts.forEach(function(x){if(S(x.value)===v)n=x.name});return n};
ac.__v060Hydrate=function(s){if(s==='featured')getState('acfun_v050_station_featured','');else if(s==='lifan')getState('acfun_v050_station_lifan','');else if(s==='comic')getState('acfun_v050_comic_station','');else if(s==='anime'){getState('acfun_v050_class_anime','');getState('acfun_v050_tag_anime','')}else if(s==='video'){getState('acfun_v050_class_video','');getState('acfun_v050_tag_video','')}else if(s==='short')getState('acfun_v050_short_load_type','3')};
ac.__v060Summary=function(s){s=s||ac.__v050Section();ac.__v060Hydrate(s);try{if(s==='featured'||s==='lifan'){var st=ac.__v050Station(s==='lifan'?1:0);return st?S(st.name):sectionName(s)}if(s==='comic'){var c=ac.__v050ComicStation();return c?S(c.name):'漫画'}if(s==='anime'||s==='video'){var cl=ac.__v050Class(s),tg=ac.__v050Tag(s,cl),a=[];if(cl)a.push(S(cl.name));if(tg)a.push(S(tg.name));return a.length?a.join(' · '):sectionName(s)}if(s==='short')return getState('acfun_v050_short_load_type','3')==='4'?'发现':'推荐'}catch(e){}return sectionName(s)};

function topNav(d){
    d.push({title:'搜索视频、标题或标签',pic_url:I('search'),img:I('search'),col_type:'text_icon',url:'hiker://page/acfun_search_center?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:'ACFun 搜索',lineVisible:false}});
    var cur=ac.__v050Section();
    ac.__v060Sections.forEach(function(x){d.push({title:x.name,pic_url:sectionIcon(x.key,cur===x.key),img:sectionIcon(x.key,cur===x.key),col_type:'icon_5',url:$('hiker://empty#noLoading#').lazyRule(function(k){putMyVar('acfun_v050_section',k);setItem('acfun_v060_section',k);refreshPage(false);return'hiker://empty'},x.key),extra:{lineVisible:false}})});
    if(getItem('acfun_v060_show_quick','1')==='1'){
        var shortOn=cur==='short';
        [{name:'短视频',icon:shortOn?'short':'short_off',section:'short'},{name:'收藏',icon:'favorite_off',page:'acfun_favorites'},{name:'历史',icon:'history_off',page:'acfun_history'},{name:'设置',icon:'settings_off',page:'acfun_settings'}].forEach(function(x){var u=x.section?$('hiker://empty#noLoading#').lazyRule(function(k){putMyVar('acfun_v050_section',k);setItem('acfun_v060_section',k);refreshPage(false);return'hiker://empty'},x.section):'hiker://page/'+x.page+'?rule=ACFun&simple=true#noRecordHistory#';d.push({title:x.name,pic_url:I(x.icon),img:I(x.icon),col_type:'icon_small_4',url:u,extra:{inheritTitle:false,pageTitle:x.name,lineVisible:false}})})
    }
}

function continueWatching(d){if(getItem('acfun_v060_continue','1')!=='1')return;var h=ac.historyList();if(!h.length)return;var it=h[0],raw=ac.safeJson(it.data)||{},info=ac.itemInfo({videoId:it.id,title:it.title,cover:it.img,videoUri:it.uri,video:raw});if(!info.id)return;d.push({title:rich('继续观看',age(it.time)),col_type:'rich_text',extra:{textSize:15,lineVisible:false}});d.push({title:info.title,desc:(info.author?info.author+' · ':'')+'继续上次播放',pic_url:ac.image(info.img),img:ac.image(info.img),url:ac.detailUrl(info),col_type:'movie_1_left_pic',extra:extra(info)});d.push({col_type:'line'})}

function filterEntry(d,s){var summary=ac.__v060Summary(s),sort=s==='short'?'':(' · '+ac.__v060SortName(s));d.push({title:'筛选：'+summary+sort,pic_url:I('filter'),img:I('filter'),col_type:'text_icon',url:'hiker://page/acfun_category?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:'分类与筛选',lineVisible:false}})}

function hero(d,x){var info=ac.itemInfo(x);if(!info.id)return false;var meta=[];if(info.author)meta.push(info.author);if(info.watch)meta.push('▶ '+ac.fmtNum(info.watch));if(info.duration)meta.push(info.duration);d.push({title:info.title,desc:meta.join(' · '),pic_url:ac.image(info.img),img:ac.image(info.img),url:ac.detailUrl(info),col_type:'card_pic_1',extra:extra(info)});return true}
function videoCard(d,x,col){var info=ac.itemInfo(x),m=[];if(info.watch)m.push('▶ '+ac.fmtNum(info.watch));if(info.like)m.push('♥ '+ac.fmtNum(info.like));if(info.duration)m.push(info.duration);if(!m.length&&info.author)m.push(info.author);d.push({title:info.title||'未命名视频',desc:m.join('  '),pic_url:ac.image(info.img),img:ac.image(info.img),url:ac.detailUrl(info),col_type:col||getItem('acfun_v060_video_layout','movie_2'),extra:extra(info)})}

ac.home=function(){
    var d=[],p=P(),s=ac.__v050Section();ac.__v060Hydrate(s);
    if(p===1){topNav(d);continueWatching(d);filterEntry(d,s);d.push({col_type:'line'});d.push({title:rich(sectionName(s),ac.__v060Summary(s)+(s==='short'?'':' · '+ac.__v060SortName(s))),col_type:'rich_text',extra:{textSize:17,lineVisible:false}})}
    var list=[];try{if(s==='featured')list=ac.__v050StationList(p,0);else if(s==='lifan')list=ac.__v050StationList(p,1);else if(s==='comic')list=ac.__v050ComicList(p);else if(s==='short')list=ac.__v050ShortList(p);else list=ac.__v050CatalogList(p,s)}catch(e){try{setItem('acfun_v060_home_error',S(e.message||e))}catch(e0){}}
    if(s==='comic'){
        list.forEach(function(x){var ci=ac.__v047ComicInfo(x);if(!ci.id)return;d.push({title:ci.title,desc:ci.desc,pic_url:ac.image(ci.img),img:ac.image(ci.img),col_type:'movie_3',url:ac.__v047ComicUrl(),extra:{inheritTitle:false,pageTitle:ci.title,comics_id:ci.id,comics_title:ci.title,content_kind:'comic',lineVisible:false}})})
    }else if(s==='short'){
        for(var si=0;si<list.length;si++)videoCard(d,list[si],'movie_3');
    }else{
        var start=0;if(p===1&&getItem('acfun_v060_hero','1')==='1'&&list.length){if(hero(d,list[0]))start=1}
        for(var i=start;i<list.length;i++)videoCard(d,list[i]);
    }
    if(!list.length&&p===1){
        d.push({title:s==='short'?'短视频暂时没有加载到内容':'当前条件暂时没有内容',desc:s==='short'?'已自动尝试短视频类型参数和兼容模式。可以重新加载，仍为空时进入诊断。':'可以进入“分类与筛选”更换频道，或稍后刷新。',col_type:'long_text',url:'hiker://empty'});
        d.push({title:'重新加载',pic_url:I('history'),img:I('history'),col_type:'text_icon',url:$('hiker://empty#noLoading#').lazyRule(function(){refreshPage(false);return'hiker://empty'}),extra:{lineVisible:false}});
        if(s==='short')d.push({title:'查看接口诊断',pic_url:I('settings_off'),img:I('settings_off'),col_type:'text_icon',url:'hiker://page/acfun_diag?rule=ACFun&simple=true#noRecordHistory#',extra:{lineVisible:false}})
    }
    setResult(d)
};

function groupTitle(d,t,sub){d.push({title:rich(t,sub||''),col_type:'rich_text',extra:{textSize:15,lineVisible:false}})}
function stateButton(d,x,current,key,clearKey){d.push({title:selectedText(x.name,S(current)===S(x.id)),col_type:'flex_button',url:$('hiker://empty#noLoading#').lazyRule(function(v,k,ck){if(v)putMyVar(k,String(v));else clearMyVar(k);setItem('acfun_v060_state_'+k,String(v||''));if(ck){clearMyVar(ck);setItem('acfun_v060_state_'+ck,'')}refreshPage(false);return'hiker://empty'},x.id,key,clearKey||''),extra:{lineVisible:false}})}
function sortButton(d,x,current,sec){d.push({title:selectedText(x.name,S(x.value)===S(current)),col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(v,s){putMyVar('acfun_v050_sort_'+s,String(v));setItem('acfun_v060_sort_'+s,String(v));refreshPage(false);return'hiker://empty'},x.value,sec),extra:{lineVisible:false}})}

ac.categoryCenter=function(){
    var d=[],s=ac.__v050Section();setPageTitle('分类与筛选');
    d.push({title:rich('当前条件',sectionName(s)+' · '+ac.__v060Summary(s)+(s==='short'?'':' · '+ac.__v060SortName(s))),col_type:'rich_text',extra:{textSize:16,lineVisible:false}});
    groupTitle(d,'内容频道','一级栏目');
    ac.__v060Sections.forEach(function(x){d.push({title:x.name,pic_url:sectionIcon(x.key,s===x.key),img:sectionIcon(x.key,s===x.key),col_type:'icon_5',url:$('hiker://empty#noLoading#').lazyRule(function(k){putMyVar('acfun_v050_section',k);setItem('acfun_v060_section',k);refreshPage(false);return'hiker://empty'},x.key),extra:{lineVisible:false}})});
    s=ac.__v050Section();ac.__v060Hydrate(s);
    if(s==='short'){
        groupTitle(d,'短视频模式');var sv=getState('acfun_v050_short_load_type','3');clean(ac.__v050ShortTabs).forEach(function(x){stateButton(d,x,sv,'acfun_v050_short_load_type','')});
    }else if(s==='featured'||s==='lifan'){
        var r=s==='lifan'?1:0,key=r?'acfun_v050_station_lifan':'acfun_v050_station_featured',rows=clean(ac.__v050Stations(r)),cur=getState(key,'');if(!cur&&rows.length)cur=S(rows[0].id);groupTitle(d,'频道',rows.length+' 个');rows.forEach(function(x){stateButton(d,x,cur,key,'')})
    }else if(s==='comic'){
        var ca=clean(ac.__v050ComicStations(),'comic'),cc=getState('acfun_v050_comic_station','');if(!cc&&ca.length)cc=S(ca[0].id);groupTitle(d,'漫画频道',ca.length+' 个有效频道');ca.forEach(function(x){stateButton(d,x,cc,'acfun_v050_comic_station','')})
    }else if(s==='anime'||s==='video'){
        var ck=s==='video'?'acfun_v050_class_video':'acfun_v050_class_anime',tk=s==='video'?'acfun_v050_tag_video':'acfun_v050_tag_anime',cl=clean(ac.__v050Catalog(s)),cv=getState(ck,'');if(!cv&&cl.length)cv=S(cl[0].id);groupTitle(d,'分类',cl.length+' 个');cl.forEach(function(x){stateButton(d,x,cv,ck,tk)});
        var cls=ac.__v050Class(s),tags=clean(ac.__v050Tags(s,cls)),tv=getState(tk,'');if(tags.length){groupTitle(d,'标签',tags.length+' 个');d.push({title:selectedText('全部',!tv),col_type:'flex_button',url:$('hiker://empty#noLoading#').lazyRule(function(k){clearMyVar(k);setItem('acfun_v060_state_'+k,'');refreshPage(false);return'hiker://empty'},tk),extra:{lineVisible:false}});tags.forEach(function(x){stateButton(d,x,tv,tk,'')})}
    }
    if(s!=='short'){groupTitle(d,'排序');var sort=ac.__v050Sort(s);ac.__v050Sorts.forEach(function(x){sortButton(d,x,sort,s)})}
    d.push({col_type:'line'});
    d.push({title:'完成，返回 ACFun',pic_url:I('featured'),img:I('featured'),col_type:'text_icon',url:'hiker://home@ACFun',extra:{lineVisible:false}});
    d.push({title:'重置当前栏目筛选',pic_url:I('filter'),img:I('filter'),col_type:'text_icon',url:$('hiker://empty#noLoading#').lazyRule(function(sec){function r(k){clearMyVar(k);setItem('acfun_v060_state_'+k,'')}if(sec==='featured')r('acfun_v050_station_featured');else if(sec==='lifan')r('acfun_v050_station_lifan');else if(sec==='comic')r('acfun_v050_comic_station');else if(sec==='anime'){r('acfun_v050_class_anime');r('acfun_v050_tag_anime')}else if(sec==='video'){r('acfun_v050_class_video');r('acfun_v050_tag_video')}else if(sec==='short')r('acfun_v050_short_load_type');putMyVar('acfun_v050_sort_'+sec,'1');setItem('acfun_v060_sort_'+sec,'1');refreshPage(false);return'toast://已重置当前栏目'},s),extra:{lineVisible:false}});
    setResult(d)
};

function historyList(){try{var a=JSON.parse(getItem('acfun_v060_search_history','[]'))||[];return Array.isArray(a)?a:[]}catch(e){return[]}}
ac.searchCenter=function(){var d=[];setPageTitle('ACFun 搜索');d.push({title:'搜索视频、标题或标签',desc:'输入关键词',col_type:'input',url:$.toString(function(){var q=String(input||'').trim();if(!q)return'toast://请输入搜索关键词';var a=[];try{a=JSON.parse(getItem('acfun_v060_search_history','[]'))||[]}catch(e){}a=a.filter(function(x){return String(x)!==q});a.unshift(q);setItem('acfun_v060_search_history',JSON.stringify(a.slice(0,20)));return'hiker://search?s='+encodeURIComponent(q)+'&rule=ACFun'}),extra:{titleVisible:false,defaultValue:'',lineVisible:false}});var h=historyList();if(h.length){groupTitle(d,'最近搜索',h.length+' 条');h.forEach(function(q){d.push({title:q,col_type:'flex_button',url:'hiker://search?s='+encodeURIComponent(q)+'&rule=ACFun',extra:{lineVisible:false}})});d.push({title:'清空搜索历史',pic_url:I('history_off'),img:I('history_off'),col_type:'text_icon',url:$('hiker://empty#noLoading#').lazyRule(function(){setItem('acfun_v060_search_history','[]');refreshPage(false);return'toast://已清空'}),extra:{lineVisible:false}})}else d.push({title:'还没有搜索记录',desc:'搜索过的标题或标签会显示在这里。',col_type:'long_text',url:'hiker://empty'});d.push({col_type:'line'});d.push({title:'按分类浏览',desc:'频道、分类、标签和排序统一在这里管理。',pic_url:I('filter'),img:I('filter'),col_type:'text_icon',url:'hiker://page/acfun_category?rule=ACFun&simple=true#noRecordHistory#',extra:{lineVisible:false}});setResult(d)};

ac.search=function(){var d=[],kw=getParam('kw','')||getParam('s','')||getMyVar('acfun_search_kw','');if(!kw){try{kw=decodeURIComponent(getParam('q',''))}catch(e){}}kw=S(kw);putMyVar('acfun_search_kw',kw);if(P()===1)d.push({title:rich('搜索结果',kw),col_type:'rich_text',extra:{textSize:17,lineVisible:false}});var size=Number(getItem('acfun_page_size','8'))||8,key='search|'+kw+'|'+P()+'|'+size,c=ac.__v042Read?ac.__v042Read(key,120,900):{hit:false,stale:false,data:null},list=[];if(c.stale&&Array.isArray(c.data))list=c.data;if(!list.length){var p={keyword:kw,keyWord:kw,name:kw,pageNum:P(),page:P(),pageSize:size,limit:size,searchType:'video'};try{list=ac.arr(ac.api('search/keyWordV2',p,{timeout:750,maxAttempts:4}))}catch(e1){}if(!list.length)try{list=ac.arr(ac.api('search/keyWord',p,{timeout:750,maxAttempts:4}))}catch(e2){}if(list.length&&ac.__v042Write)ac.__v042Write(key,list)}list.forEach(function(x){videoCard(d,x)});if(!list.length&&P()===1)d.push({title:'没有找到匹配内容',desc:'关键词：'+kw+'\n可以尝试更短的标题关键词或标签。',col_type:'long_text',url:'hiker://empty'});setResult(d)};

try{setItem('acfun_test_runtime','0.6.0-alpha3 home/category/search')}catch(e){}
})();
