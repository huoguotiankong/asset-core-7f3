/** ACFun 0.6.0-alpha16 / Build 167
 * Focused repair on top of Alpha15 Clean Rebase.
 * Scope ONLY: video cover fallback, current playback bridge, short feed recovery,
 * comic chapter reader/fullTheme route, diagnostics. Fiction/audio list stays untouched.
 */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var PREV_DETAIL=ac.detail;
var BOOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v072.js?v=7200',BVER=7200;
function S(v){return String(v===undefined||v===null?'':v)}
function N(v){var s=S(v);return /^\d+$/.test(s)?Number(s):s}
function param(k){try{return S(getParam(k,''))}catch(e){return''}}
function pick(o,ks,d){try{return ac.pick(o||{},ks,d)}catch(e){return d}}
function first(v){try{return ac.__v042FirstMedia?S(ac.__v042FirstMedia(v)||''):S(ac.__v043FirstString?ac.__v043FirstString(v)||'':v)}catch(e){return S(v)}}
function merge(a,b){var x={},k;for(k in(a||{}))x[k]=a[k];for(k in(b||{}))if(b[k]!==undefined&&b[k]!==null&&b[k]!=='')x[k]=b[k];return x}
function esc(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}
function headers(){try{return ac.__v045PlayerHeaders?ac.__v045PlayerHeaders():(ac.__v043PlayerHeaders?ac.__v043PlayerHeaders():{'User-Agent':ac.ua||'Mozilla/5.0'})}catch(e){return{'User-Agent':ac.ua||'Mozilla/5.0'}}}
function oneMedia(v){var s=first(v);if(!s&&v&&typeof v==='object')try{s=first(ac.deepFind(v,['url','src','path','value'],0))}catch(e){}return S(s)}

// ---------- 1) Video cover: fallback-only, never override a valid Stable image ----------
var COVER_KEYS=['coverImg','videoCover','videoCoverImg','generatedCoverImg','templateCoverImg','defaultVideoPoster','coverUrl','horizontalCover','verticalCover','poster','imageUrl','imgUrl'];
ac.__v060a16VideoInfo=function(x){
    var info=ac.itemInfo(x||{})||{};
    if(info.img)return info;
    var v=(x&&((x.video&&typeof x.video==='object'&&x.video)||(x.videoInfo&&typeof x.videoInfo==='object'&&x.videoInfo)||(x.content&&typeof x.content==='object'&&x.content)))||x||{},img='';
    for(var i=0;i<COVER_KEYS.length&&!img;i++)if(v&&v[COVER_KEYS[i]]!==undefined)img=oneMedia(v[COVER_KEYS[i]]);
    for(var j=0;j<COVER_KEYS.length&&!img;j++)if(x&&x[COVER_KEYS[j]]!==undefined)img=oneMedia(x[COVER_KEYS[j]]);
    if(!img)try{img=oneMedia(ac.deepFind(x||{},COVER_KEYS,0))}catch(e){}
    if(img)info.img=img;
    try{if(!getItem('acfun_a16_video_cover_raw',''))setItem('acfun_a16_video_cover_raw',S(img||''))}catch(e2){}
    return info
};
ac.addVideoCard=function(d,x,col){
    var info=ac.__v060a16VideoInfo(x),desc=[];if(!info||!info.id)return;
    if(info.author)desc.push(info.author);if(info.watch)desc.push('▶ '+ac.fmtNum(info.watch));if(info.like)desc.push('♥ '+ac.fmtNum(info.like));if(info.duration)desc.push(info.duration);
    var pic=info.img?ac.image(info.img):'';
    try{if(info.img)setItem('acfun_a16_video_cover_raw',S(info.img));if(pic)setItem('acfun_a16_video_cover_rendered',S(pic).slice(0,1200))}catch(e){}
    d.push({title:info.title,desc:desc.join('  '),pic_url:pic,img:pic,col_type:col||'movie_2',url:'hiker://page/acfun_detail?rule=ACFun&simple=true#noRecordHistory#',extra:{inheritTitle:false,pageTitle:info.title,content_kind:'video',video_id:info.id,video_title:info.title,video_img:info.img,video_uri:info.uri,video_data:JSON.stringify(info.raw||x||{}),lineVisible:false,longClick:[{title:'加入本地收藏',js:$.toString(function(vid,title,img,uri,raw,boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);ACFunBoot.loadOnly();if(ac.isFavorite&&ac.isFavorite(String(vid))){ac.removeFavorite(String(vid));return'toast://已取消收藏'}var l=ac.favoriteList?ac.favoriteList():[];if(ac.upsert)l=ac.upsert(l,{id:String(vid),title:String(title),img:String(img),uri:String(uri),data:String(raw)});if(ac.saveList)ac.saveList('acfun_favs',l,500);return'toast://已收藏'}catch(e){return'toast://收藏失败：'+String(e.message||e)}},info.id,info.title,info.img,info.uri||'',JSON.stringify(info.raw||x||{}),BOOT,BVER)},{title:'复制标题',js:$.toString(function(t){return'copy://'+String(t)},info.title)}]}})
};

