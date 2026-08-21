/** ACFun 0.6.0-alpha7 / Build 158 - immersive-content cleanup without immersive system chrome. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var oldDetail=ac.detail;
function S(v){return String(v===undefined||v===null?'':v)}
function N(v){var s=S(v);return /^\d+$/.test(s)?Number(s):s}
function param(k){try{return S(getParam(k,''))}catch(e){return''}}
function first(v){return Array.isArray(v)?(v.length?v[0]:''):v}
function joinUrl(domain,path){path=S(path).trim();domain=S(domain).trim();if(!path)return'';if(/^https?:\/\//i.test(path))return path;if(!domain)return path;return domain.replace(/\/+$/,'')+'/'+path.replace(/^\/+/, '')}
function cleanText(v){var s=S(v);s=s.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,function(_,t,u){return t===u?u:(t+'\n'+u)});s=s.replace(/(https?:\/\/\S+)\s*\(\1\)/g,'$1');s=s.replace(/\n{3,}/g,'\n\n');return s.trim()}
function esc(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\r?\n/g,'<br>')}
function comicReader(comicsId,chapterId){
    var d=[],fallback=S((typeof MY_PARAMS==='object'&&MY_PARAMS.comic_chapter_title)||param('comic_chapter_title')||'漫画章节'),obj=ac.__v060a4Detail('comics/base/chapterInfo',{comicsId:N(comicsId),chapterId:N(chapterId)},'chapter','comic-chapter|'+chapterId),ct=S(ac.pick(obj,['chapterTitle','title','name'],fallback)||fallback),domain=S(ac.pick(obj,['domain','imgDomain','imageDomain'],'')||''),raw=ac.pick(obj,['imgList','imageList','chapterImgList','images'],[]),imgs=[];
    if(!Array.isArray(raw))raw=[raw];for(var i=0;i<raw.length;i++){var x=raw[i],u=typeof x==='string'?x:first(ac.pick(x||{},['imgUrl','imageUrl','url','path','src'],'')||'');u=joinUrl(domain,u);if(u)imgs.push(u)}if(!imgs.length)imgs=ac.__v060a4Media(obj,'image');setPageTitle(ct);
    if(obj&&obj.canWatch===false){setResult([{title:'当前章节暂不可阅读',desc:S(ac.pick(obj,['info','message'],'需要权限或购买')||''),col_type:'long_text',url:'hiker://empty'}]);return}
    if(imgs.length){for(var j=0;j<imgs.length;j++)d.push({title:'',pic_url:ac.image(imgs[j]),img:ac.image(imgs[j]),col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}})}else d.push({title:'章节没有返回图片',desc:'当前 chapterInfo 没有可显示图片。',col_type:'long_text',url:'hiker://empty'});setResult(d)
}
function dynamicDetail(id){
    var d=[],obj=ac.__v060a4Detail('community/dynamic/dynamicInfo',{dynamicId:N(id)},'dynamic','dynamic|'+id),info=ac.__v060a4DynamicInfo(obj);if(!info.id)info.id=id;var text=cleanText(info.content||info.title||''),imgs=ac.__v060a4Media(obj,'image'),tm=ac.__v060a7HumanTime?ac.__v060a7HumanTime(ac.pick(obj,['createTime','publishTime','time'],'')||info.time):S(info.time||'');setPageTitle('社区动态');
    d.push({title:info.author||'ACFun 用户',desc:tm,col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});if(text)d.push({title:esc(text),col_type:'rich_text',url:'hiker://empty',extra:{textSize:15,lineVisible:false}});for(var i=0;i<imgs.length;i++)d.push({title:'',pic_url:ac.image(imgs[i]),img:ac.image(imgs[i]),col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}});if(!text&&!imgs.length)d.push({title:'动态详情暂未返回正文',col_type:'long_text',url:'hiker://empty'});setResult(d)
}
ac.detail=function(){var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},kind=S(p.content_kind||param('content_kind')||'video');if(kind==='comic_chapter'){var comicsId=S(p.comics_id||param('comics_id')||param('content_id')),chapterId=S(p.comic_chapter_id||param('comic_chapter_id'));return comicReader(comicsId,chapterId)}if(kind==='dynamic'){var id=S(p.dynamic_id||param('dynamic_id')||param('content_id'));return dynamicDetail(id)}return typeof oldDetail==='function'?oldDetail.call(ac):undefined};
try{setItem('acfun_v060_detail_a7','full-width comic pages + clean community detail')}catch(e){}
})();
