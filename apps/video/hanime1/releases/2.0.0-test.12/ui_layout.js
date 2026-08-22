/* Hanime1 Test12 per-page cover layout */
var HanimeLayout12=(function(H){
var KEYS={home:'hanime12_layout_home',library:'hanime12_layout_library',search:'hanime12_layout_search',results:'hanime12_layout_results',related:'hanime12_layout_related',comicHome:'hanime12_layout_comic_home',comicList:'hanime12_layout_comic_list'};
var DEFAULTS={home:'movie_3_marquee',library:'movie_3_marquee',search:'movie_2',results:'movie_3_marquee',related:'movie_3_marquee',comicHome:'movie_3_marquee',comicList:'movie_3_marquee'};
var OPTIONS=[['三列海报','movie_3_marquee'],['两列大图','movie_2'],['单列图文','movie_1_vertical_pic']];
function key(area){return KEYS[area]||KEYS.home;}
function get(area){return getItem(key(area),DEFAULTS[area]||'movie_3_marquee');}
function name(area){var v=get(area);for(var i=0;i<OPTIONS.length;i++)if(OPTIONS[i][1]===v)return OPTIONS[i][0];return v;}
function setUrl(area,val){return $('#noLoading#').lazyRule(function(k,v){setItem(k,v);refreshPage(false);return 'hiker://empty';},key(area),String(val));}
function video(x,area){return {title:x.title||'未命名',desc:[x.duration,x.views,x.rating,x.artist,x.upload].filter(Boolean).join(' · '),pic_url:x.img||x.cover||'',url:H.route('hanimeDetail',{id:x.id,title:x.title}),col_type:get(area),extra:{lineVisible:false}};}
function comic(x,area){return {title:x.title||'漫画',desc:x.meta||'',pic_url:x.img||x.cover||'',url:H.route('hanimeComicDetail',{id:x.id,title:x.title}),col_type:get(area),extra:{lineVisible:false}};}
function resetUrl(){return $('#noLoading#').lazyRule(function(){var a=['home','library','search','results','related','comic_home','comic_list'];for(var i=0;i<a.length;i++)clearItem('hanime12_layout_'+a[i]);refreshPage(false);return 'toast://已恢复默认排版';});}
return {keys:KEYS,defaults:DEFAULTS,options:OPTIONS,get:get,name:name,setUrl:setUrl,video:video,comic:comic,resetUrl:resetUrl};
})(HanimeUI9);