// ---------- 2) Current PlaybackAdapter: direct path -> GET watch -> POST fallback -> decode/cache ----------
function deepMediaPath(obj){
    var keys=['videoUrl','playUrl','videoUri','m3u8Url','m3u8','playPath','sourcePath','path','url'],v='';
    for(var i=0;i<keys.length&&!v;i++)try{v=first(obj&&obj[keys[i]])}catch(e){}
    if(!v)try{v=first(ac.deepFind(obj||{},keys,0))}catch(e2){}
    return S(v)
}
function watchGet(id){try{return ac.__v043Api('video/can/watch',{videoId:N(id)},{timeout:1500,maxAttempts:1})}catch(e){try{setItem('acfun_a16_watch_get_error',S(e.message||e))}catch(e0){}return null}}
function watchPost(id){try{return ac.__v043Api('video/can/watch',{videoId:N(id)},{method:'POST',write:true,allowGet:false,timeout:1500,maxAttempts:1})}catch(e){try{setItem('acfun_a16_watch_post_error',S(e.message||e))}catch(e0){}return null}}
ac.__v060a16Play=function(id,raw,direct){
    id=S(id);var obj=ac.safeJson(raw)||{},path=first(direct)||deepMediaPath(obj),used=path?'seed':'',wg='',wp='',decode='',url='',cacheErr='';
    if(!path&&id){var g=watchGet(id);path=deepMediaPath(g)||first(g&&g.path!==undefined?g.path:g);if(path)used='watch-get';else wg=S(getItem('acfun_a16_watch_get_error',''))}
    if(!path&&id){var p=watchPost(id);path=deepMediaPath(p)||first(p&&p.path!==undefined?p.path:p);if(path)used='watch-post';else wp=S(getItem('acfun_a16_watch_post_error',''))}
    try{decode=ac.__v043DecodePlayUrl?S(ac.__v043DecodePlayUrl(path)||''):S(path)}catch(e){decode=S(path)}
    if(!decode){try{setItem('acfun_a16_play_probe',JSON.stringify({id:id,used:used,path:path,watchGet:wg,watchPost:wp,decode:''}))}catch(e0){}return'toast://未获取到可播放地址'}
    var h=headers(),isHls=/\.m3u8(?:[?#]|$)/i.test(decode)||/\/m3u8\//i.test(decode)||decode.indexOf('#isM3u8#')>=0;
    if(isHls){try{url=S(cacheM3u8(decode+(decode.indexOf('#isM3u8#')>=0?'':'#isM3u8#'),{headers:h,timeout:4200},'acfun_a16_'+(id||'video')+'.m3u8')||'')}catch(e1){cacheErr=S(e1.message||e1);url=decode}}else url=decode;
    if(!url)url=decode;
    var ret={urls:[url],names:['播放'],headers:[h]};
    try{var dm=ac.__v045CachedDanmu?ac.__v045CachedDanmu(id):'';if(dm)ret.danmu=dm}catch(e2){}
    try{setItem('acfun_a16_play_probe',JSON.stringify({id:id,used:used,path:path,decode:decode,url:url,watchGet:wg,watchPost:wp,cacheErr:cacheErr}));setItem('acfun_a16_play_final',url.slice(0,1000))}catch(e3){}
    return JSON.stringify(ret)
};
function playLazy(info,obj){return $('hiker://empty#noLoading#').lazyRule(function(vid,raw,uri,title,img,boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);ACFunBoot.loadOnly();try{if(ac.addHistory)ac.addHistory({id:String(vid),title:String(title),img:String(img),uri:String(uri||''),data:String(raw)})}catch(e0){}return ac.__v060a16Play(String(vid),String(raw),String(uri||''))}catch(e){return'toast://播放失败：'+String(e.message||e)}},S(info.id),JSON.stringify(obj||{}),S(info.uri||''),S(info.title),S(info.img),BOOT,BVER)}

