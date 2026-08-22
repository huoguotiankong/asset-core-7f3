/** ACFun 0.6.0-alpha12 / Build 163
 * Exact recovery after Alpha11 device failure:
 * - restore verified Stable v0.4.5 playback contract verbatim in spirit
 * - comic chapterInfo first uses the verified {chapterId} request
 * - audio player avoids multi-line JSON ambiguity and returns direct/select music URLs
 */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
function S(v){return String(v===undefined||v===null?'':v)}
function N(v){var s=S(v);return /^\d+$/.test(s)?Number(s):s}
function first(v){try{return ac.__v043FirstString?S(ac.__v043FirstString(v)||''):S(v)}catch(e){return S(v)}}
function headers(){try{return ac.__v045PlayerHeaders?ac.__v045PlayerHeaders():(ac.__v043PlayerHeaders?ac.__v043PlayerHeaders():{'User-Agent':ac.ua||'Mozilla/5.0'})}catch(e){return{'User-Agent':ac.ua||'Mozilla/5.0'}}}

// ---- exact Stable playback contract ----------------------------------------
ac.play=function(id,raw,direct){
    id=S(id);var obj=ac.safeJson(raw)||{},path='',watchErr='',cacheErr='';
    if(direct)path=first(direct);
    if(!path)path=first(obj.videoUrl)||first(obj.playUrl)||first(obj.videoUri)||first(obj.path);
    if(!path&&id){
        try{var w=ac.__v043Api('video/can/watch',{videoId:/^\d+$/.test(id)?Number(id):id},{method:'POST',write:true,allowGet:false,timeout:1200,maxAttempts:1});path=first(w&&w.path!==undefined?w.path:w)||first(w)}catch(e){watchErr=S(e.message||e)}
    }
    var decode='';try{decode=ac.__v043DecodePlayUrl?S(ac.__v043DecodePlayUrl(path)||''):S(path)}catch(e0){decode=S(path)}
    if(!decode){try{setItem('acfun_v060_a12_play_probe',JSON.stringify({id:id,path:path,decode:'',watchErr:watchErr,cacheErr:''}))}catch(e1){}return'toast://未获取到可播放地址'}
    var h=headers(),url='',cacheHit=false,key='';
    try{key=ac.__v045PlayCacheKey?ac.__v045PlayCacheKey(id,decode):'';if(key&&ac.__v045ReadPlayCache){url=S(ac.__v045ReadPlayCache(key)||'');cacheHit=!!url}}catch(e2){}
    if(!url){
        try{var fname='acfun_'+(id||'video')+'_a12_'+(ac.__v042Hash?ac.__v042Hash(decode).substring(0,8):'hls')+'.m3u8';url=S(cacheM3u8(decode+'#isM3u8#',{headers:h,timeout:3800},fname)||'');if(url&&key&&ac.__v045WritePlayCache)ac.__v045WritePlayCache(key,url)}catch(e3){cacheErr=S(e3.message||e3);url=decode}
    }
    if(!url)url=decode;
    var ret={urls:[url],names:[cacheHit?'极速缓存':'播放'],headers:[h]};try{var dm=ac.__v045CachedDanmu?ac.__v045CachedDanmu(id):'';if(dm)ret.danmu=dm}catch(e4){}
    try{setItem('acfun_v060_a12_play_probe',JSON.stringify({id:id,path:path,decode:decode,url:url,watchErr:watchErr,cacheErr:cacheErr,cacheHit:cacheHit}))}catch(e5){}
    return JSON.stringify(ret)
};

