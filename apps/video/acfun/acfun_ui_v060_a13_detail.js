/** ACFun 0.6.0-alpha13 / Build 164
 * - comic chapters go straight to native pics:// multi-image mode
 * - video detail play action loads the current Bootstrap, never evals core-only source
 * - remove favorite/comment action cards from the player sibling list; keep them on hero long-press
 * - audio chapter play also re-enters the current Bootstrap
 */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var prevDetail=ac.detail,prevRoute=ac.__v060a4Route;
var BOOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v069.js?v=6900',BVER=6900;
function S(v){return String(v===undefined||v===null?'':v)}
function E(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function param(k){try{return S(getParam(k,''))}catch(e){return''}}
function infoLine(a){return(a||[]).filter(function(v){return!!S(v)}).join(' · ')}
function merge(a,b){var x={},k;for(k in(a||{}))x[k]=a[k];for(k in(b||{}))if(b[k]!==undefined&&b[k]!==null&&b[k]!=='')x[k]=b[k];return x}
function seed(prefix,id){try{return JSON.parse(getItem(prefix+S(id),'{}'))||{}}catch(e){return{}}}

function comicPicsUrl(info){
    info=info||{};var cid=S(info.comicsId||info.comicId||info.contentId||''),ch=S(info.chapterId||''),ct=S(info.title||'漫画阅读');
    return $('hiker://empty#noLoading#').lazyRule(function(c,m,t,boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);ACFunBoot.loadOnly();var obj=ac.__v060a12ComicChapter?ac.__v060a12ComicChapter(c,m):{},imgs=ac.__v060a12ComicImages?ac.__v060a12ComicImages(obj):[],arr=[];for(var i=0;i<imgs.length;i++){var u=ac.image?ac.image(imgs[i]):imgs[i];if(u)arr.push(u)}try{setItem('acfun_v060_a13_comic_probe',JSON.stringify({cid:String(c),ch:String(m),images:arr.length,mode:'pics'}))}catch(e0){}if(!arr.length)return'toast://本章没有返回可阅读图片';return'pics://'+arr.join('&&')}catch(e){try{setItem('acfun_v060_a13_comic_probe',String(e.message||e))}catch(e2){}return'toast://漫画加载失败：'+String(e.message||e)}},cid,ch,ct,BOOT,BVER)
}
ac.__v060a4Route=function(info){info=info||{};if(S(info.kind)==='comic_chapter')return comicPicsUrl(info);return typeof prevRoute==='function'?prevRoute.call(ac,info):'hiker://empty'};ac.__v060DetailUrl=ac.__v060a4Route;ac.detailUrl=function(info){return ac.__v060a4Route(info)};

function currentPlayUrl(info,obj){return $('hiker://empty#noLoading#').lazyRule(function(vid,raw,title,img,uri,boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);ACFunBoot.loadOnly();try{ac.addHistory({id:String(vid),title:String(title),img:String(img),uri:String(uri),data:String(raw)})}catch(e0){}return ac.play(String(vid),String(raw),String(uri||''))}catch(e){return'toast://播放失败：'+String(e.message||e)}},S(info.id),JSON.stringify(obj||{}),S(info.title),S(info.img),S(info.uri||''),BOOT,BVER)}
function favLongJs(info,obj){return $.toString(function(vid,title,img,uri,raw,boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);ACFunBoot.loadOnly();if(ac.isFavorite&&ac.isFavorite(String(vid))){ac.removeFavorite(String(vid));return'toast://已取消收藏'}var l=ac.favoriteList?ac.favoriteList():[];if(ac.upsert)l=ac.upsert(l,{id:String(vid),title:String(title),img:String(img),uri:String(uri),data:String(raw)});if(ac.saveList)ac.saveList('acfun_favs',l,500);return'toast://已收藏'}catch(e){return'toast://收藏操作失败：'+String(e.message||e)}},S(info.id),S(info.title),S(info.img),S(info.uri||''),JSON.stringify(obj||{}),BOOT,BVER)}
function commentLongJs(info){return $.toString(function(vid,title){return'hiker://page/acfun_comments?rule=ACFun&simple=true&video_id='+encodeURIComponent(String(vid))+'&video_title='+encodeURIComponent(String(title))+'#noRecordHistory#'},S(info.id),S(info.title))}
function videoDetail(){
    var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},id=S(p.video_id||param('video_id')||p.content_id||param('content_id')||param('id')),fb=ac.safeJson(p.video_data)||{},pt=S(p.video_title||param('video_title')),pi=S(p.video_img||param('video_img'));
    if(pt&&!fb.title)fb.title=pt;if(pi&&!fb.coverImg)fb.coverImg=[pi];if(p.video_uri&&!fb.videoUrl)fb.videoUrl=p.video_uri;if(id&&!fb.videoId&&!fb.id)fb.videoId=id;
    var obj=fb;try{var c=ac.__v042Read?ac.__v042Read('detail|'+id,1800,86400):{hit:false,data:null};if(c.hit&&c.data)obj=c.data}catch(e){}var info=ac.itemInfo(obj);if(!info.id)info.id=id;if((!info.title||info.title==='未命名')&&pt)info.title=pt;if(!info.img&&pi)info.img=pi;
    if(id&&(!info.title||info.title==='未命名'||!info.img)){try{var full=ac.getDetail?ac.getDetail(id,fb):null;if(full&&typeof full==='object'){obj=full;info=ac.itemInfo(full);if(ac.__v042Write)ac.__v042Write('detail|'+id,full)}}catch(e2){try{setItem('acfun_v060_a13_detail_error',S(e2.message||e2))}catch(e3){}}}
    if(!info.id){setPageTitle('视频详情');setResult([{title:'没有拿到视频标识',desc:'请返回列表重新进入。',col_type:'long_text',url:'hiker://empty'}]);return}if(!info.title||info.title==='未命名')info.title='视频 '+info.id;
    var d=[],pic=info.img?ac.image(info.img):'',meta=[];if(info.author)meta.push(info.author);if(info.watch)meta.push('播放 '+ac.fmtNum(info.watch));if(info.like)meta.push('点赞 '+ac.fmtNum(info.like));if(info.duration)meta.push(info.duration);var play=currentPlayUrl(info,obj);setPageTitle(info.title);try{if(pic)setPagePicUrl(pic)}catch(e4){}
    var lc=[{title:(ac.isFavorite&&ac.isFavorite(info.id))?'取消收藏':'收藏',js:favLongJs(info,obj)},{title:'评论',js:commentLongJs(info)},{title:'复制标题',js:$.toString(function(t){return'copy://'+String(t)},info.title)}];
    if(pic)d.push({title:info.title,desc:infoLine(meta),pic_url:pic,img:pic,col_type:'pic_1_full',url:play,extra:{lineVisible:false,longClick:lc}});else d.push({title:'▶ '+info.title,desc:infoLine(meta),col_type:'text_1',url:play,extra:{lineVisible:false,longClick:lc}});
    d.push({title:'长按上方封面：收藏 / 评论',desc:'播放器列表只保留真正的播放项，不再混入收藏、评论按钮。',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    var intro='';try{intro=ac.pick(obj,['description','desc','introduction','videoDesc'],'')||''}catch(e5){}if(intro&&typeof intro!=='object')d.push({title:E(intro).replace(/\r?\n/g,'<br>'),col_type:'rich_text',url:'hiker://empty',extra:{textSize:14,lineVisible:false}});
    var tags=[];try{tags=ac.pick(obj,['videoTags','tags','tagList'],[])||[];if(!Array.isArray(tags)&&obj.video)tags=ac.pick(obj.video,['videoTags','tags','tagList'],[])||[]}catch(e6){}var names=[];if(Array.isArray(tags))for(var i=0;i<tags.length&&names.length<12;i++){var n=ac.__v042TagName?ac.__v042TagName(tags[i]):S(tags[i]&&tags[i].name||tags[i]);if(n&&names.indexOf(n)<0)names.push(n)}if(names.length){d.push({title:'标签 · '+names.join(' · '),col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}})}setResult(d)
}

