/** ACFun Next 1.0.0-alpha5 - signed HLS no-preload + full comic page image adapter */
(function(){
if(typeof ACFunNext!=='object')throw new Error('ACFunNext alpha4 base missing');
var A=ACFunNext;
A.version='1.0.0-alpha5';
A.buildNumber=10005;
A.build='2026.08.23-v1.0.0-alpha5';
A.runtimeMode='clean-next+a5-signed-hls-comic-full-image';
A.bootUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v084.js?v=8400';
A.bootVer=8400;

A.__a5Hls=function(u){
    u=A.s(u).replace(/#(?:isM3u8|noPre)#/g,'').trim();
    return u?u+'#isM3u8##noPre#':'';
};
A.__a5MinimalHeaders=function(){
    var cred={};try{cred=A.__a2Credential(false)||{};}catch(e){}
    var literal=A.s(A.deep(cred,['referer','playerReferer','xReferer'],0)||'').trim();
    var h={'User-Agent':'Mozilla/5.0 (Linux; Android 12; SM-G9750 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 Mobile Safari/537.36'};
    if(literal){h.Referer=literal;h['X-Referer']=literal;}
    return h;
};
A.__a5FetchManifest=function(decode,headers){
    decode=A.s(decode).replace(/#(?:isM3u8|noPre)#/g,'').trim();
    if(!decode)return{};
    try{
        var got=fetch(decode,{timeout:2600,method:'GET',withStatusCode:true,headers:headers||{}}),w=A.safeJson(got),status=w?Number(w.statusCode||w.status||0):0,body=w&&w.body!==undefined?String(w.body||''):'',ct='';
        try{ct=A.s(w.headers&&((w.headers['Content-Type'])||(w.headers['content-type']))||'');}catch(e0){}
        var ok=status>=200&&status<300&&/^#EXTM3U/m.test(body);
        A.setDiag('play_manifest','HTTP '+status+' CT='+ct+' bytes='+body.length+' m3u8='+ok+'\n'+body.split(/\r?\n/).slice(0,22).join('\n').slice(0,3500));
        return{ok:ok,status:status,body:body,contentType:ct};
    }catch(e){A.setDiag('play_manifest','ERR '+A.s(e.message||e));return{};}
};
A.__a5ExtractSignedResources=function(body){
    body=A.s(body);var key='',seg='',m=body.match(/#EXT-X-KEY:[^\r\n]*URI=["']([^"']+)["']/i);if(m)key=m[1];
    var lines=body.split(/\r?\n/);for(var i=0;i<lines.length;i++){var s=A.s(lines[i]).trim();if(s&&!/^#/.test(s)&&/^https?:\/\//i.test(s)){seg=s;break;}}
    return{key:key,segment:seg};
};
A.__a5ProbeBinary=function(url,label){
    url=A.s(url).trim();if(!url)return label+'=none';
    try{
        var hx=fetch(url,{timeout:2200,toHex:true,headers:A.__a5MinimalHeaders()});hx=A.s(hx).replace(/\s+/g,'');
        return label+' ok hexLen='+hx.length+' first='+hx.substring(0,32);
    }catch(e){return label+' ERR '+A.s(e.message||e);}
};
A.__a5WriteManifest=function(id,body){
    if(!body)return'';
    try{
        var uri='hiker://files/cache/acfun_next_live_'+A.s(id).replace(/[^a-zA-Z0-9_-]/g,'_')+'.m3u8';
        writeFile(uri,body);
        var p=getPath(uri);
        A.setDiag('play_local','uri='+uri+'\npath='+p+'\nbytes='+body.length);
        return p;
    }catch(e){A.setDiag('play_local','ERR '+A.s(e.message||e));return'';}
};

// The decode endpoint itself is stable, but its returned key/segment auth_key values are short-lived.
// Hiker preloads media by default; a stable parser URL can therefore cache a stale signed manifest.
// Alpha5 explicitly disables preloading and also offers the exact freshly fetched signed manifest as a local fallback.
A.play=function(id,raw,direct){
    id=A.s(id);var obj=A.safeJson(raw)||raw||{},path='';
    if(A.mediaLike(direct))path=A.s(direct);if(!path)path=A.mediaPath(obj);var used=path?'seed':'';
    if(!path&&id)try{var g=A.tryApi('video/can/watch',{videoId:A.n(id)},['GET'],{timeout:1800});path=A.mediaPath(g)||A.first(g&&g.path!==undefined?g.path:g);if(path)used='watch-get';}catch(e0){}
    if(!path&&id)try{var p=A.tryApi('video/can/watch',{videoId:A.n(id)},['POST'],{timeout:1800});path=A.mediaPath(p)||A.first(p&&p.path!==undefined?p.path:p);if(path)used='watch-post';}catch(e1){}
    if(!path){A.setDiag('play',JSON.stringify({id:id,used:used,path:''}));return'toast://未获取到播放地址';}
    var decode=A.decodePlayUrl(path),full=A.__a4SignedHeaders('literal',getItem('acfun_next_good_host','')||A.staticApiHosts[0]),minimal=A.__a5MinimalHeaders(),manifest=A.__a5FetchManifest(decode,full),out={urls:[],names:[],headers:[]};
    if(decode){
        out.urls.push(A.__a5Hls(decode));out.names.push('实时解码·免预载');out.headers.push(full);
        out.urls.push(A.__a5Hls(decode));out.names.push('实时解码·轻量头');out.headers.push(minimal);
    }
    if(manifest.ok){
        var res=A.__a5ExtractSignedResources(manifest.body),probe=[];probe.push(A.__a5ProbeBinary(res.key,'key'));probe.push(A.__a5ProbeBinary(res.segment,'segment'));A.setDiag('play_resource_probe',probe.join('\n')+'\nkey='+res.key+'\nsegment='+res.segment);
        var local=A.__a5WriteManifest(id,manifest.body);if(local){out.urls.unshift(A.__a5Hls(local));out.names.unshift('本地签名索引');out.headers.unshift({});}
    }else A.setDiag('play_resource_probe','manifest unavailable');
    if(!out.urls.length)return'toast://未生成播放线路';
    A.setDiag('play',JSON.stringify({id:id,used:used,path:path,decode:decode,noPre:true,manifestOk:!!manifest.ok,names:out.names,candidates:out.urls}));
    return JSON.stringify(out);
};

A.__a5ComicImageCandidates=function(root){
    root=root||{};var domain=A.s(A.pick(root,['domain','imgDomain','imageDomain'],'')||''),out=[],seen={},count=0;
    function resolve(s){s=A.s(s).trim();if(!s)return'';if(s.indexOf('//')===0)return'https:'+s;if(/^https?:\/\//i.test(s))return s;var d=domain||getItem('acfun_next_img_domain','');if(d)return A.s(d).replace(/\/+$/,'')+'/'+s.replace(/^\/+/, '');return A.absImage(s,domain);}
    function add(v){var s='';if(typeof v==='string'||typeof v==='number')s=A.s(v);else if(v&&typeof v==='object')s=A.s(A.pick(v,['imgUrl','imageUrl','originalUrl','url','path','src','img','image','pic','picture'],'')||'');s=resolve(s);if(!s||seen[s])return;if(!(/^(?:https?:)?\/\//i.test(s)||/\.(?:png|jpe?g|webp|gif)(?:[?#]|$)/i.test(s)))return;seen[s]=1;out.push(s);}
    function walk(v,key,d){if(v===undefined||v===null||d>9||count>10000)return;if(typeof v==='string'||typeof v==='number'){if(/img|image|pic|picture|url|path|src/i.test(A.s(key)))add(v);return;}if(Array.isArray(v)){for(var i=0;i<v.length;i++){if(typeof v[i]==='string'||typeof v[i]==='number')add(v[i]);else walk(v[i],key,d+1);}return;}if(typeof v!=='object')return;count++;var direct=A.pick(v,['imgUrl','imageUrl','originalUrl','url','path','src','img','image','pic','picture'],'');if(direct)add(direct);for(var k in v)if(!/cover/i.test(k))walk(v[k],k,d+1);}
    var keys=['imgList','imageList','images','pics','pictureList','pageList','pages','contentList','chapterImages'];var seeded=false;
    for(var i=0;i<keys.length;i++)if(Array.isArray(root[keys[i]])){seeded=true;walk(root[keys[i]],keys[i],0);}
    if(!seeded)walk(root,'',0);
    return out;
};
A.__a5ComicRender=function(url){
    var plain=A.s(url).trim();if(!plain)return'';plain=plain.replace(/_480(?=([?#]|$))/,'');
    var cache='hiker://files/cache/acfun_next_comic_full/'+A.md5(plain)+'.img',abs='';
    try{if(fileExist(cache))return getPath(cache);abs=getPath(cache);}catch(e0){}
    var headers={'User-Agent':'Dalvik/2.1.0 (Linux; U; Android 11; M2012K10C Build/RP1A.200720.011)','Referer':''};
    try{
        var ret=$(plain,headers).image(function(cacheAbs){return $.require('acfunImageDecoder?rule=ACFun').image(cacheAbs);},abs);
        return ret;
    }catch(e){A.setDiag('comic_image_error',plain+'\n'+A.s(e.message||e));return plain+'@Referer=';}
};
A.comicReader=function(){
    var fid=A.param('comics_id'),cid=A.param('chapter_id'),cnum=A.param('chapter_num'),title=A.param('chapter_title')||'漫画章节',d=[];setPageTitle(title);
    var obj=A.comicChapter(fid,cid,cnum);if(obj&&obj.canWatch===false){setResult([{title:'当前章节暂不可阅读',desc:A.s(A.pick(obj,['info','message','msg'],'需要权限或购买')),col_type:'long_text',url:'hiker://empty'}]);return;}
    var imgs=A.__a5ComicImageCandidates(obj),shape='keys='+Object.keys(obj||{}).slice(0,80).join(',')+'\ncount='+imgs.length+'\nfirst='+A.s(imgs[0]||'')+'\nraw='+JSON.stringify(obj||{}).slice(0,4500);A.setDiag('comic_payload_shape',shape);
    for(var i=0;i<imgs.length;i++){var pic=A.__a5ComicRender(imgs[i]);if(pic)d.push({title:'',pic_url:pic,img:pic,col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}});}
    if(!d.length)d.push({title:'章节没有可显示图片',desc:'chapterId='+cid+' · 已成功请求 chapterInfo，但当前解密结构/图片字段仍未适配。请复制资源诊断中的漫画解密结构。',col_type:'long_text',url:'hiker://empty'});
    setResult(d);
};

A.diag=function(){
    setPageTitle('ACFun 资源诊断');var d=[];
    var text='版本：'+A.version+' / Build '+A.buildNumber+'\n运行：'+A.build+'\n接口：'+getItem('acfun_next_good_host','未建立')+'\n令牌：'+(getItem('acfun_next_token','')?'已建立':'无')+'\n图片域：'+getItem('acfun_next_img_domain','未记录')+
    '\n\n图片原始：\n'+A.getDiag('image_raw')+'\n图片解析：\n'+A.getDiag('image_resolved')+'\n图片渲染：\n'+A.getDiag('image_rendered')+'\n图片错误：\n'+A.getDiag('image_error')+
    '\n\n播放：\n'+A.getDiag('play')+'\n\n实时签名M3U8：\n'+A.getDiag('play_manifest')+'\n\nKey/分片探针：\n'+A.getDiag('play_resource_probe')+'\n\n本地签名索引：\n'+A.getDiag('play_local')+'\n\n播放凭据：\n'+A.getDiag('player_credential')+
    '\n\n漫画详情结构：\n'+A.getDiag('comic_detail_shape')+'\n\n漫画章节探针：\n'+A.getDiag('comic_probe')+'\n\n漫画解密结构：\n'+A.getDiag('comic_payload_shape')+'\n漫画图片错误：\n'+A.getDiag('comic_image_error')+
    '\n\n最近接口：\n'+A.getDiag('last_api')+'\n\n请求错误：\n'+A.getDiag('api_error')+'\n\nProvider：\n'+A.getDiag('provider_error')+'\n\n游客：\n'+A.getDiag('traveler_error');
    d.push({title:text,col_type:'long_text',url:'hiker://empty'});d.push({title:'复制诊断',col_type:'text_1',url:'copy://'+text,extra:{lineVisible:false}});setResult(d);
};
})();
