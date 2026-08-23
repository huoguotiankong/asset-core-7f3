/** ACFun Next 1.0.0-alpha2 - first device regression fixes */
(function(){
if(typeof ACFunNext!=='object')throw new Error('ACFunNext alpha1 base missing');
var A=ACFunNext;
A.version='1.0.0-alpha2';A.buildNumber=10002;A.build='2026.08.23-v1.0.0-alpha2';A.runtimeMode='clean-next+a2-device-fixes';
A.bootUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v081.js?v=8100';A.bootVer=8100;

// Sea/Hiker getParam may expose the encoded query value. Decode exactly once and fall back safely.
A.param=function(k){
    try{
        var v=A.s(getParam(k,''));
        if(!v)return'';
        try{return decodeURIComponent(v.replace(/\+/g,'%20'));}catch(e0){return v;}
    }catch(e){return'';}
};

// Image contract restored from the device-validated Stable chain:
// session imgDomain wins for every relative image (including jhimage); asigoo thumbnails use _480,
// empty Referer and the scoped XOR decoder. Other absolute/CDN images are returned as plain URLs.
A.absImage=function(raw,domain){
    var s=A.s(raw).trim().replace(/\\\//g,'/');if(!s)return'';
    if(/^(?:data:|hiker:|file:)/i.test(s))return s;
    if(s.indexOf('//')===0)return'https:'+s;
    if(/^https?:\/\//i.test(s))return s;
    var d=A.s(domain||getItem('acfun_next_img_domain','')).replace(/\/+$/,'');
    if(!d)d=A.s(A.imageCdn||'https://cdn.ukaim.com/').replace(/\/+$/,'');
    return d+'/'+s.replace(/^\/+/, '');
};
A.__a2ImageTarget=function(url){
    url=A.s(url);if(!/\.asigoo\.com\//i.test(url)||/_480(?:[?#]|$)/i.test(url))return url;
    var q=url.indexOf('?');return q>=0?url.substring(0,q)+'_480'+url.substring(q):url+'_480';
};
A.image=function(raw,domain){
    var plain=A.absImage(raw,domain);if(!plain)return'';
    A.setDiag('image_raw',A.s(raw));A.setDiag('image_resolved',plain);
    if(/^(?:data:|hiker:|file:)/i.test(plain))return plain;
    if(!/\.asigoo\.com\//i.test(plain))return plain+'@Referer=';
    var target=A.__a2ImageTarget(plain),cache='hiker://files/cache/acfun_next_img_a2/'+A.md5(target)+'.jpg',abs='';
    try{if(fileExist(cache)){var hit=getPath(cache);A.setDiag('image_rendered',hit);return hit;}abs=getPath(cache);}catch(e0){}
    var headers={'User-Agent':'Dalvik/2.1.0 (Linux; U; Android 11; M2012K10C Build/RP1A.200720.011)','Referer':''};
    try{
        var ret=$(target,headers).image(function(cacheAbs){return $.require('acfunImageDecoder?rule=ACFun').image(cacheAbs);},abs);
        A.setDiag('image_rendered',A.s(ret));return ret;
    }catch(e){A.setDiag('image_error',target+'\n'+A.s(e.message||e));return target+'@Referer=';}
};

A.__a2Credential=function(force){
    var key='acfun_next_player_credential',ts=Number(getItem(key+'_ts','0')),old={};
    try{old=JSON.parse(getItem(key,'{}'))||{};}catch(e){}
    if(!force&&ts&&Date.now()-ts<10*60*1000&&Object.keys(old).length)return old;
    var obj={};
    try{obj=A.tryApi('m3u8/player/referer',{},['GET','POST'],{timeout:1800})||{};setItem(key,JSON.stringify(obj));setItem(key+'_ts',String(Date.now()));A.setDiag('player_credential',JSON.stringify(obj));}
    catch(e2){A.setDiag('player_credential_error',A.s(e2.message||e2));return old;}
    return obj;
};
A.__a2Origin=function(u){var m=A.s(u).match(/^(https?:\/\/[^/]+)/i);return m?m[1]:'';};
A.__a2AddCandidate=function(out,name,url,headers){
    url=A.s(url).trim();if(!url)return;for(var i=0;i<out.urls.length;i++)if(out.urls[i]===url)return;
    out.urls.push(url);out.names.push(name);out.headers.push(headers);
};
A.__a2Hls=function(u){u=A.s(u);return u&&u.indexOf('#isM3u8#')<0?u+'#isM3u8#':u;};
A.play=function(id,raw,direct){
    id=A.s(id);var obj=A.safeJson(raw)||raw||{},path='';
    if(A.mediaLike(direct))path=A.s(direct);if(!path)path=A.mediaPath(obj);var used=path?'seed':'';
    if(!path&&id)try{var g=A.tryApi('video/can/watch',{videoId:A.n(id)},['GET'],{timeout:1800});path=A.mediaPath(g)||A.first(g&&g.path!==undefined?g.path:g);if(path)used='watch-get';}catch(e0){}
    if(!path&&id)try{var p=A.tryApi('video/can/watch',{videoId:A.n(id)},['POST'],{timeout:1800});path=A.mediaPath(p)||A.first(p&&p.path!==undefined?p.path:p);if(path)used='watch-post';}catch(e1){}
    if(!path){A.setDiag('play',JSON.stringify({id:id,used:used,path:''}));return'toast://未获取到播放地址';}
    var host=getItem('acfun_next_good_host','')||A.staticApiHosts[0],cred=A.__a2Credential(false),cfg={};try{cfg=A.remoteConfig(false)||{};}catch(e2){}
    var referer=A.s(A.deep(cred,['referer','playerReferer','xReferer'],0)||A.deep(cfg,['referer','playerReferer'],0)||host+'/');
    if(!/^https?:\/\//i.test(referer))referer=host+'/';
    var domain=A.s(A.deep(cred,['playbackDomain','mediaDomain','domain'],0)||A.deep(cfg,['playbackDomain'],0)||'').replace(/\/+$/,'');
    var auth=A.s(A.deep(cred,['playbackAuthKey','authKey','auth_key'],0)||A.deep(cfg,['playbackAuthKey','authKey','auth_key'],0)||'');
    var origin=A.__a2Origin(referer)||host,h={'User-Agent':'Mozilla/5.0 (Linux; Android 12; SM-G9750 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 Mobile Safari/537.36','Referer':referer,'Origin':origin,'X-Referer':referer};
    var out={urls:[],names:[],headers:[]},decode=A.decodePlayUrl(path);
    // The alpha1 device log proved seed + decode were correct. Force the HLS hint instead of giving
    // an extension-less /decode endpoint to the player as a generic media URL.
    if(decode)A.__a2AddCandidate(out,'H5解码',A.__a2Hls(decode),h);
    if(domain){
        var directUrl=domain+'/'+A.s(path).replace(/^\/+/, '');if(auth)directUrl+=(directUrl.indexOf('?')>=0?'&':'?')+'auth_key='+encodeURIComponent(auth);
        A.__a2AddCandidate(out,'CDN直连',A.__a2Hls(directUrl),h);
        var q=encodeURIComponent(path);
        var api1=domain+'/api/m3u8/play?path='+q+(auth?'&authKey='+encodeURIComponent(auth):'');
        var api2=domain+'/m3u8/play?path='+q+(auth?'&auth_key='+encodeURIComponent(auth):'');
        A.__a2AddCandidate(out,'APP播放',A.__a2Hls(api1),h);A.__a2AddCandidate(out,'APP兼容',A.__a2Hls(api2),h);
    }
    if(!out.urls.length)return'toast://未生成播放线路';
    A.setDiag('play',JSON.stringify({id:id,used:used,path:path,decode:decode,referer:referer,playbackDomain:domain,hasAuth:!!auth,candidates:out.urls}));
    return JSON.stringify(out);
};

// Stable/current device evidence uses GET for comics info/chapter. Do not burn a full host sweep on POST 405 first.
A.comicObject=function(id,seed){seed=seed||{};return A.merge(seed,A.objectFromApi('comic|'+id,'comics/base/info',[{comicsId:A.n(id)},{comicId:A.n(id)},{id:A.n(id)}],['GET','POST']));};
A.comicChapter=function(comicsId,chapterId){return A.objectFromApi('comic-chapter|'+comicsId+'|'+chapterId,'comics/base/chapterInfo',[{chapterId:A.n(chapterId)},{comicsId:A.n(comicsId),chapterId:A.n(chapterId)},{comicId:A.n(comicsId),chapterId:A.n(chapterId)}],['GET','POST']);};

// Remove alpha1's explanatory developer copy from the featured/lifan home; content begins immediately after navigation.
var __a2Filters=A.filters;
A.filters=function(d){var s=A.section();if(s==='featured'||s==='lifan')return;return __a2Filters.call(A,d);};

A.diag=function(){
    setPageTitle('ACFun 资源诊断');var d=[];
    var text='版本：'+A.version+' / Build '+A.buildNumber+'\n运行：'+A.build+'\n接口：'+getItem('acfun_next_good_host','未建立')+'\n令牌：'+(getItem('acfun_next_token','')?'已建立':'无')+'\n图片域：'+getItem('acfun_next_img_domain','未记录')+
    '\n\n图片原始：\n'+A.getDiag('image_raw')+'\n图片解析：\n'+A.getDiag('image_resolved')+'\n图片渲染：\n'+A.getDiag('image_rendered')+'\n图片错误：\n'+A.getDiag('image_error')+
    '\n\n最近接口：\n'+A.getDiag('last_api')+'\n\n播放：\n'+A.getDiag('play')+'\n\n播放凭据：\n'+A.getDiag('player_credential')+'\n播放凭据错误：\n'+A.getDiag('player_credential_error')+
    '\n\n请求错误：\n'+A.getDiag('api_error')+'\n\nProvider：\n'+A.getDiag('provider_error')+'\n\n游客：\n'+A.getDiag('traveler_error');
    d.push({title:text,col_type:'long_text',url:'hiker://empty'});
    d.push({title:'复制诊断',col_type:'text_1',url:'copy://'+text,extra:{lineVisible:false}});
    d.push({title:'刷新播放凭据',desc:'重新请求 APP 中存在的 m3u8/player/referer 合同',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(boot,ver){try{require(boot,{headers:{'Cache-Control':'no-cache'}},ver);ACFunNextBoot.loadOnly();ACFunNext.__a2Credential(true);refreshPage(false);return'toast://播放凭据已刷新'}catch(e){return'toast://刷新失败：'+String(e.message||e)}},A.bootUrl,A.bootVer),extra:{lineVisible:false}});
    setResult(d);
};
})();
