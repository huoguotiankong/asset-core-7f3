// ACFun v0.2.0 UI/runtime patch
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.2.0';

// 海阔动态卡片优先使用 pic_url；旧核心只写 img，在部分版本会显示灰色占位图。
ac.image=function(u){
    u=String(u||'').trim();
    if(!u)return '';
    if(u.indexOf('//')===0)u='https:'+u;
    var ref=String(ac.frontendBase||'https://acapp.sexbar.site').replace(/\/+$/,'')+'/';
    function withRef(x){
        x=String(x||'').trim();
        if(!x)return '';
        if(/^(data:|hiker:|file:)/i.test(x))return x;
        if(x.indexOf('@Referer=')>=0)return x;
        return x+'@Referer='+ref;
    }
    if(/^https?:\/\//i.test(u))return withRef(u);
    var domains=[];
    var saved=getItem('acfun_img_domain','');
    if(saved)domains.push(saved);
    try{
        var cfg=ac.fetchConfig(false)||{};
        ['imgDomain','imageDomain','cdnDomain','fileDomain','staticDomain'].forEach(function(k){
            var v=ac.deepFind(cfg,[k],0);if(typeof v==='string'&&v)domains.push(v);
        });
    }catch(e){}
    domains=ac.uniq(domains);
    for(var i=0;i<domains.length;i++){
        var d=ac.normalizeBase(domains[i]);
        if(d)return withRef(d+'/'+u.replace(/^\/+/,''));
    }
    // 最后兜底不再错误拼 API host，直接按当前前端域补全。
    return withRef(ref+u.replace(/^\/+/,''));
};

// 更宽松兼容 APP 不同版本的封面字段和嵌套字段。
var __oldItemInfo=ac.itemInfo;
ac.itemInfo=function(x){
    var info=__oldItemInfo.call(ac,x||{}),root=x||{};
    if(!info.img){
        var img=ac.deepFind(root,[
            'videoCover','videoCoverUrl','cover','coverUrl','coverImg','coverImage','coverPicture',
            'horizontalCover','verticalCover','previewImage','previewImg','poster','posterUrl',
            'defaultVideoPoster','thumb','thumbnail','imageUrl','imgUrl','img'
        ],0);
        if(typeof img==='string')info.img=img;
        else if(img&&typeof img==='object'){
            var ii=ac.deepFind(img,['url','src','path','imageUrl','imgUrl'],0);
            if(typeof ii==='string')info.img=ii;
        }
    }
    if(!info.title||info.title==='未命名'){
        var tt=ac.deepFind(root,['videoTitle','title','name'],0);if(tt)info.title=String(tt);
    }
    if(!info.id){var id=ac.deepFind(root,['videoId','id','vid'],0);if(id!==null&&id!==undefined)info.id=String(id);}
    return info;
};

// 首页/搜索/相关推荐统一卡片。
ac.addVideoCard=function(d,x,col){
    var info=ac.itemInfo(x),desc=[];
    if(info.author)desc.push(info.author);
    if(info.watch)desc.push('▶ '+ac.fmtNum(info.watch));
    if(info.like)desc.push('♥ '+ac.fmtNum(info.like));
    if(info.duration)desc.push(info.duration);
    var pic=ac.image(info.img);
    d.push({
        title:info.title,
        desc:desc.join('  '),
        pic_url:pic,
        img:pic,
        url:ac.detailUrl(info),
        col_type:col||getItem('acfun_card_style','movie_2'),
        extra:{
            video_id:info.id,
            video_title:info.title,
            video_img:info.img,
            video_uri:info.uri,
            video_data:JSON.stringify(info.raw||{}),
            pageTitle:info.title,
            longClick:[
                {title:'加入本地收藏',js:$.toString(function(){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://ACFun远程核心缓存不存在';eval(__s);return ac.favoriteFromParams();})},
                {title:'复制标题',js:$.toString(function(){return 'copy://'+(MY_PARAMS.video_title||'');})}
            ]
        }
    });
};

// 二级详情也统一写 pic_url，修复详情页封面空白。
ac.detail=function(){
    var d=[],id=String(MY_PARAMS.video_id||getParam('video_id','')||'');
    var fb={};
    try{fb=ac.safeJson(MY_PARAMS.video_data)||{};}catch(e){}
    if(MY_PARAMS.video_title&&!fb.title)fb.title=MY_PARAMS.video_title;
    if(MY_PARAMS.video_img&&!fb.cover)fb.cover=MY_PARAMS.video_img;
    if(MY_PARAMS.video_uri&&!fb.videoUri)fb.videoUri=MY_PARAMS.video_uri;
    var obj=ac.getDetail(id,fb),info=ac.itemInfo(obj);
    if(!info.id)info.id=id;
    if(!info.title)info.title=MY_PARAMS.video_title||'视频详情';
    var pic=ac.image(info.img);
    setPageTitle(info.title);
    try{setPagePicUrl(pic);}catch(e2){}
    var desc=[];
    if(info.author)desc.push('UP：'+info.author);
    if(info.watch)desc.push('播放 '+ac.fmtNum(info.watch));
    if(info.like)desc.push('喜欢 '+ac.fmtNum(info.like));
    d.push({title:info.title,desc:desc.join('  '),pic_url:pic,img:pic,url:'hiker://empty',col_type:'movie_1_left_pic',extra:{lineVisible:false}});
    d.push({title:'▶ 播放',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,raw,title,img,uri){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://ACFun远程核心缓存不存在';eval(__s);var it={id:vid,title:title,img:img,uri:uri,data:raw};ac.addHistory(it);return ac.play(vid,raw,uri);},info.id,JSON.stringify(obj),info.title,info.img,info.uri)});
    d.push({title:ac.isFavorite(info.id)?'★ 已收藏':'☆ 收藏',col_type:'text_3',url:$('hiker://empty#noLoading#').lazyRule(function(vid,title,img,uri,raw){var __s=getItem('acfun_core_src_v018','');if(!__s)return 'toast://ACFun远程核心缓存不存在';eval(__s);if(ac.isFavorite(vid)){ac.removeFavorite(vid);refreshPage(false);return 'toast://已取消收藏';}var l=ac.favoriteList();l=ac.upsert(l,{id:vid,title:title,img:img,uri:uri,data:raw});ac.saveList('acfun_favs',l,500);refreshPage(false);return 'toast://已收藏';},info.id,info.title,info.img,info.uri,JSON.stringify(obj))});
    d.push({title:'💬 评论',col_type:'text_3',url:'hiker://page/acfun_comments?rule='+encodeURIComponent(MY_RULE.title)+'&simple=true#noRecordHistory#',extra:{video_id:info.id,video_title:info.title,pageTitle:'评论 · '+info.title}});
    var intro=ac.pick(obj,['description','desc','introduction','content','videoDesc'],'');
    if(intro)d.push({title:'<b>简介</b><br>'+String(intro).replace(/\n/g,'<br>'),col_type:'rich_text',url:'hiker://empty'});
    var tags=ac.pick(obj,['videoTags','tags','tagList'],[]);
    if(Array.isArray(tags)&&tags.length)d.push({title:'标签：'+tags.map(function(t){return ac.pick(t,['name','title','tagName'],String(t));}).join(' · '),col_type:'long_text',url:'hiker://empty'});
    var rel=[];
    try{rel=ac.arr(ac.api('video/dataCenterMaybeLike',{videoId:info.id,pageNum:1,pageSize:12}));}catch(e3){}
    if(rel.length)d.push({title:'““相关推荐””',col_type:'text_center_1',url:'hiker://empty',extra:{lineVisible:false}});
    rel.forEach(function(x){ac.addVideoCard(d,x,'movie_3');});
    setResult(d);
};

// 正式版统一标题，彻底结束 Remote Pilot 测试命名。
var __oldHome=ac.home;
ac.home=function(){try{setPageTitle('ACFun');}catch(e){}return __oldHome.apply(ac,arguments);};

var __oldDiag=ac.diag;
ac.diag=function(){setItem('acfun_runtime_version',ac.build);return __oldDiag.apply(ac,arguments);};
})();
