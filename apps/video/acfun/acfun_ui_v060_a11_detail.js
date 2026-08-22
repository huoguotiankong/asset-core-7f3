/** ACFun 0.6.0-alpha11 / Build 162
 * Current-build comic reader route + header-aware fiction/audio playback.
 */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var oldDetail=ac.detail,oldRoute=ac.__v060a4Route;
var BOOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v067.js?v=6700',BVER=6700;
var BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';
function S(v){return String(v===undefined||v===null?'':v)}
function E(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function I(n){return BASE+n+'.svg'}
function param(k){try{return S(getParam(k,''))}catch(e){return''}}
function pick(o,ks,d){try{return ac.pick(o||{},ks,d)}catch(e){return d}}
function seed(prefix,id){try{return JSON.parse(getItem(prefix+S(id),'{}'))||{}}catch(e){return{}}}
function saveSeed(prefix,id,o){try{setItem(prefix+S(id),JSON.stringify(o||{}))}catch(e){}}
function mergeObj(a,b){var x={},k;for(k in(a||{}))x[k]=a[k];for(k in(b||{}))if(b[k]!==undefined&&b[k]!==null&&b[k]!=='')x[k]=b[k];return x}
function cleanText(v){var s=S(v).replace(/\r/g,'').replace(/\n{3,}/g,'\n\n');return s.trim()}
function paragraphHtml(v){var s=cleanText(v);if(!s)return'';var a=s.split(/\n+/),o=[];for(var i=0;i<a.length;i++){var p=a[i].trim();if(p)o.push(E(p))}return o.join('<br><br>')}
function fictionMode(obj,fallback){if(fallback==='audio')return'audio';var t=S(pick(obj,['fictionType','type'],'')||''),la=pick(obj,['longFormAudio','isAudio'],'');if(t==='2'||t.toLowerCase()==='audio'||la===true||la===1||S(la)==='1')return'audio';return'fiction'}
function chapterUrl(fid,cid,ct,mode){return'hiker://page/acfun_detail?rule=ACFun&simple=true&content_kind=fiction_chapter&fiction_id='+encodeURIComponent(S(fid))+'&fiction_chapter_id='+encodeURIComponent(S(cid))+'&fiction_chapter_title='+encodeURIComponent(S(ct))+'&fiction_mode='+encodeURIComponent(mode)+'#noRecordHistory#'}
function mergeAudios(a,b){var out=[],seen={},all=(a||[]).concat(b||[]);for(var i=0;i<all.length;i++){var u=S(all[i]).trim();if(u&&!seen[u]){seen[u]=1;out.push(u)}}return out}
function audioCandidates(obj,p){var a=(p&&p.audios)||[],b=[];try{b=ac.__v060a11AudioCandidates?ac.__v060a11AudioCandidates(obj):[]}catch(e){}return mergeAudios(a,b)}
function musicLazy(urls,id){return $('hiker://empty#noLoading#').lazyRule(function(listJson,mid,boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);ACFunBoot.loadOnly();var a=[];try{a=JSON.parse(listJson)||[]}catch(e){}return ac.__v060a11AudioPlayer?ac.__v060a11AudioPlayer(a,mid):((a[0]||'')+'#isMusic=true#')}catch(e2){return'toast://音频播放失败：'+String(e2.message||e2)}},JSON.stringify(urls||[]),S(id),BOOT,BVER)}

function nativeComicUrl(comicsId,chapterId,title){return $('hiker://empty#noLoading#').lazyRule(function(cid,ch,ct,boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);ACFunBoot.loadOnly();var obj=ac.__v060a11ComicChapter?ac.__v060a11ComicChapter(cid,ch):{},imgs=ac.__v060a11ComicImages?ac.__v060a11ComicImages(obj):[],arr=[];for(var i=0;i<imgs.length;i++){var u=ac.image?ac.image(imgs[i]):imgs[i];if(u)arr.push(u)}if(!arr.length)return'toast://本章没有返回可阅读图片';return'pics://'+arr.join('&&')}catch(e){return'toast://漫画加载失败：'+String(e.message||e)}},S(comicsId),S(chapterId),S(title||''),BOOT,BVER)}
ac.__v060a11ComicChapterUrl=nativeComicUrl;
ac.__v060a4Route=function(info){info=info||{};if(S(info.kind)==='comic_chapter')return nativeComicUrl(info.comicsId||info.comicId||info.id,info.chapterId,info.title);return typeof oldRoute==='function'?oldRoute.call(ac,info):'hiker://empty'};
ac.__v060DetailUrl=ac.__v060a4Route;ac.detailUrl=function(info){return ac.__v060a4Route(info)};