// ---------- 3) Video detail: one true playback item; favorite/comment never enter player playlist ----------
function videoDetail(){
    var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},id=S(p.video_id||param('video_id')||param('id')),obj=ac.safeJson(p.video_data)||{};
    if(p.video_title&&!obj.videoTitle&&!obj.title)obj.videoTitle=p.video_title;if(p.video_img&&!obj.coverImg&&!obj.videoCover)obj.coverImg=[p.video_img];if(p.video_uri&&!obj.videoUrl&&!obj.videoUri)obj.videoUrl=p.video_uri;if(id&&!obj.videoId&&!obj.id)obj.videoId=id;
    try{var c=ac.__v042Read?ac.__v042Read('detail|'+id,1800,86400):{hit:false,data:null};if(c.hit&&c.data&&typeof c.data==='object')obj=merge(obj,c.data)}catch(e){}
    var info=ac.__v060a16VideoInfo(obj);if(!info.id)info.id=id;if(!info.title||info.title==='未命名')info.title=S(p.video_title||'视频详情');if(!info.img&&p.video_img)info.img=p.video_img;if(!info.uri&&p.video_uri)info.uri=p.video_uri;
    if(id&&(!info.img||!deepMediaPath(obj)))try{var full=ac.getDetail?ac.getDetail(id,obj):null;if(full&&typeof full==='object'){obj=merge(obj,full);info=ac.__v060a16VideoInfo(obj);if(ac.__v042Write)ac.__v042Write('detail|'+id,obj)}}catch(e2){try{setItem('acfun_a16_detail_error',S(e2.message||e2))}catch(e3){}}
    var pic=info.img?ac.image(info.img):'',meta=[];if(info.author)meta.push(info.author);if(info.watch)meta.push('播放 '+ac.fmtNum(info.watch));if(info.like)meta.push('点赞 '+ac.fmtNum(info.like));if(info.duration)meta.push(info.duration);setPageTitle(info.title);try{if(pic)setPagePicUrl(pic)}catch(e4){}
    var d=[];d.push({title:info.title,desc:meta.join(' · '),pic_url:pic,img:pic,col_type:pic?'movie_1_left_pic':'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    d.push({title:'▶ 播放',desc:'只向播放器提交真实媒体线路',col_type:'text_1',url:playLazy(info,obj),extra:{lineVisible:false}});
    d.push({title:(ac.isFavorite&&ac.isFavorite(info.id))?'★ 已收藏':'☆ 收藏',col_type:'scroll_button',url:$('hiker://empty#noLoading#').lazyRule(function(vid,title,img,uri,raw,boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);ACFunBoot.loadOnly();if(ac.isFavorite&&ac.isFavorite(String(vid))){ac.removeFavorite(String(vid));refreshPage(false);return'toast://已取消收藏'}var l=ac.favoriteList?ac.favoriteList():[];if(ac.upsert)l=ac.upsert(l,{id:String(vid),title:String(title),img:String(img),uri:String(uri),data:String(raw)});if(ac.saveList)ac.saveList('acfun_favs',l,500);refreshPage(false);return'toast://已收藏'}catch(e){return'toast://收藏失败：'+String(e.message||e)}},info.id,info.title,info.img,info.uri||'',JSON.stringify(obj||{}),BOOT,BVER),extra:{lineVisible:false}});
    d.push({title:'评论',col_type:'scroll_button',url:'hiker://page/acfun_comments?rule=ACFun&simple=true&video_id='+encodeURIComponent(info.id)+'&video_title='+encodeURIComponent(info.title)+'#noRecordHistory#',extra:{lineVisible:false,video_id:info.id,video_title:info.title}});
    d.push({title:'复制标题',col_type:'scroll_button',url:'copy://'+info.title,extra:{lineVisible:false}});
    var intro=pick(obj,['description','desc','introduction','videoDesc'],'');if(intro&&typeof intro!=='object'){d.push({col_type:'line'});d.push({title:esc(intro),col_type:'rich_text',url:'hiker://empty',extra:{textSize:14,lineVisible:false}})}setResult(d)
}

