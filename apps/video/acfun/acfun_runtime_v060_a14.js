/** ACFun 0.6.0-alpha14 / Build 165
 * Recovery overlay from device-proven Alpha12, deliberately skipping Alpha13.
 * - never replaces already-normalized cover fields
 * - playback prefers feed/detail media paths and probes can/watch GET before POST
 * - audio output keeps a minimal music contract
 */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
function S(v){return String(v===undefined||v===null?'':v)}
function N(v){var s=S(v);return /^\d+$/.test(s)?Number(s):s}
function first(v){try{return ac.__v043FirstString?S(ac.__v043FirstString(v)||''):S(v)}catch(e){return S(v)}}
function clean(v){return S(v).replace(/\\\//g,'/').replace(/&amp;/gi,'&').trim()}
function mediaPath(v){
    var s=clean(first(v));if(!s)return'';
    if(/\.(?:m3u8|mp4|m4v|webm)(?:[?#]|$)/i.test(s))return s;
    if(/^https?:\/\//i.test(s)&&/(?:\/m3u8\/|\/stream\/|\/media\/)/i.test(s)&&!/\.(?:png|jpe?g|webp|gif|svg|avif)(?:[?#]|$)/i.test(s))return s;
    return''
}
function collectPaths(root,direct){
    var out=[],seen={},count=0,keys={videoUrl:1,playUrl:1,videoUri:1,path:1,m3u8:1,playPath:1,sourcePath:1,mediaUrl:1,streamUrl:1};
    function add(v){var p=mediaPath(v);if(p&&!seen[p]){seen[p]=1;out.push(p)}}
    add(direct);
    function walk(v,d){if(v===undefined||v===null||d>9||count>12000)return;if(Array.isArray(v)){for(var i=0;i<v.length;i++)walk(v[i],d+1);return}if(typeof v!=='object')return;count++;for(var k in v)if(keys[k])add(v[k]);for(var k2 in v)if(v[k2]&&typeof v[k2]==='object')walk(v[k2],d+1)}
    walk(root,0);return out
}
function requestWatch(id,method,diag){
    if(!id)return'';try{
        var opt=method==='POST'?{method:'POST',write:true,allowGet:false,timeout:1500,maxAttempts:2}:{timeout:1500,maxAttempts:2};
        var r=ac.__v043Api('video/can/watch',{videoId:N(id)},opt),p=mediaPath(r&&r.path!==undefined?r.path:r);
        if(!p&&r)try{p=mediaPath(ac.deepFind(r,['path','videoUrl','playUrl','videoUri','m3u8'],0))}catch(e0){}
        diag.push({method:method,ok:!!p});return p
    }catch(e){diag.push({method:method,ok:false,error:S(e.message||e).slice(0,180)});return''}
}
function decode(p){try{return ac.__v043DecodePlayUrl?S(ac.__v043DecodePlayUrl(p)||''):S(p)}catch(e){return S(p)}}
function headers(){try{return ac.__v045PlayerHeaders?ac.__v045PlayerHeaders():(ac.__v043PlayerHeaders?ac.__v043PlayerHeaders():{'User-Agent':ac.ua||'Mozilla/5.0'})}catch(e){return{'User-Agent':ac.ua||'Mozilla/5.0'}}}
function prepare(p,id,idx,h,diag){
    p=clean(p);if(!p)return'';
    if(/^https?:\/\//i.test(p)&&/\.(?:mp4|m4v|webm)(?:[?#]|$)/i.test(p)){diag.push({src:'direct-file',ok:true});return p}
    var u=decode(p);if(!u)return'';
    var key='';try{key=ac.__v045PlayCacheKey?ac.__v045PlayCacheKey(id,u):''}catch(e0){}
    var c='';try{if(key&&ac.__v045ReadPlayCache)c=S(ac.__v045ReadPlayCache(key)||'')}catch(e1){}
    if(c){diag.push({src:'play-cache',ok:true});return c}
    try{
        var fn='acfun_'+S(id||'video')+'_a14_'+idx+'.m3u8',got=cacheM3u8(u+'#isM3u8#',{headers:h,timeout:4200},fn);
        if(got){c=S(got);if(key&&ac.__v045WritePlayCache)try{ac.__v045WritePlayCache(key,c)}catch(e2){}diag.push({src:'cacheM3u8',ok:true});return c}
    }catch(e3){diag.push({src:'cacheM3u8',ok:false,error:S(e3.message||e3).slice(0,180)})}
    diag.push({src:'decode-fallback',ok:!!u});return u
}
ac.play=function(id,raw,direct){
    id=S(id);var obj=ac.safeJson(raw)||{},paths=collectPaths(obj,direct),watchDiag=[],prep=[],h=headers(),final='',used='';
    for(var i=0;i<paths.length&&!final;i++){final=prepare(paths[i],id,'seed_'+i,h,prep);if(final)used='seed'}
    if(!final){var gp=requestWatch(id,'GET',watchDiag);if(gp){final=prepare(gp,id,'get',h,prep);if(final)used='watch-get'}}
    if(!final){var pp=requestWatch(id,'POST',watchDiag);if(pp){final=prepare(pp,id,'post',h,prep);if(final)used='watch-post'}}
    try{setItem('acfun_v060_a14_play_probe',JSON.stringify({id:id,seedPaths:paths.length,used:used,watch:watchDiag,prepare:prep,final:final?String(final).slice(0,300):''}).slice(0,5000))}catch(e4){}
    if(!final)return'toast://未获取到可播放地址';
    var ret={urls:[final],names:['播放'],headers:[h]};try{var dm=ac.__v045CachedDanmu?ac.__v045CachedDanmu(id):'';if(dm)ret.danmu=dm}catch(e5){}return JSON.stringify(ret)
};

var oldAudioCandidates=ac.__v060a11AudioCandidates;
ac.__v060a14AudioCandidates=function(root){
    var out=[],seen={},base=[];try{base=typeof oldAudioCandidates==='function'?(oldAudioCandidates.call(ac,root)||[]):[]}catch(e){}
    function add(u){u=clean(u);if(!u||seen[u])return;if(!(/^https?:\/\//i.test(u)||u.indexOf('//')===0||/\.(?:mp3|m4a|aac|wav|ogg|flac|m3u8)(?:[?#]|$)/i.test(u)))return;if(u.indexOf('//')===0)u='https:'+u;seen[u]=1;out.push(u)}
    for(var i=0;i<base.length;i++)add(base[i]);
    try{var p=ac.__v060a10ChapterPayload?ac.__v060a10ChapterPayload(root,'audio'):null;if(p&&p.audios)for(var j=0;j<p.audios.length;j++)add(p.audios[j])}catch(e2){}
    try{setItem('acfun_v060_a14_audio_source_probe',JSON.stringify({count:out.length,hasPlaybackDomain:!!ac.deepFind(root,['playbackDomain','audioDomain','mediaDomain'],0),hasPlaybackAuthKey:!!ac.deepFind(root,['playbackAuthKey','authKey'],0)}))}catch(e3){}
    return out
};
ac.__v060a14AudioPlayer=function(urls,id){
    urls=Array.isArray(urls)?urls:[urls];var out=[],seen={},h=headers();
    for(var i=0;i<urls.length&&i<8;i++){
        var u=clean(urls[i]);if(!u||seen[u])continue;seen[u]=1;
        if(u.indexOf('//')===0)u='https:'+u;
        if(/\.m3u8(?:[?#]|$)/i.test(u)||/\/m3u8\//i.test(u))try{var c=cacheM3u8(u+'#isM3u8#',{headers:h,timeout:4200},'acfun_audio_a14_'+S(id||'chapter')+'_'+i+'.m3u8');if(c)u=S(c)}catch(e){}
        out.push(u)
    }
    try{setItem('acfun_v060_a14_audio_probe',JSON.stringify({id:S(id),count:out.length,first:out[0]?out[0].slice(0,320):''}).slice(0,3500))}catch(e2){}
    if(!out.length)return'toast://未获取到音频地址';
    if(out.length===1)return out[0]+'#isMusic=true#';
    var opts=[];for(var j=0;j<out.length;j++)opts.push(j?'备用音频 '+(j+1):'播放音频');
    return'select://'+JSON.stringify({title:'选择音频线路',options:opts,col:1,js:$.toString(function(os,us){var i=os.indexOf(input);if(i<0)return'toast://未选择线路';return String(us[i]||'')+'#isMusic=true#'},opts,out)})
};
try{setItem('acfun_test_runtime','0.6.0-alpha14 runtime');setItem('acfun_v060_runtime_a14','alpha12 recovery + GET-first watch + cover-safe runtime')}catch(e){}
ac.build='2026.08.23-v0.6.0-alpha14';ac.runtimeMode='test-runtime-v060-alpha14';
})();
