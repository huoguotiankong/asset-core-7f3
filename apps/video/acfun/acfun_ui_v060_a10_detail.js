/** ACFun 0.6.0-alpha10 / Build 161 - fiction/audio reader + community detail recovery. */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var oldDetail=ac.detail,BASE='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/assets/';
function S(v){return String(v===undefined||v===null?'':v)}
function N(v){var s=S(v);return /^\d+$/.test(s)?Number(s):s}
function E(v){return S(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function I(n){return BASE+n+'.svg'}
function param(k){try{return S(getParam(k,''))}catch(e){return''}}
function pick(o,ks,d){try{return ac.pick(o||{},ks,d)}catch(e){return d}}
function seed(prefix,id){try{return JSON.parse(getItem(prefix+S(id),'{}'))||{}}catch(e){return{}}}
function mergeObj(a,b){var x={},k;for(k in(a||{}))x[k]=a[k];for(k in(b||{}))if(b[k]!==undefined&&b[k]!==null&&b[k]!=='')x[k]=b[k];return x}
function cleanText(v){var s=S(v);s=s.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,function(_,t,u){return t===u?u:t+'\n'+u});s=s.replace(/(https?:\/\/\S+)\s*\(\1\)/g,'$1').replace(/\r/g,'').replace(/\n{3,}/g,'\n\n');return s.trim()}
function paragraphHtml(v){var s=cleanText(v);if(!s)return'';var a=s.split(/\n+/),o=[];for(var i=0;i<a.length;i++){var p=a[i].trim();if(p)o.push(E(p))}return o.join('<br><br>')}
function action(d,name,icon,url){d.push({title:name,pic_url:I(icon),img:I(icon),col_type:'icon_small_3',url:url,extra:{lineVisible:false}})}
function fictionMode(obj,fallback){if(fallback==='audio')return'audio';var t=S(pick(obj,['fictionType','type'],'')||''),la=pick(obj,['longFormAudio','isAudio'],'');if(t==='2'||t.toLowerCase()==='audio'||la===true||la===1||S(la)==='1')return'audio';return'fiction'}
function chapterUrl(fid,cid,ct,mode){return'hiker://page/acfun_detail?rule=ACFun&simple=true&content_kind=fiction_chapter&fiction_id='+encodeURIComponent(S(fid))+'&fiction_chapter_id='+encodeURIComponent(S(cid))+'&fiction_chapter_title='+encodeURIComponent(S(ct))+'&fiction_mode='+encodeURIComponent(mode)+'#noRecordHistory#'}

function fictionDetail(id,mode){
    var d=[],seedObj=seed('acfun_v060_fiction_seed_',id),apiObj=ac.__v060a10FictionDetail?ac.__v060a10FictionDetail(id):{},obj=mergeObj(seedObj,apiObj),info=ac.__v060a4FictionInfo(obj);if(!info.id)info.id=id;if(!info.title||info.title==='未命名小说')info.title=S(param('fiction_title')||pick(seedObj,['fictionTitle','title'],'小说详情'));
    mode=fictionMode(obj,mode);setPageTitle(info.title);var pic=info.img?ac.image(info.img):I(mode==='audio'?'audio':'novel');try{if(info.img)setPagePicUrl(ac.image(info.img))}catch(e){}
    d.push({title:info.title,desc:[info.author,info.status].filter(function(v){return!!S(v)}).join(' · '),pic_url:pic,img:pic,col_type:'movie_1_left_pic',url:'hiker://empty',extra:{lineVisible:false}});
    action(d,'收藏','favorite',$('hiker://empty#noLoading#').lazyRule(function(fid,ft,fi){var key='acfun_fiction_favs',a=[];try{a=JSON.parse(getItem(key,'[]'))||[]}catch(e){}a=(Array.isArray(a)?a:[]).filter(function(x){return String(x.id)!==String(fid)});a.unshift({id:String(fid),title:String(ft),img:String(fi),time:Date.now()});setItem(key,JSON.stringify(a.slice(0,300)));return'toast://已加入收藏'},info.id,info.title,info.img));
    action(d,'评论','comment',ac.__v060a4CommentsUrl('fiction',info.id,info.title));action(d,'搜索','search','hiker://search?s='+encodeURIComponent(info.title)+'&rule=ACFun&scope=fiction');
    if(info.desc){d.push({col_type:'line'});d.push({title:'作品简介',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});d.push({title:paragraphHtml(info.desc),col_type:'rich_text',url:'hiker://empty',extra:{textSize:14,lineVisible:false}})}
    var work=ac.__v060a10ChapterPayload?ac.__v060a10ChapterPayload(obj,mode):{audios:[]};if(work.audios&&work.audios.length){d.push({col_type:'line'});d.push({title:'▶ 播放作品音频',desc:'检测到 '+work.audios.length+' 个音频源',pic_url:I('audio'),img:I('audio'),col_type:'text_icon',url:work.audios[0]+'#isMusic=true#',extra:{lineVisible:false}})}
    var chapters=ac.__v060a10ChapterRows?ac.__v060a10ChapterRows(obj):[];d.push({col_type:'line'});d.push({title:'章节目录',desc:chapters.length+' 章',col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    for(var i=0;i<chapters.length;i++){var x=chapters[i],cid=S(x.id),ct=S(x.title||('第 '+(i+1)+' 章'));d.push({title:ct,desc:mode==='audio'?'播放 / 阅读':'阅读章节',col_type:'text_2',url:chapterUrl(info.id,cid,ct,mode),extra:{content_kind:'fiction_chapter',fiction_id:info.id,fiction_chapter_id:cid,fiction_chapter_title:ct,lineVisible:false}})}
    if(!chapters.length)d.push({title:'暂未返回章节目录',desc:'作品列表与详情已经返回，但当前对象没有可识别 chapterId。',col_type:'long_text',url:'hiker://empty'});setResult(d)
}
function fictionReader(fid,cid,mode){
    var d=[],obj=ac.__v060a10FictionChapter?ac.__v060a10FictionChapter(fid,cid):{},fallback=S(param('fiction_chapter_title')||'章节'),ct=S(pick(obj,['chapterTitle','chapterName','title','name'],fallback)||fallback);mode=fictionMode(obj,mode);var p=ac.__v060a10ExpandChapter?ac.__v060a10ExpandChapter(obj,mode):(ac.__v060a10ChapterPayload?ac.__v060a10ChapterPayload(obj,mode):{texts:[],audios:[],images:[],sources:[]});setPageTitle(ct);
    if(p.audios&&p.audios.length){d.push({title:'▶ 播放本章音频',desc:p.audios.length>1?'可在线路中切换备用源':'',pic_url:I('audio'),img:I('audio'),col_type:'text_icon',url:p.audios[0]+'#isMusic=true#',extra:{lineVisible:false}});for(var a=1;a<Math.min(p.audios.length,4);a++)d.push({title:'备用音频 '+(a+1),col_type:'text_2',url:p.audios[a]+'#isMusic=true#',extra:{lineVisible:false}})}
    if(p.texts&&p.texts.length){if(d.length)d.push({col_type:'line'});var body=p.texts.join('\n\n');d.push({title:paragraphHtml(body),col_type:'rich_text',url:'hiker://empty',extra:{textSize:16,lineVisible:false}})}
    if(p.images&&p.images.length){if(d.length)d.push({col_type:'line'});for(var i=0;i<p.images.length;i++)d.push({title:'',pic_url:ac.image(p.images[i]),img:ac.image(p.images[i]),col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}})}
    if(!d.length){d.push({title:'本章正文/音频仍未解析成功',desc:p.sources&&p.sources.length?'已经拿到章节源地址，但当前网络读取未得到正文。下一版可继续根据该源定点处理。':'chapterInfo 当前没有返回可识别正文、音频或外部源。',col_type:'long_text',url:'hiker://empty'});d.push({title:'重新读取',pic_url:I('history'),img:I('history'),col_type:'text_icon',url:$('hiker://empty#noLoading#').lazyRule(function(){refreshPage(false);return'hiker://empty'}),extra:{lineVisible:false}})}
    setResult(d)
}

function dynPayload(root){
    var out={texts:[],images:[],videos:[],links:[]},st={},si={},sv={},sl={},count=0,textKeys={content:1,dynamicContent:1,contentText:1,text:1,body:1,markdown:1,description:1,desc:1,summary:1,remark:1,title:1};
    function add(a,s,v){v=S(v).trim();if(!v||s[v])return;s[v]=1;a.push(v)}
    function rec(v,key,ctx,d){if(v===undefined||v===null||d>11||count>18000)return;var path=(ctx?ctx+'/':'')+S(key),low=path.toLowerCase();if(typeof v==='string'){var s=v.trim();if((s.charAt(0)==='{'||s.charAt(0)==='[')&&s.length<1000000)try{rec(JSON.parse(s),key,ctx,d+1)}catch(e){}if(textKeys[key]&&s&&!/^https?:\/\//i.test(s))add(out.texts,st,cleanText(s));if(/^https?:\/\//i.test(s)){if(/avatar|head|badge|frame|icon|logo/.test(low))return;if(/video|media|play/.test(low)||/\.(?:mp4|m3u8|webm)(?:\?|$)/i.test(s))add(out.videos,sv,s);else if(/image|img|picture|pic|cover|gif/.test(low)||/\.(?:png|jpe?g|webp|gif)(?:\?|$)/i.test(s))add(out.images,si,s);else add(out.links,sl,s)}return}if(Array.isArray(v)){for(var i=0;i<v.length;i++)rec(v[i],String(i),path,d+1);return}if(typeof v!=='object')return;count++;for(var k in v)rec(v[k],k,path,d+1)}rec(root,'','',0);return out
}
function dynamicDetail(id){
    var d=[],seedObj=seed('acfun_v060_dynamic_seed_',id),apiObj={};try{apiObj=ac.__v060a4Detail('community/dynamic/dynamicInfo',{dynamicId:N(id)},'dynamic','dynamic|a10|'+id)||{}}catch(e){}var bundle={seed:seedObj,detail:apiObj},info=ac.__v060a4DynamicInfo(Object.keys(apiObj).length?apiObj:seedObj);if(!info.id)info.id=id;var p=dynPayload(bundle),tm='';try{tm=ac.__v060a7HumanTime?ac.__v060a7HumanTime(pick(apiObj,['createTime','createdAt','publishTime','time'],pick(seedObj,['createTime','createdAt','publishTime','time'],''))):''}catch(e0){}
    setPageTitle('社区动态');var avatar=info.avatar?ac.image(info.avatar):I('community_off');d.push({title:info.author||'ACFun 用户',desc:tm,pic_url:avatar,img:avatar,col_type:'avatar',url:'hiker://empty',extra:{lineVisible:false}});
    for(var i=0;i<p.texts.length;i++){var t=cleanText(p.texts[i]);if(t)d.push({title:paragraphHtml(t),col_type:'rich_text',url:'hiker://empty',extra:{textSize:16,lineVisible:false}})}
    for(var j=0;j<p.images.length;j++)d.push({title:'',pic_url:ac.image(p.images[j]),img:ac.image(p.images[j]),col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}});
    if(p.videos.length){d.push({col_type:'line'});for(var v=0;v<p.videos.length;v++)d.push({title:'播放帖子视频 '+(v+1),pic_url:I('video'),img:I('video'),col_type:'text_icon',url:p.videos[v]+'#isVideo=true#',extra:{lineVisible:false}})}
    if(p.links.length){d.push({col_type:'line'});for(var l=0;l<Math.min(p.links.length,4);l++)d.push({title:'打开外链 '+(l+1),desc:p.links[l],col_type:'text_1',url:p.links[l],extra:{lineVisible:false}})}
    d.push({col_type:'line'});action(d,'评论','comment',ac.__v060a4CommentsUrl('dynamic',info.id,info.title));action(d,'复制','more','copy://'+(p.texts.join('\n\n')||info.content||info.title||''));action(d,'搜索','search','hiker://page/acfun_search_center?rule=ACFun&simple=true#noRecordHistory#');if(!p.texts.length&&!p.images.length&&!p.videos.length)d.push({title:'帖子详情仍不完整',desc:'已经合并首页 Feed 与 dynamicInfo，当前响应没有更多正文媒体。',col_type:'long_text',url:'hiker://empty'});setResult(d)
}

ac.detail=function(){var p=typeof MY_PARAMS==='object'?MY_PARAMS:{},kind=S(p.content_kind||param('content_kind')||'video'),mode=S(p.fiction_mode||param('fiction_mode')||'fiction');if(kind==='fiction'){var id=S(p.fiction_id||param('fiction_id')||param('content_id'));return fictionDetail(id,mode)}if(kind==='fiction_chapter'){var fid=S(p.fiction_id||param('fiction_id')||param('content_id')),cid=S(p.fiction_chapter_id||param('fiction_chapter_id'));return fictionReader(fid,cid,mode)}if(kind==='dynamic'){var did=S(p.dynamic_id||param('dynamic_id')||param('content_id'));return dynamicDetail(did)}return typeof oldDetail==='function'?oldDetail.call(ac):undefined};
ac.build='2026.08.22-v0.6.0-alpha10';try{setItem('acfun_v060_detail_a10','fiction txt/audio reader + community seed merge')}catch(e){}
})();