// ---------- 4) Short feed: restore device-proven loadType=2, then limited fallbacks ----------
try{if(!getItem('acfun_a16_short_migrated','')){putMyVar('acfun_short_load_type','2');setItem('acfun_a16_short_migrated','1')}}catch(e){}
ac.__v047ShortList=function(page){
    page=Number(page||1);var current=S(getMyVar('acfun_short_load_type','2')||'2'),modes=[current,'2','3','4','1'],seen={},size=30,errs=[];
    for(var i=0;i<modes.length;i++){
        var m=S(modes[i]);if(seen[m])continue;seen[m]=1;var variants=[{page:page,pageNum:page,pageSize:size,limit:size,loadType:N(m)},{page:page,pageNum:page,pageSize:size,limit:size,loadType:N(m),videoContentType:'shortVideo',contentType:'shortVideo',videoType:'shortVideo'}];
        for(var j=0;j<variants.length;j++)try{var raw=ac.__v043Api('video/list',variants[j],{timeout:1600,maxAttempts:1}),list=ac.flattenVideos?ac.flattenVideos(raw):(ac.__v047Arr?ac.__v047Arr(raw):[]);if(!list.length&&ac.__v047Arr)list=ac.__v047Arr(raw);if(list.length){try{setItem('acfun_a16_short_probe','loadType='+m+' variant='+j+' count='+list.length)}catch(e0){}return list}}catch(e){errs.push('m'+m+'v'+j+':'+S(e.message||e))}
    }
    try{setItem('acfun_a16_short_probe','empty '+errs.slice(0,4).join(' | '))}catch(e1){}return[]
};

