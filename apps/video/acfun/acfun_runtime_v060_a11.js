/** ACFun 0.6.0-alpha11 / Build 162
 * Targeted recovery after Alpha10 device test:
 * - restore the Alpha8/Stable cacheM3u8 playback path for normal + short video
 * - broaden cover extraction (JSON-string/media wrapper/dynamicImg/short covers)
 * - resolve nested longFormAudio/audioSource/sourcePath and provide header-aware music playback
 * - add current-build comic chapter resolver with GET/POST + comicsId/comicId matrix
 */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
function S(v){return String(v===undefined||v===null?'':v)}
function N(v){var s=S(v);return /^\d+$/.test(s)?Number(s):s}
function pick(o,ks,d){try{return ac.pick(o||{},ks,d)}catch(e){return d}}
function addUnique(arr,seen,v){v=S(v).trim();if(!v||seen[v])return;seen[v]=1;arr.push(v)}
function looksUrl(s){s=S(s).trim();return /^https?:\/\//i.test(s)||s.indexOf('//')===0||/^\/?[A-Za-z0-9._~%-]+(?:\/[A-Za-z0-9._~%!$&'()*+,;=:@?%-]+)+$/.test(s)||/\.(?:png|jpe?g|webp|gif|avif|mp4|m3u8|mp3|m4a|aac|wav|ogg)(?:\?|$)/i.test(s)}
function parseJsonString(s){s=S(s).trim();if(!s)return null;try{if((s.charAt(0)==='{'&&s.charAt(s.length-1)==='}')||(s.charAt(0)==='['&&s.charAt(s.length-1)===']'))return JSON.parse(s)}catch(e){}return null}
function cleanEscaped(s){return S(s).replace(/\\\//g,'/').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').trim()}

var oldFirstMedia=ac.__v042FirstMedia;
ac.__v060a11FirstMedia=function(v,depth){
    depth=depth||0;if(v===undefined||v===null||depth>10)return'';
    if(typeof v==='string'||typeof v==='number'){
        var s=cleanEscaped(v),j=parseJsonString(s);if(j!==null){var pj=ac.__v060a11FirstMedia(j,depth+1);if(pj)return pj}
        var m=s.match(/https?:\\?\/\\?\/[A-Za-z0-9._~:/?#\[\]@!$&()*+,;=%-]+/i);if(m)return cleanEscaped(m[0]).replace(/["'`)\]}>,;]+$/,'');
        return s
    }
    if(Array.isArray(v)){for(var i=0;i<v.length&&i<24;i++){var a=ac.__v060a11FirstMedia(v[i],depth+1);if(a)return a}return''}
    if(typeof v==='object'){
        var ks=['imgUrl','imageUrl','imageURL','coverUrl','coverPicture','videoCover','videoCoverImg','shortVideoCover','shortCover','videoImg','verticalImg','dynamicImg','activityImg','backImg','backgroundImg','cardImg','quoteSubImg','comicsCover','comicsCoverImg','fictionImg','fictionCover','fictionCoverImg','picUrl','pictureUrl','thumb','thumbnail','poster','generatedCoverImg','templateCoverImg','url','src','path','image','img','cover','value'];
        for(var k=0;k<ks.length;k++)if(v[ks[k]]!==undefined){var b=ac.__v060a11FirstMedia(v[ks[k]],depth+1);if(b)return b}
    }
    try{return typeof oldFirstMedia==='function'?S(oldFirstMedia(v)||''):''}catch(e){return''}
};
ac.__v042FirstMedia=function(v){return ac.__v060a11FirstMedia(v,0)};
function mediaKey(k){k=S(k);if(/avatar|head|user|profile|icon|logo|badge|frame|emoji|medal|gift|level|domain|host/i.test(k))return false;return /cover|image|img|thumb|poster|picture|pic|vertical|background|backimg|cardimg/i.test(k)}
function deepMedia(root){
    var found='',count=0;
    function walk(v,key,d){if(found||v===undefined||v===null||d>11||count>18000)return;if(typeof v==='string'){if(mediaKey(key)){var s=ac.__v060a11FirstMedia(v,0);if(s&&looksUrl(s)){found=s;return}}var j=parseJsonString(v);if(j!==null)walk(j,key,d+1);return}if(Array.isArray(v)){for(var i=0;i<v.length;i++)walk(v[i],key,d+1);return}if(typeof v!=='object')return;count++;for(var k in v){if(mediaKey(k)){var u=ac.__v060a11FirstMedia(v[k],0);if(u&&looksUrl(u)){found=u;return}}}for(var k2 in v)if(v[k2]&&typeof v[k2]==='object'||typeof v[k2]==='string')walk(v[k2],k2,d+1)}
    walk(root,'',0);return found
}
function resolveImage(root,u){u=cleanEscaped(u);if(!u)return'';if(/^https?:\/\//i.test(u))return u;if(u.indexOf('//')===0)return'https:'+u;var domain='';try{domain=S(ac.deepFind(root,['imgDomain','imageDomain','cdnDomain','domain'],0)||'')}catch(e){}if(domain&&/^https?:\/\//i.test(domain))return domain.replace(/\/+$/,'')+'/'+u.replace(/^\/+/, '');try{return ac.__v042Plain?ac.__v042Plain(u):u}catch(e2){return u}}
function fixInfoImage(info,root,kind){info=info||{};var u=S(info.img||'');if(!u||!looksUrl(cleanEscaped(u)))u=deepMedia(root);if(u)info.img=resolveImage(root,u);try{if(info.id&&info.img)setItem('acfun_v060_a11_cover_'+kind+'_'+S(info.id),S(info.img))}catch(e){}return info}
var oldItemInfo=ac.itemInfo;
ac.itemInfo=function(x){var i={};try{i=typeof oldItemInfo==='function'?oldItemInfo.call(ac,x):{}}catch(e){i={}}i=fixInfoImage(i,x||i.raw||{},'video');i.raw=i.raw||x||{};return i};
var oldComicInfo=ac.__v060a4ComicInfo;
ac.__v060a4ComicInfo=function(x){var i={};try{i=typeof oldComicInfo==='function'?oldComicInfo.call(ac,x):{}}catch(e){i={}}i=fixInfoImage(i,x||{},'comic');i.raw=i.raw||x||{};i.kind='comic';return i};
var oldFictionInfo=ac.__v060a4FictionInfo;
ac.__v060a4FictionInfo=function(x){var i={};try{i=typeof oldFictionInfo==='function'?oldFictionInfo.call(ac,x):{}}catch(e){i={}}i=fixInfoImage(i,x||{},'fiction');i.raw=i.raw||x||{};i.kind='fiction';return i};
var oldDynamicInfo=ac.__v060a4DynamicInfo;
ac.__v060a4DynamicInfo=function(x){var i={};try{i=typeof oldDynamicInfo==='function'?oldDynamicInfo.call(ac,x):{}}catch(e){i={}}i=fixInfoImage(i,x||{},'dynamic');i.raw=i.raw||x||{};i.kind='dynamic';return i};

function firstString(v){try{return ac.__v043FirstString?S(ac.__v043FirstString(v)||''):S(v)}catch(e){return S(v)}}
function playerHeaders(){try{return ac.__v045PlayerHeaders?ac.__v045PlayerHeaders():(ac.__v043PlayerHeaders?ac.__v043PlayerHeaders():{'User-Agent':ac.ua||'Mozilla/5.0'})}catch(e){return{'User-Agent':ac.ua||'Mozilla/5.0'}}}
function pathFromObj(o){o=o||{};var ks=['videoUrl','playUrl','videoUri','path','m3u8','playPath','sourcePath'];for(var i=0;i<ks.length;i++)if(o[ks[i]]!==undefined){var s=firstString(o[ks[i]]);if(s)return s}try{var deep=ac.deepFind(o,ks,0);if(deep)return firstString(deep)}catch(e){}return''}
function decodeOld(path){path=S(path).trim();if(!path)return'';try{return ac.__v043DecodePlayUrl?S(ac.__v043DecodePlayUrl(path)||''):path}catch(e){return path}}
function altPlayUrls(path){
    path=S(path).trim();var out=[],seen={};function add(u){u=S(u).trim();if(u&&!seen[u]){seen[u]=1;out.push(u)}}
    if(!path)return out;if(/^https?:\/\//i.test(path))add(path);var host='';try{host=ac.__v043GoodHost?S(ac.__v043GoodHost()):S(ac.frontendBase||'')}catch(e){}host=host.replace(/\/+$/,'');var dec=decodeOld(path);add(dec);
    if(host&&path&&!/^https?:\/\//i.test(path)){add(host+'/api/m3u8/play?path='+encodeURIComponent(path));add(host+'/m3u8/play?path='+encodeURIComponent(path))}
    return out
}
function cacheCandidate(url,id,idx){url=S(url).trim();if(!url)return'';if(/\.mp4(?:\?|$)/i.test(url)&&!/m3u8/i.test(url))return url;try{var name='acfun_'+(id||'video')+'_a11_'+idx+'.m3u8',got=cacheM3u8(url+'#isM3u8#',{headers:playerHeaders(),timeout:4200},name);if(got)return S(got)}catch(e){}return url}
ac.play=function(id,raw,direct){
    id=S(id);var obj=ac.safeJson(raw)||{},path=firstString(direct)||pathFromObj(obj),watchErr='';
    if(!path&&id){try{var w=ac.__v043Api('video/can/watch',{videoId:/^\d+$/.test(id)?Number(id):id},{method:'POST',write:true,allowGet:false,timeout:1500,maxAttempts:2});path=firstString(w&&w.path!==undefined?w.path:w)||pathFromObj(w)}catch(e){watchErr=S(e.message||e)}}
    var paths=[];if(path)paths.push({name:'播放',path:path});if(id&&path){try{var fw=ac.__v043Api('video/can/watch',{videoId:/^\d+$/.test(id)?Number(id):id},{method:'POST',write:true,allowGet:false,timeout:1400,maxAttempts:1}),fp=firstString(fw&&fw.path!==undefined?fw.path:fw)||pathFromObj(fw);if(fp&&S(fp)!==S(path))paths.push({name:'当前线路',path:fp})}catch(e2){if(!watchErr)watchErr=S(e2.message||e2)}}
    var urls=[],names=[],headers=[],seen={};for(var p=0;p<paths.length;p++){var cs=altPlayUrls(paths[p].path);for(var c=0;c<cs.length&&c<3;c++){var u=cacheCandidate(cs[c],id,p+'_'+c);if(!u||seen[u])continue;seen[u]=1;urls.push(u);names.push(c===0?paths[p].name:(c===1?'兼容线路':'备用线路'));headers.push(playerHeaders())}}
    if(!urls.length){try{setItem('acfun_v060_a11_play_probe',JSON.stringify({id:id,path:path,error:watchErr,lines:0}))}catch(e3){}return'toast://未获取到可播放地址'}
    var ret={urls:urls,names:names,headers:headers};try{var dm=ac.__v045CachedDanmu?ac.__v045CachedDanmu(id):'';if(dm)ret.danmu=dm}catch(e4){}
    try{setItem('acfun_v060_a11_play_probe',JSON.stringify({id:id,path:path,error:watchErr,lines:urls.length,first:urls[0]}))}catch(e5){}return JSON.stringify(ret)
};

function resolveMediaUrl(root,u){u=cleanEscaped(u);if(!u)return'';if(/^https?:\/\//i.test(u))return u;if(u.indexOf('//')===0)return'https:'+u;var domain='';try{domain=S(ac.deepFind(root,['audioDomain','playbackDomain','mediaDomain','domain','host'],0)||'')}catch(e){}if(domain&&/^https?:\/\//i.test(domain))return domain.replace(/\/+$/,'')+'/'+u.replace(/^\/+/, '');var host='';try{var bs=ac.getApiBases?ac.getApiBases(false):[];host=bs&&bs.length?S(bs[0]):S(ac.frontendBase||'')}catch(e2){host=S(ac.frontendBase||'')}return host?host.replace(/\/+$/,'')+'/'+u.replace(/^\/+/, ''):u}
ac.__v060a11AudioCandidates=function(root){
    var out=[],seen={},count=0,audioCtx=/audio|longform|voice|sound|music/i,leaf=/^(?:url|src|path|source|sourcePath|audioSource|audioUrl|audioPath|playPath|dataSource|file|value)$/i;
    function walk(v,key,ctx,d){if(v===undefined||v===null||d>13||count>24000)return;var path=(ctx?ctx+'/':'')+S(key),low=path.toLowerCase();if(typeof v==='string'){
        var s=cleanEscaped(v),j=parseJsonString(s);if(j!==null)walk(j,key,ctx,d+1);
        var ext=/\.(?:mp3|m4a|aac|wav|ogg|flac|m3u8)(?:\?|$)/i.test(s),ctxAudio=audioCtx.test(low);if((ext||(ctxAudio&&leaf.test(S(key))))&&s){var u=resolveMediaUrl(root,s);if(u)addUnique(out,seen,u)}return
    }if(Array.isArray(v)){for(var i=0;i<v.length;i++)walk(v[i],String(i),path,d+1);return}if(typeof v!=='object')return;count++;for(var k in v)walk(v[k],k,path,d+1)}walk(root,'','',0);return out
};
ac.__v060a11AudioPlayer=function(urls,id){
    urls=Array.isArray(urls)?urls:[urls];var out=[],names=[],headers=[],seen={},h=playerHeaders();for(var i=0;i<urls.length&&i<6;i++){var u=S(urls[i]).trim();if(!u||seen[u])continue;seen[u]=1;var play=u;if(/\.m3u8(?:\?|$)/i.test(u)||/\/m3u8\//i.test(u)){try{var c=cacheM3u8(u+'#isM3u8#',{headers:h,timeout:4200},'acfun_audio_'+S(id||'chapter')+'_'+i+'.m3u8');if(c)play=S(c)}catch(e){}}out.push(play+'#isMusic=true#');names.push(i?'备用音频 '+(i+1):'播放音频');headers.push(h)}try{setItem('acfun_v060_a11_audio_probe',JSON.stringify({id:S(id),count:out.length,first:urls[0]||''}))}catch(e2){}if(!out.length)return'toast://未获取到音频地址';return JSON.stringify({urls:out,names:names,headers:headers})
};

function apiRaw(path,params,method){try{return ac.__v043Api(path,params||{},method==='POST'?{method:'POST',write:true,allowGet:false,timeout:1800,maxAttempts:2}:{timeout:1700,maxAttempts:2})}catch(e){try{setItem('acfun_v060_a11_last_error',path+' '+method+': '+S(e.message||e))}catch(e0){}return null}}
ac.__v060a11ComicChapter=function(comicsId,chapterId){
    var cid=N(comicsId),ch=N(chapterId),ps=[{comicsId:cid,chapterId:ch},{comicId:cid,chapterId:ch},{id:cid,chapterId:ch},{comicsId:cid,id:ch}],methods=['GET','POST'],best={};
    for(var i=0;i<ps.length;i++)for(var m=0;m<methods.length;m++){var r=apiRaw('comics/base/chapterInfo',ps[i],methods[m]);if(r&&typeof r==='object'){best=r;var imgs=ac.__v060a11ComicImages(r);if(imgs.length){try{setItem('acfun_v060_a11_comic_probe',JSON.stringify({cid:S(comicsId),ch:S(chapterId),method:methods[m],params:ps[i],images:imgs.length}))}catch(e){}return r}}}
    try{setItem('acfun_v060_a11_comic_probe',JSON.stringify({cid:S(comicsId),ch:S(chapterId),images:0}))}catch(e2){}return best
};
ac.__v060a11ComicImages=function(root){
    var out=[],seen={},count=0,domain='';try{domain=S(ac.deepFind(root,['imgDomain','imageDomain','domain'],0)||'')}catch(e){}
    function add(v){var u=ac.__v060a11FirstMedia(v,0);u=cleanEscaped(u);if(!u)return;if(!/^https?:\/\//i.test(u)&&u.indexOf('//')!==0&&domain)u=domain.replace(/\/+$/,'')+'/'+u.replace(/^\/+/, '');else if(u.indexOf('//')===0)u='https:'+u;if(u&&!seen[u]&&looksUrl(u)){seen[u]=1;out.push(u)}}
    function walk(v,key,d){if(v===undefined||v===null||d>12||count>22000)return;if(typeof v==='string'){var j=parseJsonString(v);if(j!==null)walk(j,key,d+1);if(/img|image|pic/i.test(key)&&!/domain|host/i.test(key))add(v);return}if(Array.isArray(v)){if(/img|image|pic/i.test(key))for(var i=0;i<v.length;i++)add(v[i]);for(var j=0;j<v.length;j++)walk(v[j],key,d+1);return}if(typeof v!=='object')return;count++;for(var k in v){if(/^(?:imgList|imageList|images|chapterImgList|pageList|pics|pictures)$/i.test(k)){var vv=v[k];if(Array.isArray(vv))for(var z=0;z<vv.length;z++)add(vv[z]);else add(vv)}walk(v[k],k,d+1)}}walk(root,'',0);return out
};

try{setItem('acfun_test_runtime','0.6.0-alpha11 runtime');setItem('acfun_v060_runtime_a11','stable cacheM3u8 playback + media wrapper covers + audio resolver + comic chapter matrix')}catch(e){}
ac.build='2026.08.22-v0.6.0-alpha11';ac.runtimeMode='test-runtime-v060-alpha11';
})();