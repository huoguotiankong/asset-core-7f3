/** ACFun 0.6.0-alpha10 / Build 161
 * Recovery overlay based on Alpha8: cover normalization, fiction/audio taxonomy,
 * current playback rescue, and chapter text/audio source resolution.
 */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
function S(v){return String(v===undefined||v===null?'':v)}
function N(v){var s=S(v);return /^\d+$/.test(s)?Number(s):s}
function copy(o){var x={};for(var k in (o||{}))x[k]=o[k];return x}
function pick(o,ks,d){try{return ac.pick(o||{},ks,d)}catch(e){return d}}
function state(k,def){return S(getMyVar(k,'')||getItem('acfun_v060_state_'+k,def||'')||def||'')}
function save(k,v){try{if(v){putMyVar(k,S(v));setItem('acfun_v060_state_'+k,S(v))}else{clearMyVar(k);setItem('acfun_v060_state_'+k,'')}}catch(e){}}
function pageSize(){return Number(getItem('acfun_page_size','12'))||12}
function uniqRows(rows){var out=[],seen={};for(var i=0;i<(rows||[]).length;i++){var x=rows[i]||{},id=S(x.id),name=S(x.name).replace(/\s+/g,' ').trim();if(!id||!name)continue;var key=id+'|'+name;if(seen[key])continue;seen[key]=1;out.push(x)}return out}
function userLabel(n){n=S(n).replace(/\s+/g,' ').trim();if(!n)return'';try{if(ac.__v060VisibleCategoryName&&!ac.__v060VisibleCategoryName(n,'fiction'))return''}catch(e){}if(/^(?:fictiontag|tag|category)[-_][a-z0-9_-]{4,}$/i.test(n))return'';return n}