// ---- audio direct/select player --------------------------------------------
function normalizeAudio(u,id,idx){u=S(u).trim();if(!u)return'';var h=headers(),p=u;if(!/^https?:\/\//i.test(p)&&p.indexOf('//')!==0){try{p=ac.__v043DecodePlayUrl?S(ac.__v043DecodePlayUrl(p)||p):p}catch(e){}}if(p.indexOf('//')===0)p='https:'+p;if(/\.m3u8(?:\?|$)/i.test(p)||/\/m3u8\//i.test(p)){try{var c=cacheM3u8(p+'#isM3u8#',{headers:h,timeout:4000},'acfun_audio_a12_'+S(id||'chapter')+'_'+idx+'.m3u8');if(c)p=S(c)}catch(e2){}}return p}
ac.__v060a12AudioPlayer=function(urls,id){
    urls=Array.isArray(urls)?urls:[urls];var out=[],seen={};for(var i=0;i<urls.length&&i<8;i++){var u=normalizeAudio(urls[i],id,i);if(u&&!seen[u]){seen[u]=1;out.push(u)}}
    try{setItem('acfun_v060_a12_audio_probe',JSON.stringify({id:S(id),count:out.length,first:out[0]||''}))}catch(e){}
    if(!out.length)return'toast://未获取到音频地址';if(out.length===1)return out[0]+'#isMusic=true#';
    var opts=[];for(var j=0;j<out.length;j++)opts.push(j?'备用音频 '+(j+1):'播放音频');
    return'select://'+JSON.stringify({title:'选择音频线路',options:opts,col:1,js:$.toString(function(os,us){var i=os.indexOf(input);if(i<0)return'toast://未选择线路';return String(us[i]||'')+'#isMusic=true#'},opts,out)})
};
ac.__v060a11AudioPlayer=ac.__v060a12AudioPlayer;

// ---- comic chapter exact contract ------------------------------------------
function api(path,params,method){try{return ac.__v043Api(path,params||{},method==='POST'?{method:'POST',write:true,allowGet:false,timeout:1800,maxAttempts:2}:{timeout:1700,maxAttempts:2})}catch(e){try{setItem('acfun_v060_a12_last_error',path+' '+method+': '+S(e.message||e))}catch(e0){}return null}}
function parseMaybe(v){if(typeof v!=='string')return v;var s=S(v).trim();if(!s)return v;try{if((s.charAt(0)==='['&&s.charAt(s.length-1)===']')||(s.charAt(0)==='{'&&s.charAt(s.length-1)==='}'))return JSON.parse(s)}catch(e){}return v}
ac.__v060a12ComicImages=function(root){
    var out=[],seen={},domain='';try{domain=S(ac.deepFind(root,['domain','imgDomain','imageDomain'],0)||'')}catch(e){}
    function add(v){v=parseMaybe(v);if(Array.isArray(v)){for(var i=0;i<v.length;i++)add(v[i]);return}if(v&&typeof v==='object'){var p=ac.pick(v,['imgUrl','imageUrl','url','path','src','value'],'');if(p!==undefined&&p!==null&&p!==''){add(p);return}for(var k in v)if(/img|image|pic|page/i.test(k)&&!/domain|host/i.test(k))add(v[k]);return}var u=S(v).trim();if(!u)return;if(u.indexOf('//')===0)u='https:'+u;else if(!/^https?:\/\//i.test(u)&&domain)u=domain.replace(/\/+$/,'')+'/'+u.replace(/^\/+/, '');if(!/^https?:\/\//i.test(u))return;if(!seen[u]){seen[u]=1;out.push(u)}}
    var keys=['imgList','imageList','chapterImgList','images','pageList','pics','pictures'];for(var i=0;i<keys.length;i++){try{var v=ac.deepFind(root,[keys[i]],0);if(v!==undefined&&v!==null)add(v)}catch(e2){}}
    if(!out.length){function walk(v,k,d){if(v===undefined||v===null||d>12)return;if(Array.isArray(v)){for(var i=0;i<v.length;i++)walk(v[i],k,d+1);return}if(typeof v==='string'){if(/img|image|pic|page/i.test(k)&&!/domain|host/i.test(k))add(v);return}if(typeof v!=='object')return;for(var x in v)walk(v[x],x,d+1)}walk(root,'',0)}
    return out
};
ac.__v060a12ComicChapter=function(comicsId,chapterId){
    var cid=N(comicsId),ch=N(chapterId),tries=[
      {params:{chapterId:ch},method:'GET',tag:'chapterId-GET'},
      {params:{chapterId:ch},method:'POST',tag:'chapterId-POST'},
      {params:{comicsId:cid,chapterId:ch},method:'GET',tag:'comicsId-GET'},
      {params:{comicsId:cid,chapterId:ch},method:'POST',tag:'comicsId-POST'},
      {params:{comicId:cid,chapterId:ch},method:'GET',tag:'comicId-GET'}
    ],best=null;
    for(var i=0;i<tries.length;i++){var r=api('comics/base/chapterInfo',tries[i].params,tries[i].method);if(r&&typeof r==='object'){best=r;var imgs=ac.__v060a12ComicImages(r),cw=ac.pick(r,['canWatch'],'');if(imgs.length||cw===false){try{setItem('acfun_v060_a12_comic_probe',JSON.stringify({cid:S(comicsId),ch:S(chapterId),tag:tries[i].tag,images:imgs.length,canWatch:cw}))}catch(e){}return r}}}
    try{setItem('acfun_v060_a12_comic_probe',JSON.stringify({cid:S(comicsId),ch:S(chapterId),tag:'none',images:0}))}catch(e2){}return best||{}
};
try{setItem('acfun_test_runtime','0.6.0-alpha12 runtime');setItem('acfun_v060_runtime_a12','stable exact playback + chapterId-first comic + direct/select audio')}catch(e){}
ac.build='2026.08.22-v0.6.0-alpha12';ac.runtimeMode='test-runtime-v060-alpha12';
})();
