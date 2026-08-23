/** ACFun Next 1.0.0-alpha7 - exact Stable playback transplant + true fullscreen comic reader */
(function(){
if(typeof ACFunNext!=='object')throw new Error('ACFunNext alpha6 base missing');
var A=ACFunNext;
A.version='1.0.0-alpha7';
A.buildNumber=10007;
A.build='2026.08.23-v1.0.0-alpha7';
A.runtimeMode='clean-next+a7-stable-playback-fullscreen-comic';
A.bootUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v086.js?v=8600';
A.bootVer=8600;

// Alpha6 proved cacheM3u8 itself returns the expected Hiker-aware
// file://...m3u8##original-url contract, yet playback still failed.
// The remaining material difference from the verified Stable 0.4.9 path was
// the header set: Alpha6 reused APP signed headers / literal jhg_player while
// Stable uses only UA + API-host Referer/Origin.  Alpha7 ports that contract
// verbatim instead of continuing to invent new playback headers.
A.__a7StablePlaybackHeaders=function(){
    var host=A.s(getItem('acfun_next_good_host','')||A.staticApiHosts[0]).replace(/\/+$/,'');
    return {
        'User-Agent':'Mozilla/5.0 (Linux; Android 12; SM-G9750 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 Mobile Safari/537.36',
        'Referer':host+'/',
        'Origin':host
    };
};
A.__a7CacheM3u8=function(id,decode,headers){
    decode=A.s(decode).replace(/#(?:isM3u8|noPre)#/g,'').trim();
    if(!decode)return'';
    try{
        var fname='acfun_a7_'+A.s(id||'video').replace(/[^a-zA-Z0-9_-]/g,'_')+'_'+A.md5(decode).substring(0,8)+'.m3u8';
        var url=cacheM3u8(decode+'#isM3u8#',{headers:headers,timeout:3500},fname);
        A.setDiag('play_stable_cache','headers='+JSON.stringify(headers)+'\ninput='+decode+'\nreturn='+A.s(url)+'\nfile='+fname);
        return A.s(url);
    }catch(e){A.setDiag('play_stable_cache','ERR '+A.s(e.message||e));return'';}
};
A.play=function(id,raw,direct){
    id=A.s(id);var obj=A.safeJson(raw)||raw||{},path='';
    if(A.mediaLike(direct))path=A.s(direct);
    if(!path)path=A.mediaPath(obj);
    var used=path?'seed':'';
    // Keep the verified Stable behavior for the fallback request: POST can/watch.
    if(!path&&id){
        try{
            var w=A.tryApi('video/can/watch',{videoId:A.n(id)},['POST'],{timeout:1600});
            path=A.mediaPath(w)||A.first(w&&w.path!==undefined?w.path:w);
            if(path)used='watch-post';
        }catch(e0){}
    }
    if(!path){A.setDiag('play',JSON.stringify({id:id,used:used,path:''}));return'toast://未获取到播放地址';}
    var decode=A.s(A.decodePlayUrl(path)).replace(/#(?:isM3u8|noPre)#/g,'').trim();
    if(!decode)return'toast://未获取到解码地址';
    var headers=A.__a7StablePlaybackHeaders(),cached=A.__a7CacheM3u8(id,decode,headers),out={urls:[],names:[],headers:[]};
    if(cached){out.urls.push(cached);out.names.push('Stable兼容缓存');out.headers.push(headers);}
    out.urls.push(decode+'#isM3u8#');out.names.push('Stable兼容实时');out.headers.push(headers);
    A.setDiag('play',JSON.stringify({id:id,used:used,path:path,decode:decode,mode:'stable-0.4.9-header-contract',names:out.names,candidates:out.urls,headers:out.headers}));
    return JSON.stringify(out);
};

// Comic reading is a pure image canvas.  The user explicitly requested no
// chapter/title/navigation information above the first page image.  Hiker's
// official #fullTheme# route flag hides the normal page chrome; the reader
// itself now renders only pic_1_full rows.
A.__a7ReaderPage=function(fid,row,idx,count,comicTitle){
    if(!row)return'hiker://empty';
    return A.page('acfun_next_comic_reader',{
        comics_id:fid,
        chapter_id:row.id,
        chapter_num:row.num,
        chapter_title:row.title,
        chapter_index:idx,
        chapter_count:count,
        comic_title:comicTitle
    })+'#fullTheme#';
};
// Alpha6 comic detail already centralizes chapter links through this helper.
A.__a6ReaderPage=A.__a7ReaderPage;
A.comicReader=function(){
    var fid=A.param('comics_id'),cid=A.param('chapter_id'),cnum=A.param('chapter_num'),d=[];
    try{setPageTitle('');}catch(e0){}
    var obj=A.comicChapter(fid,cid,cnum);
    if(obj&&obj.canWatch===false){
        setResult([{title:'当前章节暂不可阅读',desc:A.s(A.pick(obj,['info','message','msg'],'需要权限或购买')),col_type:'long_text',url:'hiker://empty'}]);
        return;
    }
    var imgs=A.__a5ComicImageCandidates(obj),shape='keys='+Object.keys(obj||{}).slice(0,80).join(',')+'\ncount='+imgs.length+'\nfirst='+A.s(imgs[0]||'')+'\nraw='+JSON.stringify(obj||{}).slice(0,4500);
    A.setDiag('comic_payload_shape',shape);
    for(var i=0;i<imgs.length;i++){
        var pic=A.__a5ComicRender(imgs[i]);
        if(pic)d.push({title:'',pic_url:pic,img:pic,col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}});
    }
    if(!d.length)d.push({title:'章节没有可显示图片',col_type:'long_text',url:'hiker://empty'});
    setResult(d);
};

A.diag=function(){
    setPageTitle('ACFun 资源诊断');var d=[];
    var text='版本：'+A.version+' / Build '+A.buildNumber+'\n运行：'+A.build+'\n接口：'+getItem('acfun_next_good_host','未建立')+'\n令牌：'+(getItem('acfun_next_token','')?'已建立':'无')+'\n图片域：'+getItem('acfun_next_img_domain','未记录')+
    '\n\n图片原始：\n'+A.getDiag('image_raw')+'\n图片解析：\n'+A.getDiag('image_resolved')+'\n图片渲染：\n'+A.getDiag('image_rendered')+'\n图片错误：\n'+A.getDiag('image_error')+
    '\n\n播放：\n'+A.getDiag('play')+'\n\nStable兼容M3U8缓存：\n'+A.getDiag('play_stable_cache')+
    '\n\n漫画分类映射：\n'+A.getDiag('comic_station_shape')+'\n漫画分页线路：\n'+A.getDiag('comic_station_route')+
    '\n\n漫画详情结构：\n'+A.getDiag('comic_detail_shape')+'\n\n漫画章节探针：\n'+A.getDiag('comic_probe')+'\n\n漫画解密结构：\n'+A.getDiag('comic_payload_shape')+'\n漫画图片错误：\n'+A.getDiag('comic_image_error')+
    '\n\n最近接口：\n'+A.getDiag('last_api')+'\n\n请求错误：\n'+A.getDiag('api_error')+'\n\nProvider：\n'+A.getDiag('provider_error')+'\n\n游客：\n'+A.getDiag('traveler_error');
    d.push({title:text,col_type:'long_text',url:'hiker://empty'});
    d.push({title:'复制诊断',col_type:'text_1',url:'copy://'+text,extra:{lineVisible:false}});
    setResult(d);
};
})();
