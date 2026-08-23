/** ACFun Next 1.0.0-alpha6 - Hiker native m3u8 cache + comic reader UX/station mapping */
(function(){
if(typeof ACFunNext!=='object')throw new Error('ACFunNext alpha5 base missing');
var A=ACFunNext;
A.version='1.0.0-alpha6';
A.buildNumber=10006;
A.build='2026.08.23-v1.0.0-alpha6';
A.runtimeMode='clean-next+a6-native-m3u8-comic-ux';
A.bootUrl='https://raw.githubusercontent.com/huoguotiankong/asset-core-7f3/main/apps/video/acfun/bootstrap_test_v085.js?v=8500';
A.bootVer=8500;

A.__a6CleanFlags=function(u){return A.s(u).replace(/#(?:isM3u8|noPre)#/g,'').trim();};
A.__a6PlaybackHeaders=function(){
    var host=A.s(getItem('acfun_next_good_host','')||A.staticApiHosts[0]).replace(/\/+$/,'');
    var h={};try{h=A.__a4SignedHeaders('literal',host)||{};}catch(e){h={};}
    h['User-Agent']='Mozilla/5.0 (Linux; Android 12; SM-G9750 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 Mobile Safari/537.36';
    if(!h.Referer)h.Referer=host+'/';
    if(!h.Origin)h.Origin=host;
    return h;
};
A.__a6CacheM3u8=function(id,decode,headers){
    decode=A.__a6CleanFlags(decode);if(!decode)return'';
    try{
        var fname='acfun_a6_'+A.s(id||'video').replace(/[^a-zA-Z0-9_-]/g,'_')+'_'+A.md5(decode).substring(0,8)+'.m3u8';
        var url=cacheM3u8(decode+'#isM3u8#',{headers:headers||{},timeout:3500},fname);
        A.setDiag('play_native_cache','input='+decode+'\nreturn='+A.s(url)+'\nfile='+fname);
        return A.s(url);
    }catch(e){A.setDiag('play_native_cache','ERR '+A.s(e.message||e));return'';}
};

// Alpha5 proved the decode endpoint returns a valid AES-128 HLS manifest and the key is reachable.
// Use Hiker's own cacheM3u8 contract instead of manually writing a plain file:// playlist.
// cacheM3u8 returns a Hiker-aware file URL (typically file://...m3u8##original-url), which must be preserved verbatim.
A.play=function(id,raw,direct){
    id=A.s(id);var obj=A.safeJson(raw)||raw||{},path='';
    if(A.mediaLike(direct))path=A.s(direct);if(!path)path=A.mediaPath(obj);var used=path?'seed':'';
    if(!path&&id)try{var g=A.tryApi('video/can/watch',{videoId:A.n(id)},['GET'],{timeout:1600});path=A.mediaPath(g)||A.first(g&&g.path!==undefined?g.path:g);if(path)used='watch-get';}catch(e0){}
    if(!path&&id)try{var p=A.tryApi('video/can/watch',{videoId:A.n(id)},['POST'],{timeout:1600});path=A.mediaPath(p)||A.first(p&&p.path!==undefined?p.path:p);if(path)used='watch-post';}catch(e1){}
    if(!path){A.setDiag('play',JSON.stringify({id:id,used:used,path:''}));return'toast://未获取到播放地址';}
    var decode=A.__a6CleanFlags(A.decodePlayUrl(path)),headers=A.__a6PlaybackHeaders(),cached=A.__a6CacheM3u8(id,decode,headers),out={urls:[],names:[],headers:[]};
    if(cached){out.urls.push(cached);out.names.push('海阔缓存播放');out.headers.push(headers);}
    if(decode){out.urls.push(decode+'#isM3u8#');out.names.push('实时HLS');out.headers.push(headers);}
    if(!out.urls.length)return'toast://未生成播放线路';
    A.setDiag('play',JSON.stringify({id:id,used:used,path:path,decode:decode,cacheM3u8:!!cached,names:out.names,candidates:out.urls}));
    return JSON.stringify(out);
};

// Some current comic station rows expose a Mongo-like object id while getStationComicsMore still expects a small numeric stationId.
// Preserve the UI identity but derive bounded API id candidates from explicit numeric fields and station order.
var __a6OldComicStations=A.comicStations;
A.comicStations=function(){
    var rows=__a6OldComicStations.call(A)||[],diag=[];
    for(var i=0;i<rows.length;i++){
        var r=rows[i]||{},raw=r.raw||{},ids=[],seen={};
        function add(v){var s=A.s(v).trim();if(!/^\d+$/.test(s)||seen[s])return;seen[s]=1;ids.push(s);}
        add(raw.stationId);add(raw.comicsStationId);add(raw.stationSort);add(raw.sort);add(raw.sortNum);add(raw.index);add(raw.position);add(raw.type);add(r.id);add(i+1);
        r.apiIds=ids;r.order=i+1;
        if(i<8)diag.push({name:r.name,id:r.id,apiIds:ids,raw:raw});
    }
    if(diag.length)A.setDiag('comic_station_shape',JSON.stringify(diag).slice(0,6000));
    return rows;
};
var __a6OldListFor=A.listFor;
A.listFor=function(section,page){
    if(section!=='comic')return __a6OldListFor.call(A,section,page);
    page=Number(page||1);var size=A.pageSize(),sort=A.sortValue(),stations=A.comicStations(),cs=A.currentNamed(stations,'acfun_next_comic_station',false);if(!cs)return[];
    if(page===1&&cs.raw&&Array.isArray(cs.raw.comicsBaseList)&&cs.raw.comicsBaseList.length)return cs.raw.comicsBaseList.slice(0,size);
    var key='comic|station-a6|'+cs.id+'|'+sort+'|'+page,c=A.cacheRead(key,180e3,3600e3),ids=cs.apiIds&&cs.apiIds.length?cs.apiIds:[A.s(cs.id)],errs=[];
    if(c.fresh&&Array.isArray(c.data)&&c.data.length)return c.data;
    for(var i=0;i<ids.length;i++){
        try{
            var sid=/^\d+$/.test(ids[i])?Number(ids[i]):ids[i],raw=A.tryApi('comics/station/getStationComicsMore',{stationId:sid,page:page,pageNum:page,pageSize:size,sortType:sort},['GET'],{timeout:1800}),list=A.arr(raw);
            if(list.length){A.cacheWrite(key,list);A.setDiag('comic_station_route','name='+cs.name+' uiId='+cs.id+' apiStationId='+ids[i]+' page='+page+' count='+list.length);return list;}
            errs.push(ids[i]+':EMPTY');
        }catch(e){errs.push(ids[i]+':'+A.s(e.message||e));}
    }
    try{
        var f=A.tryApi('comics/base/findList',{page:page,pageNum:page,pageSize:size,sortType:sort,stationName:cs.name,className:cs.name},['GET','POST'],{timeout:1800}),fl=A.arr(f);
        if(fl.length){A.cacheWrite(key,fl);A.setDiag('comic_station_route','fallback findList name='+cs.name+' page='+page+' count='+fl.length);return fl;}
    }catch(e2){errs.push('findList:'+A.s(e2.message||e2));}
    A.setDiag('provider_error','comic station '+cs.name+'\n'+errs.slice(-10).join('\n'));
    return c.hit&&Array.isArray(c.data)?c.data:[];
};

A.__a6ReaderPage=function(fid,row,idx,count,comicTitle){
    if(!row)return'hiker://empty';
    return A.page('acfun_next_comic_reader',{comics_id:fid,chapter_id:row.id,chapter_num:row.num,chapter_title:row.title,chapter_index:idx,chapter_count:count,comic_title:comicTitle});
};
A.comicDetail=function(seed){
    var obj=A.comicObject(seed.id,seed.raw),i=A.comicInfo(obj);if(!i.id)i.id=seed.id;if(!i.title&&seed.title)i.title=seed.title;if(!i.img&&seed.img)i.img=seed.img;setPageTitle(i.title||'漫画详情');var d=[];
    d.push({title:i.title,desc:[i.author,i.desc].join('\n').trim(),pic_url:A.image(i.img),img:A.image(i.img),col_type:'movie_1_vertical_pic_blur',url:'hiker://empty',extra:{gradient:true,lineVisible:false}});
    var favItem={kind:'comic',id:i.id,title:i.title,img:i.img,data:JSON.stringify(obj||{})};d.push({title:A.isFavorite(i.id)?'已收藏':'收藏漫画',col_type:'scroll_button',url:A.favoriteLazy(favItem),extra:{lineVisible:false}});d.push({title:'复制标题',col_type:'scroll_button',url:'copy://'+i.title,extra:{lineVisible:false}});
    var ch=A.__a4ChapterRows(obj);d.push({title:'章节目录 · '+ch.length,col_type:'text_1',url:'hiker://empty',extra:{lineVisible:false}});
    for(var c=0;c<ch.length;c++)d.push({title:ch[c].title,desc:(c+1)+' / '+ch.length,col_type:'text_2',url:A.__a6ReaderPage(i.id,ch[c],c+1,ch.length,i.title),extra:{inheritTitle:false,pageTitle:ch[c].title+' · '+(c+1)+'/'+ch.length,lineVisible:false}});
    if(!ch.length)d.push({title:'暂未解析到章节目录',col_type:'long_text',url:'hiker://empty'});setResult(d);
};
A.__a6ReaderNav=function(d,fid,rows,pos,comicTitle){
    var count=rows.length,current=rows[pos]||{},label=(current.title||'当前章节')+(count?' · '+(pos+1)+'/'+count:'');
    d.push({title:pos>0?'‹ 上一话':'‹ 已是首话',col_type:'scroll_button',url:pos>0?A.__a6ReaderPage(fid,rows[pos-1],pos,count,comicTitle):'hiker://empty',extra:{lineVisible:false}});
    d.push({title:label,col_type:'scroll_button',url:'hiker://empty',extra:{lineVisible:false}});
    d.push({title:pos<count-1?'下一话 ›':'已是末话 ›',col_type:'scroll_button',url:pos<count-1?A.__a6ReaderPage(fid,rows[pos+1],pos+2,count,comicTitle):'hiker://empty',extra:{lineVisible:false}});
};
A.comicReader=function(){
    var fid=A.param('comics_id'),cid=A.param('chapter_id'),cnum=A.param('chapter_num'),title=A.param('chapter_title')||'漫画章节',comicTitle=A.param('comic_title')||'',d=[],detail={},rows=[],pos=-1;
    try{detail=A.comicObject(fid,{});rows=A.__a4ChapterRows(detail);}catch(e0){}
    for(var r=0;r<rows.length;r++)if(A.s(rows[r].id)===A.s(cid)){pos=r;break;}
    if(pos<0){var q=Number(A.param('chapter_index')||0);if(q>0&&q<=rows.length)pos=q-1;}
    var count=rows.length||Number(A.param('chapter_count')||0),idx=pos>=0?pos+1:Number(A.param('chapter_index')||0),pageTitle=title+(count&&idx?' · '+idx+'/'+count:'');setPageTitle(pageTitle);
    if(rows.length&&pos>=0)A.__a6ReaderNav(d,fid,rows,pos,comicTitle||A.s(A.pick(detail,['comicsTitle','comicTitle','title'],'')));
    var obj=A.comicChapter(fid,cid,cnum);if(obj&&obj.canWatch===false){d.push({title:'当前章节暂不可阅读',desc:A.s(A.pick(obj,['info','message','msg'],'需要权限或购买')),col_type:'long_text',url:'hiker://empty'});setResult(d);return;}
    var imgs=A.__a5ComicImageCandidates(obj),shape='keys='+Object.keys(obj||{}).slice(0,80).join(',')+'\ncount='+imgs.length+'\nfirst='+A.s(imgs[0]||'')+'\nraw='+JSON.stringify(obj||{}).slice(0,4500);A.setDiag('comic_payload_shape',shape);
    for(var j=0;j<imgs.length;j++){var pic=A.__a5ComicRender(imgs[j]);if(pic)d.push({title:'',pic_url:pic,img:pic,col_type:'pic_1_full',url:'hiker://empty',extra:{lineVisible:false}});}
    if(!imgs.length)d.push({title:'章节没有可显示图片',col_type:'long_text',url:'hiker://empty'});
    if(rows.length&&pos>=0)A.__a6ReaderNav(d,fid,rows,pos,comicTitle||A.s(A.pick(detail,['comicsTitle','comicTitle','title'],'')));
    setResult(d);
};

A.diag=function(){
    setPageTitle('ACFun 资源诊断');var d=[];
    var text='版本：'+A.version+' / Build '+A.buildNumber+'\n运行：'+A.build+'\n接口：'+getItem('acfun_next_good_host','未建立')+'\n令牌：'+(getItem('acfun_next_token','')?'已建立':'无')+'\n图片域：'+getItem('acfun_next_img_domain','未记录')+
    '\n\n图片原始：\n'+A.getDiag('image_raw')+'\n图片解析：\n'+A.getDiag('image_resolved')+'\n图片渲染：\n'+A.getDiag('image_rendered')+'\n图片错误：\n'+A.getDiag('image_error')+
    '\n\n播放：\n'+A.getDiag('play')+'\n\n海阔M3U8缓存：\n'+A.getDiag('play_native_cache')+'\n\n漫画分类映射：\n'+A.getDiag('comic_station_shape')+'\n漫画分页线路：\n'+A.getDiag('comic_station_route')+
    '\n\n漫画详情结构：\n'+A.getDiag('comic_detail_shape')+'\n\n漫画章节探针：\n'+A.getDiag('comic_probe')+'\n\n漫画解密结构：\n'+A.getDiag('comic_payload_shape')+'\n漫画图片错误：\n'+A.getDiag('comic_image_error')+
    '\n\n最近接口：\n'+A.getDiag('last_api')+'\n\n请求错误：\n'+A.getDiag('api_error')+'\n\nProvider：\n'+A.getDiag('provider_error')+'\n\n游客：\n'+A.getDiag('traveler_error');
    d.push({title:text,col_type:'long_text',url:'hiker://empty'});d.push({title:'复制诊断',col_type:'text_1',url:'copy://'+text,extra:{lineVisible:false}});setResult(d);
};
})();
