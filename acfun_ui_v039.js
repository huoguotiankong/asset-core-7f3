// ACFun v0.3.9 - unify every card to the proven img-only image pipeline
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.3.9';
ac.imageCardMode='img-only';

// Hiker diagnostics and the known-good same-cipher rule both render decrypted images
// through `img`. Do not provide pic_url simultaneously: some card types prefer it and
// bypass/compete with the image() result.
ac.addVideoCard=function(d,x,col){
    var info=ac.itemInfo(x),desc=[];
    if(info.author)desc.push(info.author);
    if(info.watch)desc.push('▶ '+ac.fmtNum(info.watch));
    if(info.like)desc.push('♥ '+ac.fmtNum(info.like));
    if(info.duration)desc.push(info.duration);
    var pic=ac.image(info.img);
    if(info.img)setItem('acfun_last_cover_raw',String(info.img));
    if(pic)setItem('acfun_last_cover_resolved',String(pic));
    d.push({
        title:info.title,
        desc:desc.join('  '),
        img:pic,
        url:ac.detailUrl(info),
        col_type:col||getItem('acfun_card_style','movie_2'),
        extra:{
            video_id:info.id,video_title:info.title,video_img:info.img,video_uri:info.uri,
            video_data:JSON.stringify(info.raw||{}),pageTitle:info.title,
            longClick:[{title:'加入本地收藏',js:$.toString(function(){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://ACFun远程核心缓存不存在';eval(__s);return ac.favoriteFromParams();})}]
        }
    });
};

ac.detail=function(){
    var d=[],id=String(MY_PARAMS.video_id||getParam('video_id','')||getParam('id',''));
    var fb=ac.safeJson(MY_PARAMS.video_data)||{};
    if(MY_PARAMS.video_title&&!fb.title)fb.title=MY_PARAMS.video_title;
    if(MY_PARAMS.video_img&&!fb.cover)fb.cover=MY_PARAMS.video_img;
    if(MY_PARAMS.video_uri&&!fb.videoUri)fb.videoUri=MY_PARAMS.video_uri;
    var obj=ac.getDetail(id,fb),info=ac.itemInfo(obj);
    if(!info.id)info.id=id;if(!info.title)info.title=MY_PARAMS.video_title||'视频详情';
    var pic=ac.image(info.img);
    if(info.img)setItem('acfun_detail_cover_raw',String(info.img));
    if(pic)setItem('acfun_detail_cover_resolved',String(pic));
    setPageTitle(info.title);
    // setPagePicUrl is not used for the visible card; keep it best-effort only.
    try{setPagePicUrl(pic);}catch(e){}
    var desc=[];
    if(info.author)desc.push('UP：'+info.author);
    if(info.watch)desc.push('播放 '+ac.fmtNum(info.watch));
    if(info.like)desc.push('喜欢 '+ac.fmtNum(info.like));
    d.push({title:info.title,desc:desc.join('  '),img:pic,url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    d.push({title:'▶ 播放',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,raw,title,img,uri){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://ACFun远程核心缓存不存在';eval(__s);var it={id:vid,title:title,img:img,uri:uri,data:raw};ac.addHistory(it);return ac.play(vid,raw,uri);},info.id,JSON.stringify(obj),info.title,info.img,info.uri)});
    d.push({title:ac.isFavorite(info.id)?'★ 已收藏':'☆ 收藏',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,title,img,uri,raw){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://ACFun远程核心缓存不存在';eval(__s);if(ac.isFavorite(vid)){ac.removeFavorite(vid);refreshPage(false);return 'toast://已取消收藏';}var l=ac.favoriteList();l=ac.upsert(l,{id:vid,title:title,img:img,uri:uri,data:raw});ac.saveList('acfun_favs',l,500);refreshPage(false);return 'toast://已收藏';},info.id,info.title,info.img,info.uri,JSON.stringify(obj))});
    d.push({title:'💬 评论',col_type:'text_3',url:'hiker://page/acfun_comments?rule=ACFun&simple=true#noRecordHistory#',extra:{video_id:info.id,video_title:info.title,pageTitle:'评论 · '+info.title}});
    var intro=ac.pick(obj,['description','desc','introduction','content','videoDesc'],'');
    if(intro&&typeof intro!=='object')d.push({title:'<b>简介</b><br>'+String(intro).replace(/\n/g,'<br>'),col_type:'rich_text',url:'hiker://empty'});
    var tags=ac.deepFind(obj,['videoTags','tags','tagList'],0),names=[];
    if(Array.isArray(tags))for(var ti=0;ti<tags.length;ti++){var nm=ac.__tagName?ac.__tagName(tags[ti]):ac.str(ac.pick(tags[ti],['tagName','name','title','label','text','value'],''),'');if(nm&&names.indexOf(nm)<0)names.push(nm);}
    if(names.length)d.push({title:'标签：'+names.join(' · '),col_type:'long_text',url:'hiker://empty'});
    var rel=[];try{rel=ac.arr(ac.api('video/dataCenterMaybeLike',{videoId:info.id,pageNum:1,pageSize:12}));}catch(e2){}
    if(rel.length)d.push({title:'““相关推荐””',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
    rel.forEach(function(x){ac.addVideoCard(d,x,'movie_3');});
    setResult(d);
};

// Keep the already-proven v0.3.8 decoder diagnostic, but expose the actual card strategy.
var __diag=ac.diag;
ac.diag=function(){
    setItem('acfun_card_image_mode','img-only');
    return __diag.apply(ac,arguments);
};
})();
