/** ACFun 0.6.0-alpha12 / Build 163 - direct full-width comic reader. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var oldDetail=ac.detail,oldRoute=ac.__v060a4Route;
function S(v){return String(v===undefined||v===null?'':v)}
function param(k){try{return S(getParam(k,''))}catch(e){return''}}
function comicPageUrl(info){info=info||{};var cid=S(info.comicsId||info.comicId||info.contentId||''),ch=S(info.chapterId||''),ct=S(info.title||'漫画阅读');return'hiker://page/acfun_detail?rule=ACFun&simple=true&content_kind=comic_chapter&comics_id='+encodeURIComponent(cid)+'&comic_chapter_id='+encodeURIComponent(ch)+'&comic_chapter_title='+encodeURIComponent(ct)+'#noRecordHistory#'}
ac.__v060a4Route=function(info){info=info||{};if(S(info.kind)==='comic_chapter')return comicPageUrl(info);return typeof oldRoute==='function'?oldRoute.call(ac,info):'hiker://empty'};ac.__v060DetailUrl=ac.__v060a4Route;ac.detailUrl=function(info){return ac.__v060a4Route(info)};
function comicReader(cid,ch,ct){
    setPageTitle(ct||'漫画阅读');var d=[],obj=ac.__v060a12ComicChapter?ac.__v060a12ComicChapter(cid,ch):{},cw='';try{cw=ac.pick(obj,['canWatch'],'')}catch(e){}if(cw===false){d.push({title:'当前章节暂不可阅读',desc:S(ac.pick(obj,['info','message'],'需要权限或购买')||''),col_type:'long_text',url:'hiker://empty'});setResult(d);return}
    var imgs=ac.__v060a12ComicImages?ac.__v060a12ComicImages(obj):[];for(var i=0;i<imgs.length;i++){var u=ac.image?ac.image(imgs[i]):imgs[i];d.push({title:'',pic_url:u,img:u,col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}})}
    if(!imgs.length){var probe=getItem('acfun_v060_a12_comic_probe','无');d.push({title:'本章仍未解析到图片',desc:'章节接口已经按 Stable 验证的 chapterId 单参数优先重试。\n漫画诊断：'+probe,col_type:'long_text',url:'hiker://empty'});d.push({title:'复制漫画诊断',col_type:'text_1',url:'copy://'+probe})}setResult(d)
}
ac.detail=function(){var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},kind=S(p.content_kind||param('content_kind')||'video');if(kind==='comic_chapter'){var cid=S(p.comics_id||param('comics_id')||param('content_id')),ch=S(p.comic_chapter_id||param('comic_chapter_id')),ct=S(p.comic_chapter_title||param('comic_chapter_title')||'漫画阅读');return comicReader(cid,ch,ct)}return typeof oldDetail==='function'?oldDetail.call(ac):undefined};
try{setItem('acfun_v060_detail_a12','direct full-width reader + chapterId-first contract')}catch(e){}ac.build='2026.08.22-v0.6.0-alpha12';
})();