var oldFirstMedia=ac.__v042FirstMedia;
ac.__v060a10FirstMedia=function(v,depth){
    depth=depth||0;if(v===undefined||v===null||depth>8)return'';
    if(typeof v==='string'||typeof v==='number')return S(v);
    if(Array.isArray(v)){for(var i=0;i<v.length&&i<12;i++){var a=ac.__v060a10FirstMedia(v[i],depth+1);if(a)return a}return''}
    if(typeof v==='object'){
        var ks=['imgUrl','imageUrl','coverUrl','coverPicture','videoCoverImg','comicsCoverImg','fictionCoverImg','url','src','path','image','img','cover','value','thumb','thumbnail','poster','verticalCover','generatedCoverImg','templateCoverImg'];
        for(var j=0;j<ks.length;j++)if(v[ks[j]]!==undefined){var b=ac.__v060a10FirstMedia(v[ks[j]],depth+1);if(b)return b}
    }
    try{return typeof oldFirstMedia==='function'?S(oldFirstMedia(v)||''):''}catch(e){return''}
};
ac.__v042FirstMedia=function(v){return ac.__v060a10FirstMedia(v,0)};
function deepMedia(root){
    var out='',visited=0,keys={coverImg:1,videoCover:1,videoCoverImg:1,videoImg:1,coverUrl:1,coverPicture:1,comicsCover:1,comicsCoverImg:1,fictionImg:1,fictionCover:1,fictionCoverImg:1,verticalCover:1,poster:1,picUrl:1,imageUrl:1,imgUrl:1,thumb:1,thumbnail:1,generatedCoverImg:1,templateCoverImg:1};
    function walk(v,d){if(out||v===undefined||v===null||d>9||visited>12000)return;if(Array.isArray(v)){for(var i=0;i<v.length;i++)walk(v[i],d+1);return}if(typeof v!=='object')return;visited++;for(var k in v){if(keys[k]){var u=ac.__v060a10FirstMedia(v[k],0);if(u){out=u;return}}}for(var k2 in v)if(v[k2]&&typeof v[k2]==='object')walk(v[k2],d+1)}
    walk(root,0);return out
}
function resolveMedia(root,u){
    u=S(u).trim();if(!u)return'';if(/^https?:\/\//i.test(u)||u.indexOf('//')===0)return u.indexOf('//')===0?'https:'+u:u;
    var domain='';try{domain=S(ac.deepFind(root,['imgDomain','imageDomain','cdnDomain','domain'],0)||'')}catch(e){}
    if(domain){domain=domain.replace(/\/+$/,'');return domain+'/'+u.replace(/^\/+/, '')}
    try{return ac.__v042Plain?ac.__v042Plain(u):u}catch(e2){return u}
}
var oldItemInfo=ac.itemInfo;
ac.itemInfo=function(x){
    var info={};try{info=typeof oldItemInfo==='function'?oldItemInfo.call(ac,x):{}}catch(e){info={}}
    info=info||{};var raw=info.raw||x||{},cand=deepMedia(x||raw);if(!info.img&&cand)info.img=cand;if(info.img)info.img=resolveMedia(x||raw,info.img);info.raw=raw;return info
};
var oldComicInfo=ac.__v060a4ComicInfo;
ac.__v060a4ComicInfo=function(x){var i={};try{i=typeof oldComicInfo==='function'?oldComicInfo.call(ac,x):{}}catch(e){i={}}i=i||{};if(!i.img)i.img=deepMedia(x);if(i.img)i.img=resolveMedia(x,i.img);i.raw=i.raw||x||{};i.kind='comic';return i};
var oldFictionInfo=ac.__v060a4FictionInfo;
ac.__v060a4FictionInfo=function(x){var i={};try{i=typeof oldFictionInfo==='function'?oldFictionInfo.call(ac,x):{}}catch(e){i={}}i=i||{};if(!i.img)i.img=deepMedia(x);if(i.img)i.img=resolveMedia(x,i.img);i.raw=i.raw||x||{};i.kind='fiction';return i};

function categoryRows(raw){
    var rows=[];try{rows=ac.__v060a4Collect?ac.__v060a4Collect(raw,'category'):[]}catch(e){}
    var out=[];for(var i=0;i<rows.length;i++){var x=rows[i]||{},id=S(pick(x,['fictionTagId','tagId','categoryId','classifyId','id','value'],'')||''),name=userLabel(pick(x,['fictionTagName','tagName','categoryName','classifyName','tagTitle','name','title'],'')||'');if(id&&name)out.push({id:id,name:name,raw:x})}
    out=uniqRows(out);try{return ac.__v060a7SanitizeRows?ac.__v060a7SanitizeRows(out,'fiction'):out}catch(e2){return out}
}
function requestRaw(path,params,method){try{return ac.__v043Api(path,params||{},method==='POST'?{method:'POST',write:true,allowGet:false,timeout:1600,maxAttempts:2}:{timeout:1500,maxAttempts:2})}catch(e){try{setItem('acfun_v060_a10_last_error',path+' '+method+': '+S(e.message||e))}catch(e0){}return null}}
function cachedRows(key,ttl,stale,loader){
    var c=ac.__v060a4Read?ac.__v060a4Read('a10|'+key,ttl||300,stale||3600):{hit:false,fresh:false,data:null},old=c.hit&&Array.isArray(c.data)?c.data:[];if(c.fresh&&old.length)return old;var rows=[];try{rows=loader()||[]}catch(e){}if(rows.length){try{if(ac.__v060a4Write)ac.__v060a4Write('a10|'+key,rows)}catch(e2){}return rows}return old
}
var alpha8Tags=ac.__v060a4FictionTags;
ac.__v060a10FictionTags=function(mode){
    mode=mode==='audio'?'audio':'fiction';return cachedRows('fiction-tags|'+mode,21600,604800,function(){
        var type=mode==='audio'?2:1,specs=[{fictionType:type},{type:type},{fictionType:type,isAudio:mode==='audio'?1:0},{}],methods=['GET','POST'];
        for(var i=0;i<specs.length;i++)for(var j=0;j<methods.length;j++){var rows=categoryRows(requestRaw('fiction/other/tagList',specs[i],methods[j]));if(rows.length)return rows}
        try{return typeof alpha8Tags==='function'?(alpha8Tags.call(ac)||[]):[]}catch(e){return[]}
    })
};
ac.__v060a4FictionTags=function(mode){return ac.__v060a10FictionTags(mode||'fiction')};

function collectFiction(root){
    if(ac.__v060a9CollectFiction)try{return ac.__v060a9CollectFiction(root)}catch(e){}
    var out=[];try{out=ac.__v060a4Collect?ac.__v060a4Collect(root,'fiction'):[]}catch(e2){}
    if(out.length)return out;
    var seen={},n=0;
    function walk(v,d){if(v===undefined||v===null||d>10||n>14000)return;if(Array.isArray(v)){for(var i=0;i<v.length;i++)walk(v[i],d+1);return}if(typeof v!=='object')return;n++;var id=S(pick(v,['fictionId','fictionID','bookId','novelId','id'],'')||''),title=S(pick(v,['fictionTitle','bookTitle','bookName','novelTitle','novelName','title','name'],'')||'');if(id&&title&&!seen[id+'|'+title]){seen[id+'|'+title]=1;out.push(v)}for(var k in v)if(v[k]&&typeof v[k]==='object')walk(v[k],d+1)}walk(root,0);return out
}
function fictionFeedSpecs(page,mode,tag,sort){
    var size=pageSize(),base={page:page,pageNum:page,pageSize:size,limit:size,sortType:sort},ps=[],p;
    function addTag(x){if(tag){x.tagId=N(tag);x.fictionTagId=N(tag);x.categoryId=N(tag);x.tagIds=[N(tag)]}return x}
    if(mode==='audio'){
        p=addTag(copy(base));p.fictionType=2;p.isAudio=1;ps.push(p);
        p=addTag(copy(base));p.fictionType=2;ps.push(p);
        p=addTag(copy(base));p.longFormAudio=1;ps.push(p);
        p=addTag(copy(base));p.isAudio=1;ps.push(p);
        p=addTag(copy(base));p.type=2;p.audio=1;ps.push(p);
        p=addTag(copy(base));p.type='audio';ps.push(p)
    }else{
        p=addTag(copy(base));p.fictionType=1;ps.push(p);
        p=addTag(copy(base));p.fictionType=0;ps.push(p);
        p=addTag(copy(base));p.type=1;ps.push(p);
        p=addTag(copy(base));p.type='fiction';ps.push(p);
        ps.push(addTag(copy(base)))
    }
    var specs=[];for(var i=0;i<ps.length;i++){specs.push({params:ps[i],method:'GET'});specs.push({params:ps[i],method:'POST'})}return specs
}
function fictionFeed(page,mode,tag,sort){
    return cachedRows('fiction-feed|'+mode+'|'+tag+'|'+sort+'|'+page,90,3600,function(){var sp=fictionFeedSpecs(page,mode,tag,sort);for(var i=0;i<sp.length;i++){var rows=collectFiction(requestRaw('fiction/base/findList',sp[i].params,sp[i].method));if(rows.length)return rows}return[]})
}
ac.__v060a4FictionList=function(page,mode){
    page=Number(page||1);mode=mode==='audio'?'audio':'fiction';var tags=ac.__v060a10FictionTags(mode),selected=state('acfun_v060_fiction_tag_'+mode,''),valid='';for(var i=0;i<tags.length;i++)if(S(tags[i].id)===selected){valid=selected;break}if(selected&&!valid)save('acfun_v060_fiction_tag_'+mode,'');var sort=Number(state('acfun_v060_fiction_sort_'+mode,'1')||1),rows=fictionFeed(page,mode,valid,sort);if(!rows.length&&valid)rows=fictionFeed(page,mode,'',sort);return rows
};

var alpha8Play=ac.play;
function playCandidate(v){v=S(v).trim();if(!v)return'';if(/^https?:\/\//i.test(v)){if(/\.(?:m3u8|mp4|m4v|webm)(?:\?|$)/i.test(v)||/\/m3u8\//i.test(v))return v;return''}if(/\.m3u8(?:\?|$)/i.test(v)||/^[a-z0-9_-]+\/.*\.m3u8/i.test(v))return v;return''}
function decodeCandidate(v){v=playCandidate(v);if(!v)return'';if(/^https?:\/\//i.test(v))return v;try{return ac.__v043DecodePlayUrl?ac.__v043DecodePlayUrl(v):v}catch(e){return v}}
function firstString(v){try{return ac.__v043FirstString?S(ac.__v043FirstString(v)||''):S(v)}catch(e){return S(v)}}
function addLine(lines,seen,name,url){url=S(url).trim();if(!url||seen[url])return;seen[url]=1;lines.push({name:name,url:url})}
ac.play=function(id,raw,direct){
    id=S(id);var obj=ac.safeJson(raw)||{},rawText='';try{rawText=JSON.stringify(obj)}catch(e){}var isShort=/shortVideo|short_video/i.test(rawText),directPath=decodeCandidate(firstString(direct)),rawPath='';
    var candidates=['videoUrl','playUrl','videoUri','path','m3u8','playPath'];for(var i=0;i<candidates.length&&!rawPath;i++)if(obj[candidates[i]]!==undefined)rawPath=decodeCandidate(firstString(obj[candidates[i]]));
    var fresh='';if(id){try{var w=ac.__v043Api('video/can/watch',{videoId:/^\d+$/.test(id)?Number(id):id},{method:'POST',write:true,allowGet:false,timeout:1600,maxAttempts:2}),p=firstString(w&&w.path!==undefined?w.path:w);fresh=decodeCandidate(p)}catch(e2){try{setItem('acfun_last_play_error',S(e2.message||e2))}catch(e3){}}}
    var lines=[],seen={};if(isShort&&directPath)addLine(lines,seen,'短视频直连',directPath);if(fresh)addLine(lines,seen,'当前线路',fresh);if(directPath)addLine(lines,seen,'直连备用',directPath);if(rawPath)addLine(lines,seen,'列表备用',rawPath);
    if(!lines.length){try{return typeof alpha8Play==='function'?alpha8Play.call(ac,id,raw,direct):'toast://未获取到播放地址'}catch(e4){return'toast://未获取到播放地址'}}
    var headers=[];for(var j=0;j<lines.length;j++)headers.push(ac.__v045PlayerHeaders?ac.__v045PlayerHeaders():(ac.__v043PlayerHeaders?ac.__v043PlayerHeaders():{'User-Agent':ac.ua||'Mozilla/5.0'}));
    var ret={urls:lines.map(function(x){return x.url}),names:lines.map(function(x){return x.name}),headers:headers};try{var dm=ac.__v045CachedDanmu?ac.__v045CachedDanmu(id):'';if(dm)ret.danmu=dm}catch(e5){}
    try{setItem('acfun_v060_a10_play_lines',JSON.stringify(lines));setItem('acfun_v060_a10_play_id',id)}catch(e6){}return JSON.stringify(ret)
};

function seed(prefix,id){try{return JSON.parse(getItem(prefix+S(id),'{}'))||{}}catch(e){return{}}}
function mergeObj(a,b){var x={},k;for(k in (a||{}))x[k]=a[k];for(k in (b||{}))if(b[k]!==undefined&&b[k]!==null&&b[k]!=='')x[k]=b[k];return x}
function detailRequest(path,paramList,key){
    var c=ac.__v060a4Read?ac.__v060a4Read('a10|detail|'+key,900,86400):{hit:false,fresh:false,data:null},old=c.hit&&c.data&&typeof c.data==='object'?c.data:{};if(c.fresh&&old&&Object.keys(old).length)return old;
    for(var i=0;i<paramList.length;i++)for(var m=0;m<2;m++){var raw=requestRaw(path,paramList[i],m?'POST':'GET');if(raw&&typeof raw==='object'){var obj=raw;if(ac.parseResp)try{obj=ac.parseResp(raw)||raw}catch(e){}if(obj&&typeof obj==='object'){try{if(ac.__v060a4Write)ac.__v060a4Write('a10|detail|'+key,obj)}catch(e2){}return obj}}}
    return old||{}
}
ac.__v060a10FictionDetail=function(id){var n=N(id),s=seed('acfun_v060_fiction_seed_',id),o=detailRequest('fiction/base/info',[{fictionId:n},{id:n},{bookId:n},{novelId:n}],'fiction|'+id);return mergeObj(s,o)};
ac.__v060a10FictionChapter=function(fid,cid){var f=N(fid),c=N(cid);return detailRequest('fiction/base/chapterInfo',[{fictionId:f,chapterId:c},{fictionId:f,fictionChapterId:c},{bookId:f,chapterId:c},{novelId:f,chapterId:c},{fictionId:f,id:c},{chapterId:c}], 'chapter|'+fid+'|'+cid)};
function resolveUrl(root,u){
    u=S(u).trim();if(!u)return'';if(/^https?:\/\//i.test(u))return u;if(u.indexOf('//')===0)return'https:'+u;
    var domain='';try{domain=S(ac.deepFind(root,['audioDomain','playbackDomain','mediaDomain','domain','host'],0)||'')}catch(e){}if(domain&&/^https?:\/\//i.test(domain))return domain.replace(/\/+$/,'')+'/'+u.replace(/^\/+/, '');
    try{return ac.absoluteUrl((ac.frontendBase||'')+'/',u)}catch(e2){return u}
}
function addUnique(arr,seen,v){v=S(v).trim();if(!v||seen[v])return;seen[v]=1;arr.push(v)}
function htmlText(raw){var s=S(raw);if(!s)return'';s=s.replace(/^\uFEFF/,'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<(?:br|p|div|li|h\d)[^>]*>/gi,'\n').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&#39;/g,"'").replace(/&quot;/gi,'"').replace(/\r/g,'').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();return s}
ac.__v060a10ChapterPayload=function(root,mode){
    var out={texts:[],audios:[],images:[],sources:[]},st={},sa={},si={},ss={},count=0;
    var textRe=/(^|\/)(chapterContent|fictionContent|content|text|contentText|body|paragraph|paragraphs|paragraphList|contentList|html|chapterText)$/i;
    var audioRe=/audio|voice|sound|longform|media|play/i,imageRe=/image|img|picture|pic|cover|thumb|poster/i,sourceRe=/fictionurl|contenturl|readurl|chapterurl|sourceurl/i;
    function rec(v,key,ctx,d){if(v===undefined||v===null||d>12||count>22000)return;var path=(ctx?ctx+'/':'')+S(key);
        if(typeof v==='string'){
            var s=v.trim();if((s.charAt(0)==='{'||s.charAt(0)==='[')&&s.length<1000000)try{rec(JSON.parse(s),key,ctx,d+1)}catch(e){}
            if(textRe.test(path)&&s&&!/^https?:\/\//i.test(s)){var t=/<[^>]+>/.test(s)?htmlText(s):s;if(t.length>1)addUnique(out.texts,st,t)}
            if(/^https?:\/\//i.test(s)||s.indexOf('//')===0||/\.(?:mp3|m4a|aac|wav|ogg|m3u8|txt|html?)(?:\?|$)/i.test(s)){
                var u=resolveUrl(root,s),low=path.toLowerCase(),extAudio=/\.(?:mp3|m4a|aac|wav|ogg|m3u8)(?:\?|$)/i.test(u),isTxt=/\.(?:txt|html?)(?:\?|$)/i.test(u);
                if(sourceRe.test(low)||isTxt)addUnique(out.sources,ss,u);
                if((audioRe.test(low)||extAudio)&&!isTxt)addUnique(out.audios,sa,u);
                if(imageRe.test(low)||/\.(?:png|jpe?g|webp|gif)(?:\?|$)/i.test(u))addUnique(out.images,si,u)
            }
            return
        }
        if(Array.isArray(v)){for(var i=0;i<v.length;i++)rec(v[i],String(i),path,d+1);return}if(typeof v!=='object')return;count++;for(var k in v)rec(v[k],k,path,d+1)
    }
    rec(root,'','',0);return out
};
function mergePayload(a,b){var out={texts:[],audios:[],images:[],sources:[]},ks=['texts','audios','images','sources'];for(var z=0;z<ks.length;z++){var k=ks[z],seen={};var all=(a&&a[k]||[]).concat(b&&b[k]||[]);for(var i=0;i<all.length;i++)addUnique(out[k],seen,all[i])}return out}
function readExternal(u){
    var h={'User-Agent':ac.ua||'Mozilla/5.0','Referer':ac.frontendBase||''},raw='';
    try{if(typeof request==='function')raw=request(u,{timeout:3500,headers:h})}catch(e){}
    if(!raw)try{raw=fetch(u,{timeout:3500,headers:h})}catch(e2){}
    return S(raw)
}
ac.__v060a10ExpandChapter=function(obj,mode){
    var p=ac.__v060a10ChapterPayload(obj,mode),src=p.sources.slice(0,5);
    for(var i=0;i<src.length;i++){
        var u=src[i];if(!u)continue;var raw=readExternal(u);if(!raw)continue;var parsed=null;try{parsed=ac.safeJson?ac.safeJson(raw):JSON.parse(raw)}catch(e){}var q;
        if(parsed&&typeof parsed==='object')q=ac.__v060a10ChapterPayload(parsed,mode);else{var t=htmlText(raw);q={texts:t?[t]:[],audios:[],images:[],sources:[]}}p=mergePayload(p,q)
    }
    try{setItem('acfun_v060_a10_chapter_probe',JSON.stringify({text:p.texts.length,audio:p.audios.length,image:p.images.length,source:p.sources.length,source0:p.sources[0]||''}))}catch(e2){}return p
};
ac.__v060a10ChapterRows=function(root){var out=[],seen={},count=0;function walk(v,d){if(v===undefined||v===null||d>10||count>14000)return;if(Array.isArray(v)){for(var i=0;i<v.length;i++)walk(v[i],d+1);return}if(typeof v!=='object')return;count++;var id=S(pick(v,['chapterId','fictionChapterId'],'')||''),title=S(pick(v,['chapterTitle','chapterName','title','name'],'')||'');if(id&&!seen[id]){seen[id]=1;out.push({id:id,title:title||('第 '+(out.length+1)+' 章'),raw:v})}for(var k in v)if(v[k]&&typeof v[k]==='object')walk(v[k],d+1)}walk(root,0);return out};

try{
    if(!getItem('acfun_v060_a10_migrated','')){
        ['acfun_v050_station_featured','acfun_v050_station_lifan','acfun_v050_comic_station','acfun_v050_class_anime','acfun_v050_tag_anime','acfun_v050_class_video','acfun_v050_tag_video','acfun_v060_dynamic_category','acfun_v060_fiction_tag_fiction','acfun_v060_fiction_tag_audio'].forEach(function(k){save(k,'')});
        setItem('acfun_v060_hero','0');setItem('acfun_v060_a10_migrated','1')
    }
    setItem('acfun_test_runtime','0.6.0-alpha10 recovery runtime');
    setItem('acfun_v060_runtime_a10','alpha8 recovery + media normalization + fiction/audio taxonomy + fresh playback + chapter source resolver')
}catch(e){}
ac.build='2026.08.22-v0.6.0-alpha10';ac.runtimeMode='test-runtime-v060-alpha10-recovery';
})();