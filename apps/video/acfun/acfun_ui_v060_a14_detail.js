/** ACFun 0.6.0-alpha14 / Build 165
 * Recovery detail layer based on Alpha12 device facts.
 * - video detail preserves feed seed media and enters current Bootstrap on click
 * - comic reader keeps device-proven pic_1_full + ac.image decoder, page uses #fullTheme#
 * - audio actions enter current Bootstrap and use minimal music output
 */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var prevDetail=ac.detail,prevRoute=ac.__v060a4Route;
var BOOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v070.js?v=7000',BVER=7000;
var BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';
function S(v){return String(v===undefined||v===null?'':v)}
function N(v){var s=S(v);return /^\d+$/.test(s)?Number(s):s}
function E(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function I(n){return BASE+n+'.svg'}
function param(k){try{return S(getParam(k,''))}catch(e){return''}}
function pick(o,ks,d){try{return ac.pick(o||{},ks,d)}catch(e){return d}}
function merge(a,b){var x={},k;for(k in(a||{}))x[k]=a[k];for(k in(b||{}))if(b[k]!==undefined&&b[k]!==null&&b[k]!=='')x[k]=b[k];return x}
function seed(prefix,id){try{return JSON.parse(getItem(prefix+S(id),'{}'))||{}}catch(e){return{}}}
function saveSeed(prefix,id,o){try{setItem(prefix+S(id),JSON.stringify(o||{}))}catch(e){}}
function paragraph(v){var s=S(v).replace(/\r/g,'').replace(/\n{3,}/g,'\n\n').trim();if(!s)return'';return E(s).replace(/\n/g,'<br>')}
function infoLine(a){return(a||[]).filter(function(v){return!!S(v)}).join(' · ')}
function fictionMode(obj,fallback){if(fallback==='audio')return'audio';var t=S(pick(obj,['fictionType','type'],'')||''),la=pick(obj,['longFormAudio','isAudio'],'');if(t==='2'||t.toLowerCase()==='audio'||la===true||la===1||S(la)==='1')return'audio';return'fiction'}
function mergeUrls(a,b){var out=[],seen={},all=(a||[]).concat(b||[]);for(var i=0;i<all.length;i++){var u=S(all[i]).trim();if(u&&!seen[u]){seen[u]=1;out.push(u)}}return out}

function comicPageUrl(info){
    info=info||{};var cid=S(info.comicsId||info.comicId||info.contentId||info.id||''),ch=S(info.chapterId||''),ct=S(info.title||'漫画阅读');
    return'hiker://page/acfun_detail?rule=ACFun&simple=true&content_kind=comic_chapter&comics_id='+encodeURIComponent(cid)+'&comic_chapter_id='+encodeURIComponent(ch)+'&comic_chapter_title='+encodeURIComponent(ct)+'#fullTheme##noRecordHistory#'
}
ac.__v060a4Route=function(info){info=info||{};if(S(info.kind)==='comic_chapter')return comicPageUrl(info);return typeof prevRoute==='function'?prevRoute.call(ac,info):'hiker://empty'};
ac.__v060DetailUrl=ac.__v060a4Route;ac.detailUrl=function(info){return ac.__v060a4Route(info)};

function currentPlay(info,obj){return $('hiker://empty#noLoading#').lazyRule(function(vid,raw,uri,boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);ACFunBoot.loadOnly();try{ac.addHistory({id:String(vid),title:String(MY_PARAMS.video_title||''),img:String(MY_PARAMS.video_img||''),uri:String(uri||''),data:String(raw)})}catch(e0){}return ac.play(String(vid),String(raw),String(uri||''))}catch(e){return'toast://播放失败：'+String(e.message||e)}},S(info.id),JSON.stringify(obj||{}),S(info.uri||''),BOOT,BVER)}
function favJs(info,obj){return $.toString(function(vid,title,img,uri,raw,boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);ACFunBoot.loadOnly();if(ac.isFavorite&&ac.isFavorite(String(vid))){ac.removeFavorite(String(vid));return'toast://已取消收藏'}var l=ac.favoriteList?ac.favoriteList():[];if(ac.upsert)l=ac.upsert(l,{id:String(vid),title:String(title),img:String(img),uri:String(uri),data:String(raw)});if(ac.saveList)ac.saveList('acfun_favs',l,500);return'toast://已收藏'}catch(e){return'toast://收藏失败：'+String(e.message||e)}},S(info.id),S(info.title),S(info.img),S(info.uri||''),JSON.stringify(obj||{}),BOOT,BVER)}
function videoDetail(){
    var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},id=S(p.video_id||param('video_id')||p.content_id||param('content_id')||param('id')),seedObj=ac.safeJson(p.video_data)||{},pt=S(p.video_title||param('video_title')),pi=S(p.video_img||param('video_img')),pu=S(p.video_uri||param('video_uri'));
    if(pt&&!seedObj.title&&!seedObj.videoTitle)seedObj.title=pt;if(pi&&!seedObj.coverImg&&!seedObj.videoCover)seedObj.coverImg=[pi];if(pu&&!seedObj.videoUrl&&!seedObj.videoUri)seedObj.videoUrl=pu;if(id&&!seedObj.videoId&&!seedObj.id)seedObj.videoId=id;
    var obj=seedObj;
    try{var c=ac.__v042Read?ac.__v042Read('detail|'+id,1800,86400):{hit:false,data:null};if(c.hit&&c.data&&typeof c.data==='object')obj=merge(obj,c.data)}catch(e){}
    var info=ac.itemInfo(obj);if(!info.id)info.id=id;if((!info.title||info.title==='未命名')&&pt)info.title=pt;if(!info.img&&pi)info.img=pi;if(!info.uri&&pu)info.uri=pu;
    if(id&&(!info.title||info.title==='未命名'||!info.img))try{var full=ac.getDetail?ac.getDetail(id,seedObj):null;if(full&&typeof full==='object'){obj=merge(obj,full);info=ac.itemInfo(obj);if(ac.__v042Write)ac.__v042Write('detail|'+id,obj)}}catch(e2){try{setItem('acfun_v060_a14_detail_error',S(e2.message||e2))}catch(e3){}}
    if(!info.id){setPageTitle('视频详情');setResult([{title:'没有拿到视频标识',desc:'请返回列表重新进入。',col_type:'long_text',url:'hiker://empty'}]);return}
    if(!info.title||info.title==='未命名')info.title='视频 '+info.id;if(!info.img&&pi)info.img=pi;if(!info.uri&&pu)info.uri=pu;
    var pic=info.img?ac.image(info.img):'',meta=[];if(info.author)meta.push(info.author);if(info.watch)meta.push('播放 '+ac.fmtNum(info.watch));if(info.like)meta.push('点赞 '+ac.fmtNum(info.like));if(info.duration)meta.push(info.duration);var play=currentPlay(info,obj),d=[];setPageTitle(info.title);try{if(pic)setPagePicUrl(pic)}catch(e4){}
    var longClick=[{title:(ac.isFavorite&&ac.isFavorite(info.id))?'取消收藏':'收藏',js:favJs(info,obj)},{title:'评论',js:$.toString(function(vid,title){return'hiker://page/acfun_comments?rule=ACFun&simple=true&video_id='+encodeURIComponent(String(vid))+'&video_title='+encodeURIComponent(String(title))+'#noRecordHistory#'},info.id,info.title)},{title:'复制标题',js:$.toString(function(t){return'copy://'+String(t)},info.title)}];
    if(pic)d.push({title:info.title,desc:infoLine(meta),pic_url:pic,img:pic,col_type:'movie_1_left_pic',url:play,extra:{lineVisible:false,longClick:longClick}});else d.push({title:'▶ '+info.title,desc:infoLine(meta),col_type:'text_1',url:play,extra:{lineVisible:false,longClick:longClick}});
    var intro=pick(obj,['description','desc','introduction','videoDesc'],'');if(intro&&typeof intro!=='object'){d.push({col_type:'line'});d.push({title:paragraph(intro),col_type:'rich_text',url:'hiker://empty',extra:{textSize:14,lineVisible:false}})}
    var tags=pick(obj,['videoTags','tags','tagList'],[]);if(!Array.isArray(tags)&&obj.video)tags=pick(obj.video,['videoTags','tags','tagList'],[]);var names=[];if(Array.isArray(tags))for(var i=0;i<tags.length&&names.length<12;i++){var n=ac.__v042TagName?ac.__v042TagName(tags[i]):S(tags[i]&&tags[i].name||tags[i]);if(n&&names.indexOf(n)<0)names.push(n)}if(names.length)d.push({title:names.join(' · '),col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});setResult(d)
}