// ---------- 5) Comic chapter: exact Alpha12 contract + fullTheme, no extra content ----------
function parseMaybe(v){if(typeof v!=='string')return v;var s=S(v).trim();if(!s)return v;try{if((s.charAt(0)==='['&&s.charAt(s.length-1)===']')||(s.charAt(0)==='{'&&s.charAt(s.length-1)==='}'))return JSON.parse(s)}catch(e){}return v}
function comicImages(root){
    var out=[],seen={},domain='';try{domain=S(ac.deepFind(root,['domain','imgDomain','imageDomain'],0)||'')}catch(e){}
    function add(v){v=parseMaybe(v);if(Array.isArray(v)){for(var i=0;i<v.length;i++)add(v[i]);return}if(v&&typeof v==='object'){var p=pick(v,['imgUrl','imageUrl','url','path','src','value'],'');if(p!==undefined&&p!==null&&p!==''){add(p);return}for(var k in v)if(/img|image|pic|page/i.test(k)&&!/domain|host/i.test(k))add(v[k]);return}var u=S(v).trim();if(!u)return;if(u.indexOf('//')===0)u='https:'+u;else if(!/^https?:\/\//i.test(u)&&domain)u=domain.replace(/\/+$/,'')+'/'+u.replace(/^\/+/, '');if(!/^https?:\/\//i.test(u))return;if(!seen[u]){seen[u]=1;out.push(u)}}
    var keys=['imgList','imageList','chapterImgList','images','pageList','pics','pictures'];for(var i=0;i<keys.length;i++)try{var v=ac.deepFind(root,[keys[i]],0);if(v!==undefined&&v!==null)add(v)}catch(e2){}
    return out
}
function comicChapter(cid,ch){
    var tries=[{p:{chapterId:N(ch)},m:'GET',tag:'chapterId-GET'},{p:{chapterId:N(ch)},m:'POST',tag:'chapterId-POST'},{p:{comicsId:N(cid),chapterId:N(ch)},m:'GET',tag:'comicsId-GET'}],best={};
    for(var i=0;i<tries.length;i++)try{var o=ac.__v043Api('comics/base/chapterInfo',tries[i].p,tries[i].m==='POST'?{method:'POST',write:true,allowGet:false,timeout:1800,maxAttempts:1}:{timeout:1800,maxAttempts:1});if(o&&typeof o==='object'){best=o;var imgs=comicImages(o),cw=pick(o,['canWatch'],'');if(imgs.length||cw===false){try{setItem('acfun_a16_comic_probe',tries[i].tag+' images='+imgs.length+' canWatch='+S(cw))}catch(e0){}return o}}}catch(e){try{setItem('acfun_a16_comic_error',tries[i].tag+': '+S(e.message||e))}catch(e1){}}
    return best
}
ac.__v047ComicUrl=function(){return'hiker://page/acfun_detail?rule=ACFun&simple=true#fullTheme##noRecordHistory#'};
function comicReader(cid,ch,ct){var obj=comicChapter(cid,ch),imgs=comicImages(obj),d=[];try{if(typeof setPageTitle==='function')setPageTitle(ct||'')}catch(e){}if(pick(obj,['canWatch'],'')===false){setResult([{title:'当前章节暂不可阅读',desc:S(pick(obj,['info','message'],'需要权限或购买')),col_type:'long_text',url:'hiker://empty'}]);return}for(var i=0;i<imgs.length;i++){var u=ac.image?ac.image(imgs[i]):imgs[i];if(u)d.push({title:'',pic_url:u,img:u,col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}})}if(!d.length)d.push({title:'本章未解析到图片',desc:'漫画探针：'+S(getItem('acfun_a16_comic_probe','暂无'))+'\n'+S(getItem('acfun_a16_comic_error','')),col_type:'long_text',url:'hiker://empty'});setResult(d)}

ac.detail=function(){var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},kind=S(p.content_kind||param('content_kind')||'');var ch=S(p.comic_chapter_id||param('comic_chapter_id'));if(ch)return comicReader(S(p.comics_id||param('comics_id')),ch,S(p.comic_chapter_title||param('comic_chapter_title')||''));if(kind==='video'||p.video_id||param('video_id'))return videoDetail();return typeof PREV_DETAIL==='function'?PREV_DETAIL.call(ac):undefined};

// ---------- 6) Diagnostics only; do not touch fiction/audio adapters ----------
ac.diag=function(){var d=[];setPageTitle('ACFun 资源诊断');d.push({title:'Alpha16 媒体诊断',desc:'视频封面原始：'+S(getItem('acfun_a16_video_cover_raw','暂无')).slice(0,700)+'\n视频封面渲染：'+S(getItem('acfun_a16_video_cover_rendered','暂无')).slice(0,900)+'\n播放：'+S(getItem('acfun_a16_play_probe','暂无')).slice(0,1200)+'\n短视频：'+S(getItem('acfun_a16_short_probe','暂无')).slice(0,700)+'\n漫画：'+S(getItem('acfun_a16_comic_probe','暂无'))+'\n漫画错误：'+S(getItem('acfun_a16_comic_error','')),col_type:'long_text',url:'hiker://empty'});d.push({title:'复制 Alpha16 诊断',col_type:'text_1',url:'copy://ACFun 2026.08.23-v0.6.0-alpha16 | cover='+S(getItem('acfun_a16_video_cover_raw','none')).slice(0,160)+' | play='+S(getItem('acfun_a16_play_probe','none')).slice(0,260)+' | short='+S(getItem('acfun_a16_short_probe','none')).slice(0,180)+' | comic='+S(getItem('acfun_a16_comic_probe','none')).slice(0,180)});setResult(d)};

ac.play=ac.__v060a16Play;
ac.build='2026.08.23-v0.6.0-alpha16';ac.runtimeMode='clean-rebase-a15+a16-media';try{setItem('acfun_test_runtime','0.6.0-alpha16 focused media repair')}catch(e){}
})();
