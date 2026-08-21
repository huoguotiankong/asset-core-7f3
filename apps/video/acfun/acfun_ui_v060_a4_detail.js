/** ACFun 0.6.0-alpha4 / Build 155 - typed video/comic/fiction/community detail dispatch. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var oldDetail=ac.detail;
ac.build='2026.08.21-v0.6.0-alpha4';
var M='#8A8A8A',BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';
function S(v){return String(v===undefined||v===null?'':v)}
function N(v){var s=S(v);return /^\d+$/.test(s)?Number(s):s}
function E(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function I(n){return BASE+n+'.svg'}
function rich(t,sub){return'<b>'+E(t)+'</b>'+(sub?'  <font color="'+M+'">'+E(sub)+'</font>':'')}
function param(k){try{return S(getParam(k,''))}catch(e){return''}}
function first(v){return Array.isArray(v)?(v.length?v[0]:''):v}
function title(d,t,sub){d.push({title:rich(t,sub||''),col_type:'rich_text',extra:{textSize:16,lineVisible:false}})}
function joinUrl(domain,path){path=S(path).trim();domain=S(domain).trim();if(!path)return'';if(/^https?:\/\//i.test(path))return path;if(!domain)return path;return domain.replace(/\/+$/,'')+'/'+path.replace(/^\/+/, '')}
function entityId(kind){var p=typeof MY_PARAMS==='object'?MY_PARAMS:{};if(kind==='comic'||kind==='comic_chapter')return S(p.comics_id||param('comics_id')||param('content_id'));if(kind==='fiction'||kind==='fiction_chapter')return S(p.fiction_id||param('fiction_id')||param('content_id'));if(kind==='dynamic')return S(p.dynamic_id||param('dynamic_id')||param('content_id'));return S(p.video_id||param('video_id')||param('content_id')||param('id'))}
function chapterRows(obj){return ac.__v060a4Collect(obj,'chapter')}
function action(d,name,icon,url){d.push({title:name,pic_url:I(icon),img:I(icon),col_type:'icon_small_3',url:url,extra:{lineVisible:false}})}

function comicDetail(id){
    var d=[],fallbackTitle=S((typeof MY_PARAMS==='object'&&MY_PARAMS.comics_title)||param('comics_title')||'漫画详情'),obj=ac.__v060a4Detail('comics/base/info',{comicsId:N(id)},'comic','comic|'+id),info=ac.__v060a4ComicInfo(obj);if(!info.id)info.id=id;if(!info.title||info.title==='未命名漫画')info.title=fallbackTitle;
    var chapters=chapterRows(obj);if(!chapters.length)chapters=ac.__v060a4Try([{path:'comics/base/queryChange',params:{comicsId:N(id),page:1,pageNum:1,pageSize:300}}],'chapter','comic-chapters|'+id,900,86400);
    setPageTitle(info.title);try{if(info.img)setPagePicUrl(ac.image(info.img))}catch(e){}
    d.push({title:info.title,desc:[info.author,info.desc].filter(function(v){return!!v}).join('\n'),pic_url:ac.image(info.img),img:ac.image(info.img),col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    action(d,'收藏','favorite',$('hiker://empty#noLoading#').lazyRule(function(cid,ct,ci){var key='acfun_comic_favs',a=[];try{a=JSON.parse(getItem(key,'[]'))||[]}catch(e){}a=(Array.isArray(a)?a:[]).filter(function(x){return String(x.id)!==String(cid)});a.unshift({id:String(cid),title:String(ct),img:String(ci),time:Date.now()});setItem(key,JSON.stringify(a.slice(0,300)));return'toast://已加入漫画收藏'},info.id,info.title,info.img));
    action(d,'评论','comment',ac.__v060a4CommentsUrl('comic',info.id,info.title));
    action(d,'搜索','search','hiker://search?s='+encodeURIComponent(info.title)+'&rule=ACFun&scope=comic');
    d.push({col_type:'line'});if(info.desc){title(d,'作品简介');d.push({title:E(info.desc).replace(/\n/g,'<br>'),col_type:'rich_text',url:'hiker://empty',extra:{textSize:13,lineVisible:false}})}
    title(d,'章节目录',chapters.length+' 章');
    for(var i=0;i<chapters.length;i++){var x=chapters[i],cid=S(ac.pick(x,['chapterId','id'],'')||''),ct=S(ac.pick(x,['chapterTitle','title','name'],'第 '+(i+1)+' 章')||'');if(!cid)continue;d.push({title:ct,desc:S(ac.pick(x,['updateTime','createTime','time'],'')||''),col_type:'text_2',url:ac.__v060a4Route({kind:'comic_chapter',comicsId:info.id,chapterId:cid,title:ct}),extra:{content_kind:'comic_chapter',comics_id:info.id,comic_chapter_id:cid,comic_chapter_title:ct,lineVisible:false}})}
    if(!chapters.length)d.push({title:'暂未返回章节',desc:'详情已恢复，但当前接口没有返回 chapterList。可稍后刷新；空响应不会覆盖有效缓存。',col_type:'long_text',url:'hiker://empty'});
    var rec=ac.__v060a4Try([{path:'comics/base/getRec',params:{comicsId:N(id),page:1,pageNum:1,pageSize:6}}],'comic','comic-rec|'+id,900,86400);if(rec.length){d.push({col_type:'line'});title(d,'相关推荐',rec.length+' 部');for(var r=0;r<rec.length;r++){var ri=ac.__v060a4ComicInfo(rec[r]);d.push({title:ri.title,desc:ri.author,pic_url:ac.image(ri.img),img:ac.image(ri.img),col_type:'movie_3',url:ac.__v060a4Route(ri),extra:{content_kind:'comic',comics_id:ri.id,comics_title:ri.title,lineVisible:false}})}}
    setResult(d);
}

function comicReader(comicsId,chapterId){
    var d=[],fallback=S((typeof MY_PARAMS==='object'&&MY_PARAMS.comic_chapter_title)||param('comic_chapter_title')||'漫画章节'),obj=ac.__v060a4Detail('comics/base/chapterInfo',{comicsId:N(comicsId),chapterId:N(chapterId)},'chapter','comic-chapter|'+chapterId),ct=S(ac.pick(obj,['chapterTitle','title','name'],fallback)||fallback),domain=S(ac.pick(obj,['domain','imgDomain','imageDomain'],'')||''),raw=ac.pick(obj,['imgList','imageList','chapterImgList','images'],[]),imgs=[];
    if(!Array.isArray(raw))raw=[raw];for(var i=0;i<raw.length;i++){var x=raw[i],u=typeof x==='string'?x:first(ac.pick(x||{},['imgUrl','imageUrl','url','path','src'],'')||'');u=joinUrl(domain,u);if(u)imgs.push(u)}if(!imgs.length)imgs=ac.__v060a4Media(obj,'image');
    setPageTitle(ct);if(obj&&obj.canWatch===false){d.push({title:'当前章节暂不可阅读',desc:S(ac.pick(obj,['info','message'],'需要权限或购买')||''),col_type:'long_text',url:'hiker://empty'});setResult(d);return}
    if(imgs.length){title(d,ct,imgs.length+' 页');for(var j=0;j<imgs.length;j++)d.push({title:'',pic_url:ac.image(imgs[j]),img:ac.image(imgs[j]),col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}})}else d.push({title:'章节没有返回图片',desc:'已按 chapterInfo 的 imgList、imageList 与域名字段恢复，当前响应仍为空。',col_type:'long_text',url:'hiker://empty'});setResult(d);
}

function fictionDetail(id){
    var d=[],fallback=S((typeof MY_PARAMS==='object'&&MY_PARAMS.fiction_title)||param('fiction_title')||'小说详情'),obj=ac.__v060a4Detail('fiction/base/info',{fictionId:N(id)},'fiction','fiction|'+id),info=ac.__v060a4FictionInfo(obj);if(!info.id)info.id=id;if(!info.title||info.title==='未命名小说')info.title=fallback;var chapters=chapterRows(obj),audios=ac.__v060a4Media(obj,'audio');
    setPageTitle(info.title);try{if(info.img)setPagePicUrl(ac.image(info.img))}catch(e){}d.push({title:info.title,desc:[info.author,info.status,info.desc].filter(function(v){return!!v}).join('\n'),pic_url:ac.image(info.img),img:ac.image(info.img),col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    action(d,'收藏','favorite',$('hiker://empty#noLoading#').lazyRule(function(fid,ft,fi){var key='acfun_fiction_favs',a=[];try{a=JSON.parse(getItem(key,'[]'))||[]}catch(e){}a=(Array.isArray(a)?a:[]).filter(function(x){return String(x.id)!==String(fid)});a.unshift({id:String(fid),title:String(ft),img:String(fi),time:Date.now()});setItem(key,JSON.stringify(a.slice(0,300)));return'toast://已加入小说收藏'},info.id,info.title,info.img));
    action(d,'评论','comment',ac.__v060a4CommentsUrl('fiction',info.id,info.title));action(d,'搜索','search','hiker://search?s='+encodeURIComponent(info.title)+'&rule=ACFun&scope=fiction');d.push({col_type:'line'});
    if(info.desc){title(d,'作品简介');d.push({title:E(info.desc).replace(/\n/g,'<br>'),col_type:'rich_text',url:'hiker://empty',extra:{textSize:13,lineVisible:false}})}if(audios.length){title(d,'有声资源',audios.length+' 条');d.push({title:'播放作品音频',pic_url:I('audio'),img:I('audio'),col_type:'text_icon',url:audios[0]+'#isMusic=true#',extra:{lineVisible:false}})}
    title(d,'章节目录',chapters.length+' 章');for(var i=0;i<chapters.length;i++){var x=chapters[i],cid=S(ac.pick(x,['chapterId','id'],'')||''),ct=S(ac.pick(x,['chapterTitle','title','name'],'第 '+(i+1)+' 章')||'');if(!cid)continue;var hasAudio=ac.__v060a4Media(x,'audio').length>0;d.push({title:ct,desc:hasAudio?'有声章节':'阅读章节',col_type:'text_2',url:ac.__v060a4Route({kind:'fiction_chapter',fictionId:info.id,chapterId:cid,title:ct}),extra:{content_kind:'fiction_chapter',fiction_id:info.id,fiction_chapter_id:cid,fiction_chapter_title:ct,lineVisible:false}})}if(!chapters.length)d.push({title:'暂未返回章节',desc:'小说详情可用，但当前接口没有返回 chapterList。',col_type:'long_text',url:'hiker://empty'});setResult(d);
}

function textContent(obj){var v=ac.pick(obj,['chapterContent','fictionContent','content','text','paragraphList','contentList'],'');if(Array.isArray(v)){var a=[];for(var i=0;i<v.length;i++){var x=v[i];a.push(typeof x==='string'?x:S(ac.pick(x||{},['content','text','value'],'')||''))}return a.filter(function(x){return!!x}).join('\n\n')}if(v&&typeof v==='object')return S(ac.pick(v,['content','text','value'],'')||'');return S(v)}
function fictionReader(fictionId,chapterId){
    var d=[],fallback=S((typeof MY_PARAMS==='object'&&MY_PARAMS.fiction_chapter_title)||param('fiction_chapter_title')||'小说章节'),obj=ac.__v060a4Detail('fiction/base/chapterInfo',{fictionId:N(fictionId),chapterId:N(chapterId)},'chapter','fiction-chapter|'+chapterId),ct=S(ac.pick(obj,['chapterTitle','title','name'],fallback)||fallback),body=textContent(obj),audios=ac.__v060a4Media(obj,'audio'),images=ac.__v060a4Media(obj,'image');setPageTitle(ct);title(d,ct,audios.length?'有声章节':'阅读章节');
    if(audios.length){d.push({title:'播放本章音频',desc:audios.length+' 个音频源',pic_url:I('audio'),img:I('audio'),col_type:'text_icon',url:audios[0]+'#isMusic=true#',extra:{lineVisible:false}});for(var a=1;a<audios.length;a++)d.push({title:'备用音频 '+(a+1),col_type:'text_2',url:audios[a]+'#isMusic=true#',extra:{lineVisible:false}})}
    if(body)d.push({title:E(body).replace(/\r?\n/g,'<br>'),col_type:'rich_text',url:'hiker://empty',extra:{textSize:15,lineVisible:false}});for(var i=0;i<images.length;i++)d.push({title:'',pic_url:ac.image(images[i]),img:ac.image(images[i]),col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}});if(!body&&!audios.length&&!images.length)d.push({title:'本章暂未返回正文或音频',desc:'已读取 chapterInfo、longFormAudio 与常见正文/媒体字段。',col_type:'long_text',url:'hiker://empty'});setResult(d);
}

function dynamicDetail(id){
    var d=[],obj=ac.__v060a4Detail('community/dynamic/dynamicInfo',{dynamicId:N(id)},'dynamic','dynamic|'+id),info=ac.__v060a4DynamicInfo(obj);if(!info.id)info.id=id;if(!info.title)info.title=S(param('dynamic_title')||'社区动态');var imgs=ac.__v060a4Media(obj,'image'),tm=S(ac.pick(obj,['createTime','publishTime','time'],'')||'');setPageTitle('社区动态');title(d,info.author||'ACFun 用户',tm);if(info.content)d.push({title:E(info.content).replace(/\r?\n/g,'<br>'),col_type:'rich_text',url:'hiker://empty',extra:{textSize:15,lineVisible:false}});for(var i=0;i<imgs.length;i++)d.push({title:'',pic_url:ac.image(imgs[i]),img:ac.image(imgs[i]),col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}});d.push({col_type:'line'});action(d,'评论','comment',ac.__v060a4CommentsUrl('dynamic',info.id,info.title));action(d,'分享','more','copy://'+(info.content||info.title));action(d,'搜索','search','hiker://search?s='+encodeURIComponent(info.author||info.title)+'&rule=ACFun&scope=dynamic');if(!info.content&&!imgs.length)d.push({title:'动态详情暂未返回正文',desc:'dynamicInfo 已调用，可进入评论查看互动内容。',col_type:'long_text',url:'hiker://empty'});setResult(d);
}

ac.detail=function(){
    var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},kind=S(p.content_kind||param('content_kind')||'video');
    if(kind==='comic_chapter')return comicReader(entityId(kind),S(p.comic_chapter_id||param('comic_chapter_id')));
    if(kind==='comic')return comicDetail(entityId(kind));
    if(kind==='fiction_chapter')return fictionReader(entityId(kind),S(p.fiction_chapter_id||param('fiction_chapter_id')));
    if(kind==='fiction')return fictionDetail(entityId(kind));
    if(kind==='dynamic')return dynamicDetail(entityId(kind));
    if(typeof oldDetail==='function')return oldDetail.call(ac);
    setResult([{title:'视频详情不可用',desc:'缺少基础视频详情模块。',col_type:'long_text',url:'hiker://empty'}]);
};

try{setItem('acfun_test_runtime','0.6.0-alpha4 typed detail/readers')}catch(e){}
})();