function comicReader(){
    var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},cid=S(p.comics_id||param('comics_id')||p.content_id||param('content_id')),ch=S(p.comic_chapter_id||param('comic_chapter_id')),ct=S(p.comic_chapter_title||param('comic_chapter_title')||'漫画阅读'),obj=ac.__v060a12ComicChapter?ac.__v060a12ComicChapter(cid,ch):{},imgs=ac.__v060a12ComicImages?ac.__v060a12ComicImages(obj):[],d=[];setPageTitle(ct);
    for(var i=0;i<imgs.length;i++){var u=ac.image?ac.image(imgs[i]):imgs[i];if(u)d.push({title:'',pic_url:u,img:u,col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}})}
    try{setItem('acfun_v060_a14_comic_probe',JSON.stringify({cid:cid,ch:ch,images:d.length,mode:'fullTheme-pic_1_full'}))}catch(e){}
    if(!d.length)d.push({title:'本章没有返回可阅读图片',desc:'漫画诊断：'+getItem('acfun_v060_a12_comic_probe','暂无'),col_type:'long_text',url:'hiker://empty'});setResult(d)
}

function chapterUrl(fid,cid,ct){return'hiker://page/acfun_detail?rule=ACFun&simple=true&content_kind=fiction_chapter&fiction_id='+encodeURIComponent(S(fid))+'&fiction_chapter_id='+encodeURIComponent(S(cid))+'&fiction_chapter_title='+encodeURIComponent(S(ct))+'&fiction_mode=audio#noRecordHistory#'}
function musicLazy(urls,id){return $('hiker://empty#noLoading#').lazyRule(function(listJson,mid,boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);ACFunBoot.loadOnly();var a=[];try{a=JSON.parse(listJson)||[]}catch(e){}return ac.__v060a14AudioPlayer?ac.__v060a14AudioPlayer(a,mid):'toast://音频播放器未加载'}catch(e2){return'toast://音频播放失败：'+String(e2.message||e2)}},JSON.stringify(urls||[]),S(id),BOOT,BVER)}
function audioCandidates(obj,payload){var a=[],b=[];try{a=ac.__v060a14AudioCandidates?ac.__v060a14AudioCandidates(obj):[]}catch(e){}if(payload&&payload.audios)b=payload.audios;return mergeUrls(a,b)}
function audioDetail(id){
    var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},seedObj=seed('acfun_v060_fiction_seed_',id),apiObj=ac.__v060a10FictionDetail?ac.__v060a10FictionDetail(id):{},obj=merge(seedObj,apiObj),info=ac.__v060a4FictionInfo(obj);if(!info.id)info.id=id;if(!info.title||info.title==='未命名小说')info.title=S(p.fiction_title||param('fiction_title')||pick(seedObj,['fictionTitle','title'],'有声详情'));setPageTitle(info.title);
    var d=[],pic=info.img?ac.image(info.img):I('audio');try{if(info.img)setPagePicUrl(pic)}catch(e){}d.push({title:info.title,desc:infoLine([info.author,info.status]),pic_url:pic,img:pic,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});if(info.desc)d.push({title:paragraph(info.desc),col_type:'rich_text',url:'hiker://empty',extra:{textSize:14,lineVisible:false}});
    var work=ac.__v060a10ChapterPayload?ac.__v060a10ChapterPayload(obj,'audio'):{audios:[]},aud=audioCandidates(obj,work);if(aud.length)d.push({title:'▶ 播放作品音频',desc:aud.length>1?'含备用线路':'',pic_url:I('audio'),img:I('audio'),col_type:'text_icon',url:musicLazy(aud,'work_'+info.id),extra:{lineVisible:false}});
    var chapters=ac.__v060a10ChapterRows?ac.__v060a10ChapterRows(obj):[];d.push({col_type:'line'});d.push({title:'章节目录',desc:chapters.length+' 章',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});for(var i=0;i<chapters.length;i++){var x=chapters[i]||{},cid=S(x.id),ct=S(x.title||('第 '+(i+1)+' 章'));if(!cid)continue;saveSeed('acfun_v060_fiction_chapter_seed_'+S(info.id)+'_',cid,x.raw||x);d.push({title:ct,desc:'播放 / 阅读',col_type:'text_2',url:chapterUrl(info.id,cid,ct),extra:{content_kind:'fiction_chapter',fiction_id:info.id,fiction_chapter_id:cid,fiction_chapter_title:ct,lineVisible:false}})}if(!chapters.length)d.push({title:'暂未返回章节目录',col_type:'text_center_1',url:'hiker://empty'});setResult(d)
}
function audioChapter(fid,cid){
    var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},seedObj=seed('acfun_v060_fiction_chapter_seed_'+S(fid)+'_',cid),apiObj=ac.__v060a10FictionChapter?ac.__v060a10FictionChapter(fid,cid):{},obj=merge(seedObj,apiObj),ct=S(p.fiction_chapter_title||param('fiction_chapter_title')||pick(obj,['chapterTitle','chapterName','title','name'],'有声章节')),payload=ac.__v060a10ExpandChapter?ac.__v060a10ExpandChapter(obj,'audio'):(ac.__v060a10ChapterPayload?ac.__v060a10ChapterPayload(obj,'audio'):{texts:[],audios:[]}),aud=audioCandidates(obj,payload),d=[];setPageTitle(ct);
    if(aud.length)d.push({title:'▶ 播放本章音频',desc:aud.length>1?'含 '+aud.length+' 条候选线路':'',pic_url:I('audio'),img:I('audio'),col_type:'text_icon',url:musicLazy(aud,S(fid)+'_'+S(cid)),extra:{lineVisible:false}});if(payload.texts&&payload.texts.length)d.push({title:paragraph(payload.texts.join('\n\n')),col_type:'rich_text',url:'hiker://empty',extra:{textSize:16,lineVisible:false}});if(!d.length)d.push({title:'本章仍未解析到音频',desc:'有声探针：'+getItem('acfun_v060_a14_audio_source_probe','暂无'),col_type:'long_text',url:'hiker://empty'});setResult(d)
}

ac.detail=function(){
    var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},kind=S(p.content_kind||param('content_kind')||'video'),mode=S(p.fiction_mode||param('fiction_mode')||'fiction');
    if(kind==='video')return videoDetail();
    if(kind==='comic_chapter')return comicReader();
    if(kind==='fiction'&&mode==='audio'){var id=S(p.fiction_id||param('fiction_id')||param('content_id'));return audioDetail(id)}
    if(kind==='fiction_chapter'&&mode==='audio'){var fid=S(p.fiction_id||param('fiction_id')||param('content_id')),cid=S(p.fiction_chapter_id||param('fiction_chapter_id'));return audioChapter(fid,cid)}
    return typeof prevDetail==='function'?prevDetail.call(ac):undefined
};
try{setItem('acfun_v060_detail_a14','alpha12 comic renderer + fullTheme + seed-preserving video + current audio')}catch(e){}ac.build='2026.08.23-v0.6.0-alpha14';
})();
