/** ACFun 0.6.0-alpha9 / Build 160 - clean inline filters + safer feed cards. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var M='#8A8A8A',BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';
var BOOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v065.js?v=6500',BVER=6500;
function S(v){return String(v===undefined||v===null?'':v)}
function E(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function P(){try{return Math.max(1,Number(MY_PAGE||1)||1)}catch(e){return 1}}
function I(n){return BASE+n+'.svg'}
function nameOf(s){return({featured:'精选',comic:'漫画',anime:'动漫',video:'视频',lifan:'里番',short:'短视频',community:'社区',fiction:'小说',audio:'有声'})[s]||'内容'}
function rich(t,sub){return'<b>'+E(t)+'</b>'+(sub?'  <font color="'+M+'">'+E(sub)+'</font>':'')}
function section(d,t,sub){d.push({title:rich(t,sub||''),col_type:'rich_text',extra:{textSize:16,lineVisible:false}})}
function state(k,def){var v=S(getMyVar(k,'')||getItem('acfun_v060_state_'+k,def||'')||'');if(v)putMyVar(k,v);return v}
function save(k,v){if(v){putMyVar(k,S(v));setItem('acfun_v060_state_'+k,S(v))}else{clearMyVar(k);setItem('acfun_v060_state_'+k,'')}}
function currentName(rows,id,def){for(var i=0;i<(rows||[]).length;i++)if(S(rows[i].id)===S(id))return S(rows[i].name);return def||''}
function validCurrent(rows,id){for(var i=0;i<(rows||[]).length;i++)if(S(rows[i].id)===S(id))return id;return''}
function infoLine(a){return a.filter(function(v){return!!S(v)}).join(' · ')}
function extra(info){info=info||{};var kind=S(info.kind||'video'),x={content_kind:kind,content_id:info.id,pageTitle:info.title,lineVisible:false};if(kind==='comic'){x.comics_id=info.id;x.comics_title=info.title;x.comics_img=info.img}else if(kind==='fiction'){x.fiction_id=info.id;x.fiction_title=info.title;x.fiction_img=info.img}else if(kind==='dynamic'){x.dynamic_id=info.id;x.dynamic_title=info.title}else{x.video_id=info.id;x.video_title=info.title;x.video_img=info.img;x.video_uri=info.uri;x.video_data=JSON.stringify(info.raw||{})}return x}
function mainIcon(s,on){var n=({featured:'featured',comic:'comic',anime:'anime',video:'video',lifan:'lifan'})[s]||'featured';return I(n+(on?'':'_off'))}
function extIcon(s,on){var n=({short:'short',community:'community',fiction:'novel',audio:'audio'})[s]||'more';return I(n+(on?'':'_off'))}
function setSectionUrl(sec){return $('hiker://empty#noLoading#').lazyRule(function(s){putMyVar('acfun_v050_section',s);setItem('acfun_v060_section',s);refreshPage(false);return'hiker://empty'},sec)}
function modalUrl(title,rows,current,key,clearKey,allowAll){
    var opts=[],vals=[];if(allowAll){opts.push('全部');vals.push('')}
    for(var i=0;i<(rows||[]).length;i++){opts.push(S(rows[i].name));vals.push(S(rows[i].id))}
    if(!opts.length)return'toast://暂无可选项';
    var idx=0;for(var j=0;j<vals.length;j++)if(S(vals[j])===S(current)){idx=j;break}
    return'select://'+JSON.stringify({title:title,options:opts,selectedIndex:idx,col:3,js:$.toString(function(os,vs,k,ck){var i=os.indexOf(input);if(i<0)return;var v=vs[i];if(v){putMyVar(k,String(v));setItem('acfun_v060_state_'+k,String(v))}else{clearMyVar(k);setItem('acfun_v060_state_'+k,'')}if(ck){clearMyVar(ck);setItem('acfun_v060_state_'+ck,'')}refreshPage(false)},opts,vals,key,clearKey||'')})
}
function filterBtn(d,label,value,url){d.push({title:label+' · '+(value||'全部')+'  ▾',col_type:'scroll_button',url:url,extra:{lineVisible:false}})}
function resetUrl(sec){return $('hiker://empty#noLoading#').lazyRule(function(s){function c(k){clearMyVar(k);setItem('acfun_v060_state_'+k,'')}if(s==='featured')c('acfun_v050_station_featured');else if(s==='lifan')c('acfun_v050_station_lifan');else if(s==='comic')c('acfun_v050_comic_station');else if(s==='anime'){c('acfun_v050_class_anime');c('acfun_v050_tag_anime')}else if(s==='video'){c('acfun_v050_class_video');c('acfun_v050_tag_video')}else if(s==='community')c('acfun_v060_dynamic_category');else if(s==='fiction')c('acfun_v060_fiction_tag_fiction');else if(s==='audio')c('acfun_v060_fiction_tag_audio');else if(s==='short'){putMyVar('acfun_v050_short_load_type','2');setItem('acfun_v060_state_acfun_v050_short_load_type','2')}c('acfun_v050_sort_'+s);setItem('acfun_v060_sort_'+s,'1');if(s==='community'){putMyVar('acfun_v060_dynamic_sort','hot');setItem('acfun_v060_state_acfun_v060_dynamic_sort','hot')}if(s==='fiction'||s==='audio'){var k='acfun_v060_fiction_sort_'+s;putMyVar(k,'1');setItem('acfun_v060_state_'+k,'1')}refreshPage(false);return'toast://已恢复默认'},sec)}
function sortRows(){var a=[];for(var i=0;i<(ac.__v050Sorts||[]).length;i++)a.push({id:S(ac.__v050Sorts[i].value),name:S(ac.__v050Sorts[i].name)});return a}
function sortName(sec){try{return ac.__v060SortName(sec)}catch(e){return'最新'}}

function top(d){
    d.push({title:'搜索视频、漫画、小说与社区',pic_url:I('search'),img:I('search'),col_type:'text_icon',url:'hiker://page/acfun_search_center?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:'ACFun 全站搜索',lineVisible:false}});
    var cur=ac.__v050Section(),main=[{key:'featured',name:'精选'},{key:'comic',name:'漫画'},{key:'anime',name:'动漫'},{key:'video',name:'视频'},{key:'lifan',name:'里番'}];
    for(var i=0;i<main.length;i++){var x=main[i];d.push({title:x.name,pic_url:mainIcon(x.key,cur===x.key),img:mainIcon(x.key,cur===x.key),col_type:'icon_5',url:setSectionUrl(x.key),extra:{lineVisible:false}})}
    if(getItem('acfun_v060_show_extensions','1')==='1'){var ext=[{key:'short',name:'短视频'},{key:'community',name:'社区'},{key:'fiction',name:'小说'},{key:'audio',name:'有声'}];for(var j=0;j<ext.length;j++){var y=ext[j];d.push({title:y.name,pic_url:extIcon(y.key,cur===y.key),img:extIcon(y.key,cur===y.key),col_type:'icon_small_4',url:setSectionUrl(y.key),extra:{lineVisible:false}})}}
    if(getItem('acfun_v060_show_personal','1')==='1'){[{name:'收藏',icon:'favorite_off',page:'acfun_favorites'},{name:'历史',icon:'history_off',page:'acfun_history'},{name:'设置',icon:'settings_off',page:'acfun_settings'}].forEach(function(x){d.push({title:x.name,pic_url:I(x.icon),img:I(x.icon),col_type:'icon_small_3',url:'hiker://page/'+x.page+'?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:x.name,lineVisible:false}})})}
}
function inlineFilters(d,s){
    if(s==='featured'||s==='lifan'){
        var r=s==='lifan'?1:0,key=r?'acfun_v050_station_lifan':'acfun_v050_station_featured',rows=ac.__v050Stations(r)||[],cur=validCurrent(rows,state(key,''));if(!cur&&rows.length){cur=S(rows[0].id);save(key,cur)}
        filterBtn(d,s==='lifan'?'里番频道':'精选频道',currentName(rows,cur,'默认'),modalUrl(s==='lifan'?'选择里番频道':'选择精选频道',rows,cur,key,'',false));
        var sr=sortRows(),sv=S(ac.__v050Sort(s));filterBtn(d,'排序',sortName(s),modalUrl('选择排序',sr,sv,'acfun_v050_sort_'+s,'',false))
    }else if(s==='comic'){
        var rows2=ac.__v050ComicStations()||[],cur2=validCurrent(rows2,state('acfun_v050_comic_station',''));if(!cur2&&rows2.length){cur2=S(rows2[0].id);save('acfun_v050_comic_station',cur2)}
        filterBtn(d,'漫画分类',currentName(rows2,cur2,'默认'),modalUrl('选择漫画分类',rows2,cur2,'acfun_v050_comic_station','',false));
        var sr2=sortRows(),sv2=S(ac.__v050Sort(s));filterBtn(d,'排序',sortName(s),modalUrl('选择排序',sr2,sv2,'acfun_v050_sort_'+s,'',false))
    }else if(s==='anime'||s==='video'){
        var ck=s==='video'?'acfun_v050_class_video':'acfun_v050_class_anime',tk=s==='video'?'acfun_v050_tag_video':'acfun_v050_tag_anime',classes=ac.__v050Catalog(s)||[],cv=validCurrent(classes,state(ck,''));if(!cv&&classes.length){cv=S(classes[0].id);save(ck,cv);save(tk,'')}
        filterBtn(d,'分类',currentName(classes,cv,'默认'),modalUrl('选择分类',classes,cv,ck,tk,false));
        var cls=ac.__v050Class(s),tags=ac.__v050Tags(s,cls)||[],tv=validCurrent(tags,state(tk,''));if(!tv&&state(tk,''))save(tk,'');
        filterBtn(d,'标签',currentName(tags,tv,'全部'),modalUrl('选择标签',tags,tv,tk,'',true));
        var sr3=sortRows(),sv3=S(ac.__v050Sort(s));filterBtn(d,'排序',sortName(s),modalUrl('选择排序',sr3,sv3,'acfun_v050_sort_'+s,'',false))
    }else if(s==='short'){
        var tabs=ac.__v050ShortTabs||[],sv4=validCurrent(tabs,state('acfun_v050_short_load_type','2'))||'2';filterBtn(d,'短视频',currentName(tabs,sv4,'推荐'),modalUrl('选择短视频流',tabs,sv4,'acfun_v050_short_load_type','',false))
    }else if(s==='community'){
        var cats=ac.__v060a4CommunityCategories()||[],cc=validCurrent(cats,state('acfun_v060_dynamic_category',''));if(!cc&&state('acfun_v060_dynamic_category',''))save('acfun_v060_dynamic_category','');
        filterBtn(d,'动态分类',currentName(cats,cc,'全部'),modalUrl('选择动态分类',cats,cc,'acfun_v060_dynamic_category','',true));
        var ds=state('acfun_v060_dynamic_sort','hot'),dr=[{id:'hot',name:'热门'},{id:'new',name:'最新'}];filterBtn(d,'排序',ds==='new'?'最新':'热门',modalUrl('动态排序',dr,ds,'acfun_v060_dynamic_sort','',false))
    }else if(s==='fiction'||s==='audio'){
        var tags2=ac.__v060a4FictionTags()||[],fk='acfun_v060_fiction_tag_'+s,fc=validCurrent(tags2,state(fk,''));if(!fc&&state(fk,''))save(fk,'');
        var sk='acfun_v060_fiction_sort_'+s,fs=state(sk,'1'),fr=[{id:'1',name:'最新'},{id:'2',name:'热门'},{id:'3',name:'完结'}];
        filterBtn(d,s==='audio'?'有声分类':'小说分类',currentName(tags2,fc,'全部'),modalUrl('选择'+(s==='audio'?'有声':'小说')+'分类',tags2,fc,fk,'',true));
        filterBtn(d,'排序',currentName(fr,fs,'最新'),modalUrl('选择排序',fr,fs,sk,'',false))
    }
    d.push({title:'重置',col_type:'scroll_button',url:resetUrl(s),extra:{lineVisible:false}});d.push({col_type:'line'})
}
function saveSeed(prefix,id,raw){try{var s=JSON.stringify(raw||{});if(s.length<180000)setItem(prefix+S(id),s)}catch(e){}}
function videoCard(d,x,col){var info=ac.itemInfo(x),m=[];if(!info.id)return;info.kind='video';if(info.watch)m.push('▶ '+ac.fmtNum(info.watch));if(info.like)m.push('♥ '+ac.fmtNum(info.like));if(info.duration)m.push(info.duration);if(!m.length&&info.author)m.push(info.author);d.push({title:info.title||('视频 '+info.id),desc:m.join('  '),pic_url:ac.image(info.img),img:ac.image(info.img),url:ac.__v060a4Route(info),col_type:col||getItem('acfun_v060_video_layout','movie_2'),extra:extra(info)})}
function shortCard(d,x){var info=ac.itemInfo(x),m=[];if(!info.id)return;if(info.author)m.push(info.author);if(info.watch)m.push('▶ '+ac.fmtNum(info.watch));if(info.duration)m.push(info.duration);d.push({title:info.title||'短视频',desc:m.join(' · '),pic_url:ac.image(info.img),img:ac.image(info.img),col_type:'movie_3',url:$('hiker://empty').lazyRule(function(id,raw,uri,boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);ACFunBoot.loadOnly();return ac.play(id,raw,uri)}catch(e){return'toast://播放失败：'+String(e.message||e)}},info.id,JSON.stringify(info.raw||{}),info.uri||'',BOOT,BVER),extra:extra(info)})}
function comicCard(d,x){var info=ac.__v060a4ComicInfo(x);if(!info.id)return;d.push({title:info.title,desc:infoLine([info.author,info.desc]),pic_url:ac.image(info.img),img:ac.image(info.img),url:ac.__v060a4Route(info),col_type:'movie_3',extra:extra(info)})}
function fictionUrl(info,mode){return'hiker://page/acfun_detail?rule=ACFun&simple=true&content_kind=fiction&fiction_id='+encodeURIComponent(S(info.id))+'&fiction_title='+encodeURIComponent(S(info.title))+'&fiction_img='+encodeURIComponent(S(info.img))+'&fiction_mode='+encodeURIComponent(mode)+'#noRecordHistory#'}
function fictionCard(d,x,mode){var info=ac.__v060a4FictionInfo(x);if(!info.id)return;saveSeed('acfun_v060_fiction_seed_',info.id,x);var pic=info.img?ac.image(info.img):I(mode==='audio'?'audio':'novel');d.push({title:info.title,desc:infoLine([info.author,info.status]),pic_url:pic,img:pic,url:fictionUrl(info,mode),col_type:'movie_3',extra:extra(info)})}
function dynamicCard(d,x){var info=ac.__v060a4DynamicInfo(x);if(!info.id)return;saveSeed('acfun_v060_dynamic_seed_',info.id,x);var t=info.content||info.title||'社区动态';if(t.length>70)t=t.slice(0,70)+'…';var meta=[];if(info.author)meta.push(info.author);if(info.comment)meta.push('评论 '+ac.fmtNum(info.comment));if(info.time)meta.push(info.time);var pic=info.img?ac.image(info.img):'';d.push({title:t,desc:meta.join(' · '),pic_url:pic,img:pic,url:ac.__v060a4Route(info),col_type:pic?'movie_1_left_pic':'text_1',extra:extra(info)})}
function compactHero(d,list){if(getItem('acfun_v060_hero','0')!=='1')return 0;for(var i=0;i<Math.min(5,list.length);i++){var info=ac.itemInfo(list[i]);if(!info.id||!info.img)continue;info.kind='video';d.push({title:info.title,desc:infoLine([info.author,info.watch?('▶ '+ac.fmtNum(info.watch)):'']),pic_url:ac.image(info.img),img:ac.image(info.img),url:ac.__v060a4Route(info),col_type:'movie_1_left_pic',extra:extra(info)});return i+1}return 0}

ac.home=function(){
    var d=[],p=P(),s=ac.__v050Section();if(p===1){top(d);inlineFilters(d,s);section(d,nameOf(s),s==='short'?'点击卡片直接播放':'筛选后内容会在当前页即时刷新')}
    var list=[];try{if(s==='featured')list=ac.__v050StationList(p,0);else if(s==='lifan')list=ac.__v050StationList(p,1);else if(s==='comic')list=ac.__v050ComicList(p);else if(s==='short')list=ac.__v050ShortList(p);else if(s==='community')list=ac.__v060a4DynamicList(p);else if(s==='fiction'||s==='audio')list=ac.__v060a4FictionList(p,s);else list=ac.__v050CatalogList(p,s)}catch(e){try{setItem('acfun_v060_a9_home_error',S(e.message||e))}catch(e0){}}
    if(s==='comic')for(var i=0;i<list.length;i++)comicCard(d,list[i]);
    else if(s==='short')for(var j=0;j<list.length;j++)shortCard(d,list[j]);
    else if(s==='community')for(var k=0;k<list.length;k++)dynamicCard(d,list[k]);
    else if(s==='fiction'||s==='audio')for(var f=0;f<list.length;f++)fictionCard(d,list[f],s);
    else{var start=p===1?compactHero(d,list):0;for(var q=start;q<list.length;q++)videoCard(d,list[q])}
    if(!list.length&&p===1)d.push({title:'当前条件暂时没有内容',desc:(s==='fiction'||s==='audio')?'列表 Provider 已恢复；当前条件为空时可点上方“重置”回到全部。':'可以直接点上方筛选项换条件，不会再打开新的筛选页。',col_type:'long_text',url:'hiker://empty'});
    setResult(d)
};
ac.categoryCenter=function(){setPageTitle('筛选');setResult([{title:'筛选已合并到 ACFun 首页',desc:'分类、标签、频道和排序都在首页原地弹层选择，选中后立即刷新，不再通过独立筛选页累积返回栈。',col_type:'long_text',url:'hiker://home@ACFun'},{title:'返回 ACFun 首页',col_type:'text_center_1',url:'hiker://home@ACFun'}])};
ac.build='2026.08.22-v0.6.0-alpha9';ac.runtimeMode='test-ui-v060-alpha9-clean-inline-filter';try{setItem('acfun_test_runtime','0.6.0-alpha9 same-page-ui')}catch(e){}
})();