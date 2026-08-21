/** ACFun 0.6.0-alpha9 / Build 160 - fiction body/audio recovery + community detail refinement. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var oldDetail=ac.detail,BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';
function S(v){return String(v===undefined||v===null?'':v)}
function N(v){var s=S(v);return /^\d+$/.test(s)?Number(s):s}
function E(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function param(k){try{return S(getParam(k,''))}catch(e){return''}}
function I(n){return BASE+n+'.svg'}
function pick(o,ks,d){try{return ac.pick(o||{},ks,d)}catch(e){return d}}
function cleanText(v){var s=S(v);s=s.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,function(_,t,u){return t===u?u:(t+'\n'+u)});s=s.replace(/(https?:\/\/\S+)\s*\(\1\)/g,'$1').replace(/\r/g,'').replace(/\n{3,}/g,'\n\n');return s.trim()}
function paragraphHtml(v){var s=cleanText(v);if(!s)return'';var parts=s.split(/\n+/),out=[];for(var i=0;i<parts.length;i++){var p=parts[i].trim();if(p)out.push(E(p))}return out.join('<br><br>')}
function action(d,name,icon,url){d.push({title:name,pic_url:I(icon),img:I(icon),col_type:'icon_small_3',url:url,extra:{lineVisible:false}})}
function seed(prefix,id){try{return JSON.parse(getItem(prefix+S(id),'{}'))||{}}catch(e){return{}}}
function mergeObj(a,b){var x={},k;for(k in (a||{}))x[k]=a[k];for(k in (b||{}))if(b[k]!==undefined&&b[k]!==null&&b[k]!=='')x[k]=b[k];return x}
function chapterRows(obj){try{return ac.__v060a9ChapterRows?ac.__v060a9ChapterRows(obj):(ac.__v060a4Collect?ac.__v060a4Collect(obj,'chapter'):[])}catch(e){return[]}}
function fictionMode(obj,fallback){var t=S(pick(obj,['fictionType','type'],'')||''),la=pick(obj,['longFormAudio','isAudio'],'');if(fallback==='audio')return'audio';if(t==='2'||t.toLowerCase()==='audio'||la===true||la===1||S(la)==='1')return'audio';return'fiction'}
function fictionChapterUrl(fid,cid,ct,mode){return'hiker://page/acfun_detail?rule=ACFun&simple=true&content_kind=fiction_chapter&fiction_id='+encodeURIComponent(S(fid))+'&fiction_chapter_id='+encodeURIComponent(S(cid))+'&fiction_chapter_title='+encodeURIComponent(S(ct))+'&fiction_mode='+encodeURIComponent(mode)+'#noRecordHistory#'}

function fictionDetail(id,mode){
    var d=[],listSeed=seed('acfun_v060_fiction_seed_',id),obj=ac.__v060a9FictionDetail?ac.__v060a9FictionDetail(id):{},merged=mergeObj(listSeed,obj),info=ac.__v060a4FictionInfo(merged);if(!info.id)info.id=id;if(!info.title||info.title==='未命名小说')info.title=S(param('fiction_title')||pick(listSeed,['fictionTitle','title'],'小说详情'));
    mode=fictionMode(merged,mode);setPageTitle(info.title);try{if(info.img)setPagePicUrl(ac.image(info.img))}catch(e){}
    var pic=info.img?ac.image(info.img):I(mode==='audio'?'audio':'novel');
    d.push({title:info.title,desc:[info.author,info.status].filter(function(v){return!!S(v)}).join(' · '),pic_url:pic,img:pic,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    action(d,'收藏','favorite',$('hiker://empty#noLoading#').lazyRule(function(fid,ft,fi){var key='acfun_fiction_favs',a=[];try{a=JSON.parse(getItem(key,'[]'))||[]}catch(e){}a=(Array.isArray(a)?a:[]).filter(function(x){return String(x.id)!==String(fid)});a.unshift({id:String(fid),title:String(ft),img:String(fi),time:Date.now()});setItem(key,JSON.stringify(a.slice(0,300)));return'toast://已加入收藏'},info.id,info.title,info.img));
    action(d,'评论','comment',ac.__v060a4CommentsUrl('fiction',info.id,info.title));
    action(d,'搜索','search','hiker://search?s='+encodeURIComponent(info.title)+'&rule=ACFun&scope=fiction');
    if(info.desc){d.push({col_type:'line'});d.push({title:'<b>作品简介</b>',col_type:'rich_text',url:'hiker://empty',extra:{textSize:16,lineVisible:false}});d.push({title:paragraphHtml(info.desc),col_type:'rich_text',url:'hiker://empty',extra:{textSize:14,lineVisible:false}})}
    var workPayload=ac.__v060a9ChapterPayload?ac.__v060a9ChapterPayload(merged,mode):{audios:[]};if(workPayload.audios&&workPayload.audios.length){d.push({col_type:'line'});d.push({title:'播放作品音频',desc:'检测到 '+workPayload.audios.length+' 个音频候选',pic_url:I('audio'),img:I('audio'),col_type:'text_icon',url:workPayload.audios[0]+'#isMusic=true#',extra:{lineVisible:false}})}
    var chapters=chapterRows(merged);d.push({col_type:'line'});d.push({title:'<b>章节目录</b>  <font color="#8A8A8A">'+chapters.length+' 章</font>',col_type:'rich_text',extra:{textSize:16,lineVisible:false}});
    for(var i=0;i<chapters.length;i++){
        var x=chapters[i],cid=S(x.id||pick(x.raw,['chapterId','fictionChapterId'],'')||''),ct=S(x.title||pick(x.raw,['chapterTitle','chapterName','title'],'第 '+(i+1)+' 章')||'');if(!cid)continue;
        var p=ac.__v060a9ChapterPayload?ac.__v060a9ChapterPayload(x.raw||x,mode):{audios:[]},ha=p.audios&&p.audios.length;
        d.push({title:ct,desc:(ha||mode==='audio')?'播放 / 阅读':'阅读章节',col_type:'text_2',url:fictionChapterUrl(info.id,cid,ct,mode),extra:{content_kind:'fiction_chapter',fiction_id:info.id,fiction_chapter_id:cid,fiction_chapter_title:ct,lineVisible:false}})
    }
    if(!chapters.length)d.push({title:'暂未返回章节',desc:'作品列表已恢复，但详情接口没有给出可识别章节目录。',col_type:'long_text',url:'hiker://empty'});
    setResult(d)
}
function fictionReader(fid,cid,mode){
    var d=[],fallback=S(param('fiction_chapter_title')||'章节'),obj=ac.__v060a9FictionChapter?ac.__v060a9FictionChapter(fid,cid):{},ct=S(pick(obj,['chapterTitle','chapterName','title','name'],fallback)||fallback);mode=fictionMode(obj,mode);
    var payload=ac.__v060a9ExpandChapter?ac.__v060a9ExpandChapter(obj,mode):(ac.__v060a9ChapterPayload?ac.__v060a9ChapterPayload(obj,mode):{texts:[],audios:[],images:[],sources:[]});setPageTitle(ct);
    if(payload.audios&&payload.audios.length){
        d.push({title:'▶ 播放本章音频',desc:payload.audios.length>1?'含备用音频源':'',pic_url:I('audio'),img:I('audio'),col_type:'text_icon',url:payload.audios[0]+'#isMusic=true#',extra:{lineVisible:false}});
        for(var a=1;a<Math.min(payload.audios.length,4);a++)d.push({title:'备用音频 '+(a+1),col_type:'text_2',url:payload.audios[a]+'#isMusic=true#',extra:{lineVisible:false}})
    }
    if(payload.texts&&payload.texts.length){
        if(d.length)d.push({col_type:'line'});var body=payload.texts.join('\n\n');d.push({title:paragraphHtml(body),col_type:'rich_text',url:'hiker://empty',extra:{textSize:16,lineVisible:false}})
    }
    if(payload.images&&payload.images.length){if(d.length)d.push({col_type:'line'});for(var i=0;i<payload.images.length;i++)d.push({title:'',pic_url:ac.image(payload.images[i]),img:ac.image(payload.images[i]),col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}})}
    if(!d.length&&payload.sources&&payload.sources.length){
        d.push({title:'打开原始章节内容',desc:payload.sources[0],col_type:'text_1',url:payload.sources[0],extra:{lineVisible:false}})
    }
    if(!d.length)d.push({title:'本章暂未恢复正文或音频',desc:'Alpha9 已尝试 chapterInfo GET/POST、多组章节参数、fictionUrl 外链正文以及 longFormAudio/voice/media 字段。若这一章仍为空，请继续保留该截图用于下一轮定点协议校准。',col_type:'long_text',url:'hiker://empty'});
    setResult(d)
}

function dynamicDetail(id){
    var d=[],apiObj={};try{apiObj=ac.__v060a4Detail('community/dynamic/dynamicInfo',{dynamicId:N(id)},'dynamic','dynamic|a9|'+id)||{}}catch(e){}
    var seedObj=seed('acfun_v060_dynamic_seed_',id),bundle={seed:seedObj,detail:apiObj},hasApi=false;for(var kk in apiObj){hasApi=true;break}var info=ac.__v060a4DynamicInfo(hasApi?apiObj:seedObj);if(!info.id)info.id=id;
    var payload=ac.__v060a9DynamicPayload?ac.__v060a9DynamicPayload(bundle):(ac.__v060a8DynamicPayload?ac.__v060a8DynamicPayload(bundle):{texts:[info.content||info.title||''],images:[],videos:[],links:[]});
    var tm='';try{tm=ac.__v060a7HumanTime?ac.__v060a7HumanTime(pick(apiObj,['createTime','createdAt','publishTime','time'],pick(seedObj,['createTime','createdAt','publishTime','time'],''))):''}catch(e0){}
    setPageTitle('社区动态');
    var avatar=info.avatar?ac.image(info.avatar):I('community_off');d.push({title:info.author||'ACFun 用户',desc:tm,pic_url:avatar,img:avatar,col_type:'avatar',url:'hiker://empty',extra:{lineVisible:false}});
    var shown=0;for(var i=0;i<(payload.texts||[]).length;i++){var t=cleanText(payload.texts[i]);if(!t)continue;d.push({title:paragraphHtml(t),col_type:'rich_text',url:'hiker://empty',extra:{textSize:16,lineVisible:false}});shown++}
    for(var j=0;j<(payload.images||[]).length;j++){d.push({title:'',pic_url:ac.image(payload.images[j]),img:ac.image(payload.images[j]),col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}});shown++}
    if(payload.videos&&payload.videos.length){d.push({col_type:'line'});for(var v=0;v<payload.videos.length;v++)d.push({title:'播放帖子视频 '+(v+1),pic_url:I('video'),img:I('video'),col_type:'text_icon',url:payload.videos[v]+'#isVideo=true#',extra:{lineVisible:false}})}
    if(payload.links&&payload.links.length){d.push({col_type:'line'});for(var l=0;l<Math.min(payload.links.length,5);l++)d.push({title:'打开外链 '+(l+1),desc:payload.links[l],col_type:'text_1',url:payload.links[l],extra:{lineVisible:false}})}
    d.push({col_type:'line'});action(d,'评论','comment',ac.__v060a4CommentsUrl('dynamic',info.id,info.title));action(d,'复制','more','copy://'+((payload.texts||[]).join('\n\n')||info.content||info.title||''));action(d,'搜索','search','hiker://page/acfun_search_center?rule=ACFun&simple=true#noRecordHistory#');
    if(!shown&&!(payload.videos&&payload.videos.length))d.push({title:'帖子详情仍不完整',desc:'已合并 Feed 原始对象 + dynamicInfo 详情，并过滤头像/徽章等非正文图片。',col_type:'long_text',url:'hiker://empty'});
    setResult(d)
}

ac.detail=function(){
    var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},kind=S(p.content_kind||param('content_kind')||'video'),mode=S(p.fiction_mode||param('fiction_mode')||'fiction');
    if(kind==='fiction'){var id=S(p.fiction_id||param('fiction_id')||param('content_id'));return fictionDetail(id,mode)}
    if(kind==='fiction_chapter'){var fid=S(p.fiction_id||param('fiction_id')||param('content_id')),cid=S(p.fiction_chapter_id||param('fiction_chapter_id'));return fictionReader(fid,cid,mode)}
    if(kind==='dynamic'){var did=S(p.dynamic_id||param('dynamic_id')||param('content_id'));return dynamicDetail(did)}
    return typeof oldDetail==='function'?oldDetail.call(ac):undefined
};
ac.build='2026.08.22-v0.6.0-alpha9';try{setItem('acfun_v060_detail_a9','fiction content/audio recovery + dynamic seed detail')}catch(e){}
})();