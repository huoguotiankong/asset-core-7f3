/** ACFun alpha17 / Build168 - model + jhimage adapter */
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
var R=ac.__a17=ac.__a17||{};
R.BOOT='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v073.js?v=7300';R.BVER=7300;R.IMAGE_CDN='https://cdn.ukaim.com/';
R.prevItem=ac.itemInfo;R.prevImage=ac.image;R.prevDetail=ac.detail;R.prevHome=ac.home;
R.S=function(v){return String(v===undefined||v===null?'':v)};R.N=function(v){var s=R.S(v);return /^\d+$/.test(s)?Number(s):s};
R.param=function(k){try{return R.S(getParam(k,''))}catch(e){return''}};R.pick=function(o,ks,d){try{return ac.pick(o||{},ks,d)}catch(e){return d}};
R.first=function(v){try{return ac.__v042FirstMedia?R.S(ac.__v042FirstMedia(v)||''):R.S(ac.__v043FirstString?ac.__v043FirstString(v)||'':v)}catch(e){return R.S(v)}};
R.deep=function(o,ks){try{return ac.deepFind(o||{},ks,0)}catch(e){return''}};R.merge=function(a,b){var x={},k;for(k in(a||{}))x[k]=a[k];for(k in(b||{}))if(b[k]!==undefined&&b[k]!==null&&b[k]!=='')x[k]=b[k];return x};
R.coverKeys=['coverImg','videoCover','videoCoverImg','generatedCoverImg','templateCoverImg','defaultVideoPoster','coverUrl','horizontalCover','verticalCover','poster','imageUrl','imgUrl'];
R.mediaKeys=['videoUrl','playUrl','videoUri','m3u8Url','m3u8','playPath','sourcePath'];
ac.itemInfo=function(x){var info={};try{info=typeof R.prevItem==='function'?(R.prevItem.call(ac,x||{})||{}):{}}catch(e){}var root=x||{};
 if(!info.id)info.id=R.S(R.deep(root,['videoId','lsjVideoId','vid','id'])||'');if(!info.title||info.title==='未命名')info.title=R.S(R.deep(root,['videoTitle','title','name','video_title'])||info.title||'未命名');
 if(!info.img)for(var i=0;i<R.coverKeys.length&&!info.img;i++)info.img=R.first(R.deep(root,[R.coverKeys[i]]));if(!info.uri)for(var j=0;j<R.mediaKeys.length&&!info.uri;j++)info.uri=R.first(R.deep(root,[R.mediaKeys[j]]));
 if(!info.author)info.author=R.S(R.deep(root,['nickname','nickName','authorName','userName','username'])||'');if(!info.watch)info.watch=R.S(R.deep(root,['watchNum','viewNum','playNum','fakeWatchNum','statisticsTimes'])||'');if(!info.like)info.like=R.S(R.deep(root,['likeNum','likes','favoriteNum'])||'');if(!info.duration)info.duration=R.S(R.deep(root,['duration','videoDuration','playTime'])||'');
 info.id=R.S(info.id||'');info.title=R.S(info.title||'未命名');info.img=R.S(info.img||'');info.uri=R.S(info.uri||'');info.raw=root;return info};
R.isJh=function(v){return /^\/?jhimage\//i.test(R.S(v).replace(/\\\//g,'/'))};R.jhAbs=function(v){return R.IMAGE_CDN+R.S(v).trim().replace(/\\\//g,'/').replace(/^\/+/, '')};
R.decodeImage=function(url){var cache='';try{cache=ac.__v042ImageCachePath?ac.__v042ImageCachePath(url):''}catch(e){}try{if(cache&&fileExist(cache))return getPath(cache)}catch(e0){}var abs='';try{if(cache)abs=getPath(cache)}catch(e1){}var h={};try{h=ac.__v042Headers?ac.__v042Headers():{'User-Agent':ac.ua||'Mozilla/5.0'}}catch(e2){}return $(url,h).image(function(cacheAbs){return $.require('acfunImageDecoder?rule=ACFun').image(cacheAbs);},abs)};
ac.image=function(raw){var s=R.S(raw).trim().replace(/\\\//g,'/');if(R.isJh(s)){var abs=R.jhAbs(s),ret='';try{ret=R.decodeImage(abs)}catch(e){ret=abs;try{setItem('acfun_a17_cover_error',R.S(e.message||e))}catch(e0){}}try{setItem('acfun_a17_cover_raw',s);setItem('acfun_a17_cover_resolved',abs);setItem('acfun_a17_cover_rendered',R.S(ret).slice(0,1200))}catch(e1){}return ret}try{return typeof R.prevImage==='function'?R.prevImage.call(ac,raw):s}catch(e2){return s}};
})();
