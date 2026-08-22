/** ACFun 0.6.0-alpha10 / Build 161 - recovery home UI on Alpha8 providers. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';
var BOOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v066.js?v=6600',BVER=6600;
function S(v){return String(v===undefined||v===null?'':v)}
function P(){try{return Math.max(1,Number(MY_PAGE||1)||1)}catch(e){return 1}}
function I(n){return BASE+n+'.svg'}
function nameOf(s){return({featured:'精选',comic:'漫画',anime:'动漫',video:'视频',lifan:'里番',short:'短视频',community:'社区',fiction:'小说',audio:'有声'})[s]||'内容'}
function state(k,def){var v=S(getMyVar(k,'')||getItem('acfun_v060_state_'+k,def||'')||'');if(v)putMyVar(k,v);return v}
function save(k,v){if(v){putMyVar(k,S(v));setItem('acfun_v060_state_'+k,S(v))}else{clearMyVar(k);setItem('acfun_v060_state_'+k,'')}}
function currentName(rows,id,def){for(var i=0;i<(rows||[]).length;i++)if(S(rows[i].id)===S(id))return S(rows[i].name);return def||''}
function valid(rows,id){for(var i=0;i<(rows||[]).length;i++)if(S(rows[i].id)===S(id))return id;return''}
function infoLine(a){return(a||[]).filter(function(v){return!!S(v)}).join(' · ')}
function mainIcon(s,on){var n=({featured:'featured',comic:'comic',anime:'anime',video:'video',lifan:'lifan'})[s]||'featured';return I(n+(on?'':'_off'))}
function extIcon(s,on){var n=({short:'short',community:'community',fiction:'novel',audio:'audio'})[s]||'more';return I(n+(on?'':'_off'))}
function fallbackIcon(kind){return I(({video:'video_off',short:'short_off',comic:'comic_off',fiction:'novel_off',audio:'audio'})[kind]||'more')}
function setSectionUrl(sec){return $('hiker://empty#noLoading#').lazyRule(function(s){putMyVar('acfun_v050_section',s);setItem('acfun_v060_section',s);refreshPage(false);return'hiker://empty'},sec)}
function modalUrl(title,rows,current,key,clearKey,allowAll){
    var opts=[],vals=[];if(allowAll){opts.push('全部');vals.push('')}
    for(var i=0;i<(rows||[]).length;i++){opts.push(S(rows[i].name));vals.push(S(rows[i].id))}
    if(!opts.length)return'toast://当前没有可用分类';var idx=0;for(var j=0;j<vals.length;j++)if(S(vals[j])===S(current)){idx=j;break}
    return'select://'+JSON.stringify({title:title,options:opts,selectedIndex:idx,col:3,js:$.toString(function(os,vs,k,ck){var i=os.indexOf(input);if(i<0)return;var v=vs[i];if(v){putMyVar(k,String(v));setItem('acfun_v060_state_'+k,String(v))}else{clearMyVar(k);setItem('acfun_v060_state_'+k,'')}if(ck){clearMyVar(ck);setItem('acfun_v060_state_'+ck,'')}refreshPage(false)},opts,vals,key,clearKey||'')})
}
function filterBtn(d,label,value,url){d.push({title:label+' · '+(value||'全部')+' ▾',col_type:'scroll_button',url:url,extra:{lineVisible:false}})}
function sectionTitle(d,title,sub){d.push({title:title,desc:sub||'',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}})}
function extra(info){info=info||{};var k=S(info.kind||'video'),x={content_kind:k,content_id:info.id,pageTitle:info.title,lineVisible:false};if(k==='comic'){x.comics_id=info.id;x.comics_title=info.title;x.comics_img=info.img}else if(k==='fiction'||k==='audio'){x.content_kind='fiction';x.fiction_id=info.id;x.fiction_title=info.title;x.fiction_img=info.img;x.fiction_mode=k==='audio'?'audio':'fiction'}else if(k==='dynamic'){x.dynamic_id=info.id;x.dynamic_title=info.title}else{x.video_id=info.id;x.video_title=info.title;x.video_img=info.img;x.video_uri=info.uri;x.video_data=JSON.stringify(info.raw||{})}return x}
function saveSeed(prefix,id,raw){try{setItem(prefix+S(id),JSON.stringify(raw||{}))}catch(e){}}

function top(d){
    d.push({title:'搜索视频、漫画、小说与社区',pic_url:I('search'),img:I('search'),col_type:'text_icon',url:'hiker://page/acfun_search_center?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:'ACFun 全站搜索',lineVisible:false}});
    var cur=ac.__v050Section(),main=[{key:'featured',name:'精选'},{key:'comic',name:'漫画'},{key:'anime',name:'动漫'},{key:'video',name:'视频'},{key:'lifan',name:'里番'}];
    for(var i=0;i<main.length;i++){var x=main[i];d.push({title:x.name,pic_url:mainIcon(x.key,cur===x.key),img:mainIcon(x.key,cur===x.key),col_type:'icon_5',url:setSectionUrl(x.key),extra:{lineVisible:false}})}
    var ext=[{key:'short',name:'短视频'},{key:'community',name:'社区'},{key:'fiction',name:'小说'},{key:'audio',name:'有声'}];for(var j=0;j<ext.length;j++){var y=ext[j];d.push({title:y.name,pic_url:extIcon(y.key,cur===y.key),img:extIcon(y.key,cur===y.key),col_type:'icon_small_4',url:setSectionUrl(y.key),extra:{lineVisible:false}})}
    [{name:'收藏',icon:'favorite_off',page:'acfun_favorites'},{name:'历史',icon:'history_off',page:'acfun_history'},{name:'设置',icon:'settings_off',page:'acfun_settings'}].forEach(function(x){d.push({title:x.name,pic_url:I(x.icon),img:I(x.icon),col_type:'icon_small_3',url:'hiker://page/'+x.page+'?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:x.name,lineVisible:false}})})
}
function sortRows(){var out=[];for(var i=0;i<(ac.__v050Sorts||[]).length;i++)out.push({id:S(ac.__v050Sorts[i].value),name:S(ac.__v050Sorts[i].name)});return out}
function sortName(sec){try{return ac.__v060SortName(sec)}catch(e){return'最新'}}
function resetUrl(sec){return $('hiker://empty#noLoading#').lazyRule(function(s){function c(k){clearMyVar(k);setItem('acfun_v060_state_'+k,'')}if(s==='featured')c('acfun_v050_station_featured');else if(s==='lifan')c('acfun_v050_station_lifan');else if(s==='comic')c('acfun_v050_comic_station');else if(s==='anime'){c('acfun_v050_class_anime');c('acfun_v050_tag_anime')}else if(s==='video'){c('acfun_v050_class_video');c('acfun_v050_tag_video')}else if(s==='community')c('acfun_v060_dynamic_category');else if(s==='fiction')c('acfun_v060_fiction_tag_fiction');else if(s==='audio')c('acfun_v060_fiction_tag_audio');else if(s==='short'){putMyVar('acfun_v050_short_load_type','2');setItem('acfun_v060_state_acfun_v050_short_load_type','2')}c('acfun_v050_sort_'+s);setItem('acfun_v060_sort_'+s,'1');if(s==='community'){putMyVar('acfun_v060_dynamic_sort','hot');setItem('acfun_v060_state_acfun_v060_dynamic_sort','hot')}if(s==='fiction'||s==='audio'){var k='acfun_v060_fiction_sort_'+s;putMyVar(k,'1');setItem('acfun_v060_state_'+k,'1')}refreshPage(false);return'toast://已恢复默认'},sec)}
function inlineFilters(d,s){
    if(s==='featured'||s==='lifan'){
        var r=s==='lifan'?1:0,key=r?'acfun_v050_station_lifan':'acfun_v050_station_featured',rows=ac.__v050Stations(r)||[],cur=valid(rows,state(key,''));if(!cur&&rows.length){cur=S(rows[0].id);save(key,cur)}filterBtn(d,'频道',currentName(rows,cur,'默认'),modalUrl('选择'+nameOf(s)+'频道',rows,cur,key,'',false));var sr=sortRows(),sv=S(ac.__v050Sort(s));filterBtn(d,'排序',sortName(s),modalUrl('选择排序',sr,sv,'acfun_v050_sort_'+s,'',false))
    }else if(s==='comic'){
        var cr=ac.__v050ComicStations()||[],cc=valid(cr,state('acfun_v050_comic_station',''));if(!cc&&cr.length){cc=S(cr[0].id);save('acfun_v050_comic_station',cc)}filterBtn(d,'分类',currentName(cr,cc,'默认'),modalUrl('选择漫画分类',cr,cc,'acfun_v050_comic_station','',false));var csr=sortRows(),csv=S(ac.__v050Sort(s));filterBtn(d,'排序',sortName(s),modalUrl('选择排序',csr,csv,'acfun_v050_sort_'+s,'',false))
    }else if(s==='anime'||s==='video'){
        var ck=s==='video'?'acfun_v050_class_video':'acfun_v050_class_anime',tk=s==='video'?'acfun_v050_tag_video':'acfun_v050_tag_anime',classes=ac.__v050Catalog(s)||[],cv=valid(classes,state(ck,''));if(!cv&&classes.length){cv=S(classes[0].id);save(ck,cv);save(tk,'')}filterBtn(d,'分类',currentName(classes,cv,'默认'),modalUrl('选择'+nameOf(s)+'分类',classes,cv,ck,tk,false));var cls=ac.__v050Class(s),tags=ac.__v050Tags(s,cls)||[],tv=valid(tags,state(tk,''));filterBtn(d,'标签',currentName(tags,tv,'全部'),modalUrl('选择标签',tags,tv,tk,'',true));var vsr=sortRows(),vsv=S(ac.__v050Sort(s));filterBtn(d,'排序',sortName(s),modalUrl('选择排序',vsr,vsv,'acfun_v050_sort_'+s,'',false))
    }else if(s==='short'){
        var tabs=ac.__v050ShortTabs||[],ss=valid(tabs,state('acfun_v050_short_load_type','2'))||'2';filterBtn(d,'短视频',currentName(tabs,ss,'推荐'),modalUrl('选择短视频流',tabs,ss,'acfun_v050_short_load_type','',false))
    }else if(s==='community'){
        var cats=ac.__v060a4CommunityCategories()||[],dc=valid(cats,state('acfun_v060_dynamic_category',''));filterBtn(d,'分类',currentName(cats,dc,'全部'),modalUrl('选择社区分类',cats,dc,'acfun_v060_dynamic_category','',true));var ds=state('acfun_v060_dynamic_sort','hot'),dr=[{id:'hot',name:'热门'},{id:'new',name:'最新'}];filterBtn(d,'排序',ds==='new'?'最新':'热门',modalUrl('社区排序',dr,ds,'acfun_v060_dynamic_sort','',false))
    }else if(s==='fiction'||s==='audio'){
        var tags2=ac.__v060a10FictionTags?ac.__v060a10FictionTags(s):(ac.__v060a4FictionTags(s)||[]),fk='acfun_v060_fiction_tag_'+s,fc=valid(tags2,state(fk,''));filterBtn(d,'分类',currentName(tags2,fc,'全部'),modalUrl('选择'+nameOf(s)+'分类',tags2,fc,fk,'',true));var sk='acfun_v060_fiction_sort_'+s,fs=state(sk,'1'),fr=[{id:'1',name:'最新'},{id:'2',name:'热门'},{id:'3',name:'完结'}];filterBtn(d,'排序',currentName(fr,fs,'最新'),modalUrl('选择排序',fr,fs,sk,'',false))
    }
    d.push({title:'重置',col_type:'scroll_button',url:resetUrl(s),extra:{lineVisible:false}});d.push({col_type:'line'})
}
function videoCard(d,x){var i=ac.itemInfo(x);if(!i.id)return;i.kind='video';var meta=[];if(i.watch)meta.push('▶ '+ac.fmtNum(i.watch));if(i.like)meta.push('♥ '+ac.fmtNum(i.like));if(i.duration)meta.push(i.duration);if(!meta.length&&i.author)meta.push(i.author);var pic=i.img?ac.image(i.img):fallbackIcon('video');d.push({title:i.title||('视频 '+i.id),desc:meta.join('  '),pic_url:pic,img:pic,url:ac.__v060a4Route(i),col_type:'movie_2',extra:extra(i)})}
function shortCard(d,x){var i=ac.itemInfo(x);if(!i.id)return;i.kind='video';var meta=[];if(i.watch)meta.push('▶ '+ac.fmtNum(i.watch));if(i.duration)meta.push(i.duration);var pic=i.img?ac.image(i.img):fallbackIcon('short');d.push({title:i.title||'短视频',desc:meta.join(' · '),pic_url:pic,img:pic,col_type:'movie_3',url:$('hiker://empty').lazyRule(function(id,raw,uri,boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);ACFunBoot.loadOnly();return ac.play(id,raw,uri)}catch(e){return'toast://播放失败：'+String(e.message||e)}},i.id,JSON.stringify(i.raw||{}),i.uri||'',BOOT,BVER),extra:extra(i)})}
function comicCard(d,x){var i=ac.__v060a4ComicInfo(x);if(!i.id)return;i.kind='comic';var pic=i.img?ac.image(i.img):fallbackIcon('comic');d.push({title:i.title,desc:infoLine([i.author,i.desc]),pic_url:pic,img:pic,url:ac.__v060a4Route(i),col_type:'movie_3',extra:extra(i)})}
function fictionCard(d,x,mode){var i=ac.__v060a4FictionInfo(x);if(!i.id)return;i.kind=mode==='audio'?'audio':'fiction';saveSeed('acfun_v060_fiction_seed_',i.id,x);var pic=i.img?ac.image(i.img):fallbackIcon(i.kind);d.push({title:i.title,desc:infoLine([i.author,i.status]),pic_url:pic,img:pic,url:'hiker://page/acfun_detail?rule=ACFun&simple=true&content_kind=fiction&fiction_id='+encodeURIComponent(i.id)+'&fiction_title='+encodeURIComponent(i.title)+'&fiction_mode='+encodeURIComponent(mode)+'#noRecordHistory#',col_type:'movie_3',extra:extra(i)})}
function dynamicCard(d,x){var i=ac.__v060a4DynamicInfo(x);if(!i.id)return;i.kind='dynamic';saveSeed('acfun_v060_dynamic_seed_',i.id,x);var t=i.content||i.title||'社区动态';if(t.length>60)t=t.slice(0,60)+'…';var meta=[];if(i.author)meta.push(i.author);if(i.comment)meta.push('评论 '+ac.fmtNum(i.comment));if(i.time)meta.push(i.time);var pic=i.img?ac.image(i.img):'';d.push({title:t,desc:meta.join(' · '),pic_url:pic,img:pic,url:ac.__v060a4Route(i),col_type:pic?'movie_1_left_pic':'text_1',extra:extra(i)})}

ac.home=function(){
    var d=[],p=P(),s=ac.__v050Section();if(p===1){top(d);inlineFilters(d,s);sectionTitle(d,nameOf(s),s==='short'?'点击卡片直接播放':'')}
    var list=[];try{if(s==='featured')list=ac.__v050StationList(p,0);else if(s==='lifan')list=ac.__v050StationList(p,1);else if(s==='comic')list=ac.__v050ComicList(p);else if(s==='short')list=ac.__v050ShortList(p);else if(s==='community')list=ac.__v060a4DynamicList(p);else if(s==='fiction'||s==='audio')list=ac.__v060a4FictionList(p,s);else list=ac.__v050CatalogList(p,s)}catch(e){try{setItem('acfun_v060_a10_home_error',S(e.message||e))}catch(e0){}}
    if(s==='comic')for(var i=0;i<list.length;i++)comicCard(d,list[i]);else if(s==='short')for(var j=0;j<list.length;j++)shortCard(d,list[j]);else if(s==='community')for(var k=0;k<list.length;k++)dynamicCard(d,list[k]);else if(s==='fiction'||s==='audio')for(var f=0;f<list.length;f++)fictionCard(d,list[f],s);else for(var q=0;q<list.length;q++)videoCard(d,list[q]);
    if(!list.length&&p===1)d.push({title:'当前条件暂时没有内容',desc:'可以直接点击上方分类或排序切换，选择后当前页面立即刷新。',col_type:'long_text',url:'hiker://empty'});setResult(d)
};
ac.categoryCenter=function(){setPageTitle('筛选');setResult([{title:'筛选已经整合在 ACFun 首页',desc:'频道、分类、标签和排序都通过当前页弹层选择，选中后原页即时刷新，不再进入独立筛选页面。',col_type:'long_text',url:'hiker://home@ACFun'}])};
ac.build='2026.08.22-v0.6.0-alpha10';ac.runtimeMode='test-ui-v060-alpha10-recovery';try{setItem('acfun_v060_ui_a10','same-page filters + recovered covers + fiction/audio mode tags')}catch(e){}
})();