function audioChapter(){
    var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},fid=S(p.fiction_id||param('fiction_id')||p.content_id||param('content_id')),cid=S(p.fiction_chapter_id||param('fiction_chapter_id')),ct=S(p.fiction_chapter_title||param('fiction_chapter_title')||'有声章节'),seedObj=seed('acfun_v060_fiction_chapter_seed_'+fid+'_',cid),apiObj={};try{apiObj=ac.__v060a10FictionChapter?ac.__v060a10FictionChapter(fid,cid):{}}catch(e){}var obj=merge(seedObj,apiObj),payload={texts:[],images:[],audios:[]};try{payload=ac.__v060a10ExpandChapter?ac.__v060a10ExpandChapter(obj,'audio'):(ac.__v060a10ChapterPayload?ac.__v060a10ChapterPayload(obj,'audio'):payload)}catch(e2){}var aud=[];try{aud=ac.__v060a13AudioCandidates?ac.__v060a13AudioCandidates(obj):(ac.__v060a11AudioCandidates?ac.__v060a11AudioCandidates(obj):[])}catch(e3){}var d=[];setPageTitle(ct);
    if(aud.length)d.push({title:'▶ 播放本章音频',desc:aud.length>1?'可选择备用线路':'',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(list,id,boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);ACFunBoot.loadOnly();var a=[];try{a=JSON.parse(list)||[]}catch(e){}return ac.__v060a13AudioPlayer?ac.__v060a13AudioPlayer(a,id):'toast://音频播放器未加载'}catch(e2){return'toast://音频播放失败：'+String(e2.message||e2)}},JSON.stringify(aud),fid+'_'+cid,BOOT,BVER),extra:{lineVisible:false}});
    if(payload.texts&&payload.texts.length)d.push({title:E(payload.texts.join('\n\n')).replace(/\r?\n/g,'<br>'),col_type:'rich_text',url:'hiker://empty',extra:{textSize:16,lineVisible:false}});if(!d.length)d.push({title:'本章仍未解析到音频',desc:'有声诊断：'+getItem('acfun_v060_a13_audio_probe','暂无'),col_type:'long_text',url:'hiker://empty'});setResult(d)
}
ac.detail=function(){var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},kind=S(p.content_kind||param('content_kind')||'video'),mode=S(p.fiction_mode||param('fiction_mode')||'fiction');if(kind==='video')return videoDetail();if(kind==='fiction_chapter'&&mode==='audio')return audioChapter();if(kind==='comic_chapter'){var cid=S(p.comics_id||param('comics_id')||p.content_id||param('content_id')),ch=S(p.comic_chapter_id||param('comic_chapter_id')),ct=S(p.comic_chapter_title||param('comic_chapter_title')||'漫画阅读');var u=comicPicsUrl({comicsId:cid,chapterId:ch,title:ct});setPageTitle('漫画阅读');setResult([{title:'打开漫画阅读',col_type:'text_center_1',url:u}]);return}return typeof prevDetail==='function'?prevDetail.call(ac):undefined};
try{setItem('acfun_v060_detail_a13','pics direct + current boot video/audio + clean player siblings')}catch(e){}ac.build='2026.08.23-v0.6.0-alpha13';
})();
