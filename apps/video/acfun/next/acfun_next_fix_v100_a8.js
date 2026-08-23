/** ACFun Next 1.0.0-alpha8 - force can/watch handshake + split manifest/segment headers + immersive comic reader */
(function(){
if(typeof ACFunNext!=='object')throw new Error('ACFunNext alpha7 base missing');
var A=ACFunNext;
A.version='1.0.0-alpha8';
A.buildNumber=10008;
A.build='2026.08.23-v1.0.0-alpha8';
A.runtimeMode='clean-next+a8-watch-handshake-split-headers-immersive-comic';
A.bootUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v087.js?v=8700';
A.bootVer=8700;

A.__a8Clean=function(u){return A.s(u).replace(/#(?:isM3u8|noPre)#/g,'').trim();};
A.__a8ManifestHeaders=function(){
    var host=A.s(getItem('acfun_next_good_host','')||A.staticApiHosts[0]).replace(/\/+$/,'');
    return {
        'User-Agent':'Mozilla/5.0 (Linux; Android 12; SM-G9750 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 Mobile Safari/537.36',
        'Referer':host+'/',
        'Origin':host
    };
};
A.__a8UaOnly=function(){return {'User-Agent':'Mozilla/5.0 (Linux; Android 12; SM-G9750 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 Mobile Safari/537.36'};};
A.__a8Watch=function(id){
    var out={ok:false,path:'',method:'',keys:[],canWatch:'',reason:'',error:''},r=null;
    try{
        r=A.tryApi('video/can/watch',{videoId:A.n(id)},['POST'],{timeout:1900});
        out.ok=true;out.method='POST';
    }catch(e0){
        out.error='POST '+A.s(e0.message||e0);
        try{r=A.tryApi('video/can/watch',{videoId:A.n(id)},['GET'],{timeout:1900});out.ok=true;out.method='GET';}catch(e1){out.error+=' | GET '+A.s(e1.message||e1);}
    }
    if(r&&typeof r==='object'){
        try{out.keys=Object.keys(r).slice(0,40);}catch(e2){}
        out.path=A.mediaPath(r)||A.first(r&&r.path!==undefined?r.path:r);
        out.canWatch=A.s(A.pick(r,['canWatch','watch','allowWatch','status'],'')||'');
        out.reason=A.s(A.pick(r,['reason','reasonType','message','msg','info'],'')||'').slice(0,300);
    }else if(r!==undefined&&r!==null){out.path=A.first(r);}
    A.setDiag('play_watch',JSON.stringify(out));
    return out;
};
A.__a8FetchManifest=function(decode,headers){
    decode=A.__a8Clean(decode);if(!decode)return{};
    try{
        var got=fetch(decode,{timeout:2600,method:'GET',withStatusCode:true,headers:headers||{}}),w=A.safeJson(got),status=w?Number(w.statusCode||w.status||0):0,body=w&&w.body!==undefined?A.s(w.body):'',ct='';
        try{ct=A.s(w.headers&&((w.headers['Content-Type'])||(w.headers['content-type']))||'');}catch(e0){}
        return{ok:status>=200&&status<300&&/^#EXTM3U/m.test(body),status:status,body:body,contentType:ct};
    }catch(e){return{ok:false,error:A.s(e.message||e)};}
};
A.__a8Resources=function(body){
    body=A.s(body);var key='',seg='',m=body.match(/#EXT-X-KEY:[^\r\n]*URI=["']([^"']+)["']/i);if(m)key=m[1];
    var lines=body.split(/\r?\n/);for(var i=0;i<lines.length;i++){var s=A.s(lines[i]).trim();if(s&&!/^#/.test(s)&&/^https?:\/\//i.test(s)){seg=s;break;}}
    return{key:key,segment:seg};
};
A.__a8HeaderProbe=function(url,label,headers){
    var o={label:label,status:0,ct:'',hexLen:0,first:'',error:''};if(!url){o.error='none';return o;}
    try{
        var h=fetch(url,{timeout:1800,method:'GET',withStatusCode:true,headers:headers||{}}),w=A.safeJson(h);if(w){o.status=Number(w.statusCode||w.status||0);try{o.ct=A.s(w.headers&&((w.headers['Content-Type'])||(w.headers['content-type']))||'');}catch(e0){}}
    }catch(e1){o.error='status '+A.s(e1.message||e1);}
    try{var hx=A.s(fetch(url,{timeout:1800,toHex:true,headers:headers||{}})).replace(/\s+/g,'');o.hexLen=hx.length;o.first=hx.substring(0,32);}catch(e2){o.error+=(o.error?' | ':'')+'hex '+A.s(e2.message||e2);}
    return o;
};
A.__a8Cache=function(id,decode,manifestHeaders){
    decode=A.__a8Clean(decode);if(!decode)return'';
    try{
        var fname='acfun_a8_'+A.s(id||'video').replace(/[^a-zA-Z0-9_-]/g,'_')+'_'+A.md5(decode).substring(0,8)+'.m3u8';
        return A.s(cacheM3u8(decode+'#isM3u8#',{headers:manifestHeaders||{},timeout:3500},fname));
    }catch(e){A.setDiag('play_transport','cache ERR '+A.s(e.message||e));return'';}
};
A.__a8PngProxy=function(id,decode,manifestHeaders){
    if(typeof cacheM3u8WithPngProxy!=='function')return'';
    try{
        var fname='acfun_a8_png_'+A.s(id||'video').replace(/[^a-zA-Z0-9_-]/g,'_')+'.m3u8';
        return A.s(cacheM3u8WithPngProxy(A.__a8Clean(decode)+'#isM3u8#',{headers:manifestHeaders||{},timeout:3500},fname));
    }catch(e){return'';}
};

// Current backend may require video/can/watch as a side-effectful entitlement/session handshake.
// Previous rewrite versions skipped it whenever a list/detail seed already existed. Alpha8 always
// performs the handshake first, then uses its returned path when present. Manifest request headers
// are separated from CDN segment headers: cacheM3u8 fetches the API manifest with API headers, but
// the player can consume the resulting local playlist with no API Referer/Origin attached to signed CDN URLs.
A.play=function(id,raw,direct){
    id=A.s(id);var obj=A.safeJson(raw)||raw||{},seed='';
    if(A.mediaLike(direct))seed=A.s(direct);if(!seed)seed=A.mediaPath(obj);
    var watch=A.__a8Watch(id),path=watch.path||seed,used=watch.path?('watch-'+watch.method.toLowerCase()):(seed?'seed':'');
    if(!path){A.setDiag('play',JSON.stringify({id:id,used:used,path:'',watch:watch}));return'toast://未获取到播放地址';}
    var decode=A.__a8Clean(A.decodePlayUrl(path));if(!decode)return'toast://未获取到解码地址';
    var mh=A.__a8ManifestHeaders(),manifest=A.__a8FetchManifest(decode,mh),res=A.__a8Resources(manifest.body||''),none={},ua=A.__a8UaOnly(),probeNone=A.__a8HeaderProbe(res.segment,'none',none),probeUa=A.__a8HeaderProbe(res.segment,'ua',ua),probeApi=A.__a8HeaderProbe(res.segment,'api',mh);
    var keyProbe=A.__a8HeaderProbe(res.key,'key-none',none),playerHeaders={};
    if(probeNone.status>=200&&probeNone.status<300)playerHeaders={};
    else if(probeUa.status>=200&&probeUa.status<300)playerHeaders=ua;
    else if(probeApi.status>=200&&probeApi.status<300)playerHeaders=mh;
    var cached=A.__a8Cache(id,decode,mh),png='';
    var ct=A.s(probeNone.ct||probeUa.ct||probeApi.ct).toLowerCase();if(ct.indexOf('image/png')>=0)png=A.__a8PngProxy(id,decode,mh);
    var out={urls:[],names:[],headers:[]};
    if(png){out.urls.push(png);out.names.push('PNG分片代理');out.headers.push(playerHeaders);}
    if(cached){out.urls.push(cached);out.names.push('签名缓存·自动头');out.headers.push(playerHeaders);if(Object.keys(playerHeaders).length){out.urls.push(cached);out.names.push('签名缓存·无头');out.headers.push({});}}
    out.urls.push(decode+'#isM3u8#');out.names.push('实时解码');out.headers.push(mh);
    A.setDiag('play_transport','manifest='+JSON.stringify({ok:!!manifest.ok,status:manifest.status,ct:manifest.contentType,bytes:A.s(manifest.body).length})+'\nsegment='+JSON.stringify([probeNone,probeUa,probeApi])+'\nkey='+JSON.stringify(keyProbe)+'\nselectedPlayerHeaders='+JSON.stringify(playerHeaders)+'\ncache='+cached+'\npngProxy='+png);
    A.setDiag('play',JSON.stringify({id:id,seed:seed,used:used,path:path,decode:decode,watch:watch,names:out.names,candidates:out.urls,playerHeaders:out.headers}));
    return JSON.stringify(out);
};

// Reader should be a pure canvas. fullTheme removes normal page chrome; immersiveTheme additionally
// removes the remaining status-bar inset/white strip so the first image begins at the physical top.
A.__a8ReaderPage=function(fid,row,idx,count,comicTitle){
    if(!row)return'hiker://empty';
    return A.page('acfun_next_comic_reader',{comics_id:fid,chapter_id:row.id,chapter_num:row.num,chapter_title:row.title,chapter_index:idx,chapter_count:count,comic_title:comicTitle})+'#fullTheme##immersiveTheme#';
};
A.__a7ReaderPage=A.__a8ReaderPage;
A.__a6ReaderPage=A.__a8ReaderPage;
A.comicReader=function(){
    var fid=A.param('comics_id'),cid=A.param('chapter_id'),cnum=A.param('chapter_num'),d=[];try{setPageTitle('');}catch(e0){}
    var obj=A.comicChapter(fid,cid,cnum);if(obj&&obj.canWatch===false){setResult([{title:'当前章节暂不可阅读',desc:A.s(A.pick(obj,['info','message','msg'],'需要权限或购买')),col_type:'long_text',url:'hiker://empty'}]);return;}
    var imgs=A.__a5ComicImageCandidates(obj),shape='keys='+Object.keys(obj||{}).slice(0,80).join(',')+'\ncount='+imgs.length+'\nfirst='+A.s(imgs[0]||'')+'\nraw='+JSON.stringify(obj||{}).slice(0,4500);A.setDiag('comic_payload_shape',shape);
    for(var i=0;i<imgs.length;i++){var pic=A.__a5ComicRender(imgs[i]);if(pic)d.push({title:'',pic_url:pic,img:pic,col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}});}
    if(!d.length)d.push({title:'章节没有可显示图片',col_type:'long_text',url:'hiker://empty'});setResult(d);
};

A.diag=function(){
    setPageTitle('ACFun 资源诊断');var d=[];
    var text='版本：'+A.version+' / Build '+A.buildNumber+'\n运行：'+A.build+'\n接口：'+getItem('acfun_next_good_host','未建立')+'\n令牌：'+(getItem('acfun_next_token','')?'已建立':'无')+'\n图片域：'+getItem('acfun_next_img_domain','未记录')+
    '\n\n图片原始：\n'+A.getDiag('image_raw')+'\n图片解析：\n'+A.getDiag('image_resolved')+'\n图片渲染：\n'+A.getDiag('image_rendered')+'\n图片错误：\n'+A.getDiag('image_error')+
    '\n\n播放：\n'+A.getDiag('play')+'\n\ncan/watch握手：\n'+A.getDiag('play_watch')+'\n\n播放传输探针：\n'+A.getDiag('play_transport')+
    '\n\n漫画分类映射：\n'+A.getDiag('comic_station_shape')+'\n漫画分页线路：\n'+A.getDiag('comic_station_route')+
    '\n\n漫画详情结构：\n'+A.getDiag('comic_detail_shape')+'\n\n漫画章节探针：\n'+A.getDiag('comic_probe')+'\n\n漫画解密结构：\n'+A.getDiag('comic_payload_shape')+'\n漫画图片错误：\n'+A.getDiag('comic_image_error')+
    '\n\n最近接口：\n'+A.getDiag('last_api')+'\n\n请求错误：\n'+A.getDiag('api_error')+'\n\nProvider：\n'+A.getDiag('provider_error')+'\n\n游客：\n'+A.getDiag('traveler_error');
    d.push({title:text,col_type:'long_text',url:'hiker://empty'});d.push({title:'复制诊断',col_type:'text_1',url:'copy://'+text,extra:{lineVisible:false}});setResult(d);
};
})();