function fictionDetail(id,mode){
    var d=[],seedObj=seed('acfun_v060_fiction_seed_',id),apiObj=ac.__v060a10FictionDetail?ac.__v060a10FictionDetail(id):{},obj=mergeObj(seedObj,apiObj),info=ac.__v060a4FictionInfo(obj);if(!info.id)info.id=id;if(!info.title||info.title==='未命名小说')info.title=S(param('fiction_title')||pick(seedObj,['fictionTitle','title'],'小说详情'));mode=fictionMode(obj,mode);setPageTitle(info.title);
    var pic=info.img?ac.image(info.img):I(mode==='audio'?'audio':'novel');try{if(info.img)setPagePicUrl(pic)}catch(e){}d.push({title:info.title,desc:[info.author,info.status].filter(function(v){return!!S(v)}).join(' · '),pic_url:pic,img:pic,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    if(info.desc)d.push({title:paragraphHtml(info.desc),col_type:'rich_text',url:'hiker://empty',extra:{textSize:14,lineVisible:false}});
    var work=ac.__v060a10ChapterPayload?ac.__v060a10ChapterPayload(obj,mode):{audios:[]},wa=audioCandidates(obj,work);if(mode==='audio'&&wa.length){d.push({title:'▶ 播放作品音频',desc:wa.length>1?'含备用音频源':'',pic_url:I('audio'),img:I('audio'),col_type:'text_icon',url:musicLazy(wa,'work_'+info.id),extra:{lineVisible:false}})}
    var chapters=ac.__v060a10ChapterRows?ac.__v060a10ChapterRows(obj):[];d.push({col_type:'line'});d.push({title:'章节目录',desc:chapters.length+' 章',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    for(var i=0;i<chapters.length;i++){var x=chapters[i]||{},cid=S(x.id),ct=S(x.title||('第 '+(i+1)+' 章')),raw=x.raw||x;if(!cid)continue;saveSeed('acfun_v060_fiction_chapter_seed_'+S(info.id)+'_',cid,raw);var ca=[];try{ca=ac.__v060a11AudioCandidates?ac.__v060a11AudioCandidates(raw):[]}catch(e2){}d.push({title:ct,desc:mode==='audio'?(ca.length?'有声音频 · 点击播放/阅读':'播放 / 阅读'):'阅读章节',col_type:'text_2',url:chapterUrl(info.id,cid,ct,mode),extra:{content_kind:'fiction_chapter',fiction_id:info.id,fiction_chapter_id:cid,fiction_chapter_title:ct,lineVisible:false}})}
    if(!chapters.length)d.push({title:'暂未返回章节目录',desc:'当前详情没有可识别 chapterId。',col_type:'long_text',url:'hiker://empty'});setResult(d)
}
function fictionReader(fid,cid,mode){
    var d=[],apiObj=ac.__v060a10FictionChapter?ac.__v060a10FictionChapter(fid,cid):{},seedObj=seed('acfun_v060_fiction_chapter_seed_'+S(fid)+'_',cid),obj=mergeObj(seedObj,apiObj),fallback=S(param('fiction_chapter_title')||'章节'),ct=S(pick(obj,['chapterTitle','chapterName','title','name'],fallback)||fallback);mode=fictionMode(obj,mode);var p=ac.__v060a10ExpandChapter?ac.__v060a10ExpandChapter(obj,mode):(ac.__v060a10ChapterPayload?ac.__v060a10ChapterPayload(obj,mode):{texts:[],audios:[],images:[],sources:[]}),aud=audioCandidates(obj,p);setPageTitle(ct);
    if(mode==='audio'&&aud.length){d.push({title:'▶ 播放本章音频',desc:aud.length>1?'含 '+aud.length+' 条线路':'',pic_url:I('audio'),img:I('audio'),col_type:'text_icon',url:musicLazy(aud,S(fid)+'_'+S(cid)),extra:{lineVisible:false}})}
    if(p.texts&&p.texts.length){if(d.length)d.push({col_type:'line'});d.push({title:paragraphHtml(p.texts.join('\n\n')),col_type:'rich_text',url:'hiker://empty',extra:{textSize:16,lineVisible:false}})}
    if(p.images&&p.images.length){if(d.length)d.push({col_type:'line'});for(var i=0;i<p.images.length;i++){var im=ac.image(p.images[i]);d.push({title:'',pic_url:im,img:im,col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}})}}
    if(!d.length)d.push({title:mode==='audio'?'本章音频仍未解析成功':'本章正文仍未解析成功',desc:'已合并章节列表 seed + chapterInfo，并检查 longFormAudio/audioSource/sourcePath/playPath 等字段。',col_type:'long_text',url:'hiker://empty'});setResult(d)
}

ac.detail=function(){var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},kind=S(p.content_kind||param('content_kind')||'video'),mode=S(p.fiction_mode||param('fiction_mode')||'fiction');if(kind==='fiction'){var id=S(p.fiction_id||param('fiction_id')||param('content_id'));return fictionDetail(id,mode)}if(kind==='fiction_chapter'){var fid=S(p.fiction_id||param('fiction_id')||param('content_id')),cid=S(p.fiction_chapter_id||param('fiction_chapter_id'));return fictionReader(fid,cid,mode)}if(kind==='comic_chapter'){var co=S(p.comics_id||param('comics_id')||param('content_id')),ch=S(p.comic_chapter_id||param('comic_chapter_id'));setPageTitle(S(p.comic_chapter_title||param('comic_chapter_title')||'漫画阅读'));setResult([{title:'打开漫画阅读',desc:'使用当前 Alpha11 章节解析链',col_type:'text_center_1',url:nativeComicUrl(co,ch,S(p.comic_chapter_title||param('comic_chapter_title')))}]);return}return typeof oldDetail==='function'?oldDetail.call(ac):undefined};
ac.build='2026.08.22-v0.6.0-alpha11';try{setItem('acfun_v060_detail_a11','current comic route + chapter seed audio player')}catch(e){}
})();