// ACFun v0.2.1 image/runtime patch
(function(){
if(typeof ac!=='object')throw new Error('ACFun core missing');
ac.build='2026.08.20-v0.2.1';

// 0.2.0 的主要问题：对完整 CDN 图片 URL 强行附加 Referer，部分海阔图片加载器会把它处理成无效地址。
// 0.2.1 原则：完整 URL 原样返回；只有相对路径才补 CDN 域名。
ac.image=function(u){
    u=String(u||'').trim();
    if(!u)return '';
    u=u.replace(/\\\//g,'/');
    if(u.indexOf('//')===0)u='https:'+u;
    if(/^(data:|hiker:|file:)/i.test(u))return u;
    if(/^https?:\/\//i.test(u))return u;

    var domains=[];
    var saved=String(getItem('acfun_img_domain','')||'').trim();
    if(saved)domains.push(saved);
    try{
        var cfg=ac.fetchConfig(false)||{};
        ['imgDomain','imageDomain','cdnDomain','fileDomain','staticDomain','picDomain','coverDomain'].forEach(function(k){
            var v=ac.deepFind(cfg,[k],0);
            if(typeof v==='string'&&v)domains.push(v);
        });
    }catch(e){}
    domains=ac.uniq(domains);
    for(var i=0;i<domains.length;i++){
        var d=String(domains[i]||'').trim();
        if(!d)continue;
        if(d.indexOf('//')===0)d='https:'+d;
        if(!/^https?:\/\//i.test(d))d='https://'+d.replace(/^\/+/, '');
        d=d.replace(/\/+$/,'');
        if(d)return d+'/'+u.replace(/^\/+/, '');
    }
    // 最后才回落到当前前端域名。
    return String(ac.frontendBase||'https://acapp.sexbar.site').replace(/\/+$/,'')+'/'+u.replace(/^\/+/, '');
};

// 继续扩充实际 APP 里常见的图片结构；优先直接字符串，其次从对象中找 url/src/path。
var __v021OldItemInfo=ac.itemInfo;
ac.itemInfo=function(x){
    var info=__v021OldItemInfo.call(ac,x||{}),root=x||{};
    var img=info.img;
    if(!img || typeof img!=='string'){
        img=ac.deepFind(root,[
            'videoCover','videoCoverUrl','videoCoverPath','cover','coverUrl','coverImg','coverImage','coverPicture',
            'horizontalCover','verticalCover','previewImage','previewImg','poster','posterUrl','posterPath',
            'defaultVideoPoster','thumb','thumbUrl','thumbnail','thumbnailUrl','image','imageUrl','imgUrl','img'
        ],0);
    }
    if(img&&typeof img==='object'){
        var iu=ac.deepFind(img,['url','src','path','uri','imageUrl','imgUrl','coverUrl'],0);
        if(typeof iu==='string')img=iu;
    }
    if(typeof img==='string'&&img.trim())info.img=img.trim();
    return info;
};

// 记录真实图片字段与最终 URL，便于以后完全远程修复，不再让用户抓整包日志。
ac.addVideoCard=function(d,x,col){
    var info=ac.itemInfo(x),desc=[];
    if(info.author)desc.push(info.author);
    if(info.watch)desc.push('▶ '+ac.fmtNum(info.watch));
    if(info.like)desc.push('♥ '+ac.fmtNum(info.like));
    if(info.duration)desc.push(info.duration);
    var pic=ac.image(info.img);
    if(!getItem('acfun_last_cover_raw','')&&info.img)setItem('acfun_last_cover_raw',String(info.img));
    if(!getItem('acfun_last_cover_resolved','')&&pic)setItem('acfun_last_cover_resolved',String(pic));
    d.push({
        title:info.title,
        desc:desc.join('  '),
        pic_url:pic,
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

// 成功取得视频后清除早期版本遗留的 /video/list 失败记录。
var __v021VideoList=ac.videoList;
ac.videoList=function(tab,page){
    var list=__v021VideoList.call(ac,tab,page)||[];
    if(list.length){
        clearItem('acfun_last_list_error');
        clearItem('acfun_last_probe_error');
    }
    return list;
};

// 详情页同样确保使用新的图片解析函数。
var __v021Detail=ac.detail;
ac.detail=function(){
    clearItem('acfun_last_cover_raw');
    clearItem('acfun_last_cover_resolved');
    return __v021Detail.apply(ac,arguments);
};

// 诊断页改成当前有效链路为主，不再把 0.1.8 的历史探针当成当前错误。
ac.diag=function(){
    var d=[];setPageTitle('ACFun 接口诊断');
    var token=String(getItem('acfun_token','')||''),did=String(getItem('acfun_device_id','')||'');
    var last=String(getItem('acfun_last_api','')||''),status=String(getItem('acfun_last_status','')||''),code=String(getItem('acfun_last_business_code','')||'');
    d.push(ac.diagBlock('运行状态','版本：'+ac.build+'\n协议：t+s(MD5)+deviceId+User-Mark(acfun)+aut+AES-CBC\nToken：'+(token?'YES':'NO')+'\nDeviceId：'+(did?did.slice(0,10)+'…':'未生成')+'\nHost：'+(getItem('acfun_good_host','')||'未确定')));
    d.push(ac.diagBlock('当前成功链路','Last='+last+'\nHTTP='+status+'  code='+code+'\n\n'+(getItem('acfun_last_attempts','')||'暂无请求记录')));
    var raw=getItem('acfun_last_cover_raw',''),resolved=getItem('acfun_last_cover_resolved','');
    d.push(ac.diagBlock('图片诊断','原始封面：'+(raw||'尚未记录')+'\n\n解析地址：'+(resolved||'尚未记录')+'\n\nimgDomain：'+(getItem('acfun_img_domain','')||'未保存')));
    var te=getItem('acfun_traveler_error','');if(te)d.push(ac.diagBlock('游客登录异常',te));
    var le=getItem('acfun_last_list_error','');if(le)d.push(ac.diagBlock('当前列表错误',le));
    var se=getItem('acfun_last_search_error','');if(se)d.push(ac.diagBlock('当前搜索错误',se));
    d.push({title:'清理诊断缓存并刷新',desc:'只清理历史请求/图片诊断，不删除 Token、收藏、历史和设置。',col_type:'text_1',url:$('hiker://empty#noLoading#').lazyRule(function(){['acfun_last_list_error','acfun_last_probe_error','acfun_last_search_error','acfun_last_detail_error','acfun_last_comment_error','acfun_last_attempts','acfun_last_cover_raw','acfun_last_cover_resolved'].forEach(function(k){clearItem(k);});refreshPage(false);return 'toast://诊断缓存已清理';})});
    d.push({title:'复制精简诊断摘要',col_type:'text_center_1',url:$('hiker://empty#noLoading#').lazyRule(function(){var x='ACFun '+(getItem('acfun_runtime_version','')||'remote')+'\nToken='+(getItem('acfun_token','')?'YES':'NO')+'\nHost='+getItem('acfun_good_host','')+'\nLast='+getItem('acfun_last_api','')+'\nHTTP='+getItem('acfun_last_status','')+' code='+getItem('acfun_last_business_code','')+'\nCoverRaw='+getItem('acfun_last_cover_raw','')+'\nCoverResolved='+getItem('acfun_last_cover_resolved','')+'\nImgDomain='+getItem('acfun_img_domain','')+'\nListErr='+getItem('acfun_last_list_error','')+'\nSearchErr='+getItem('acfun_last_search_error','');return 'copy://'+x;})});
    setItem('acfun_runtime_version',ac.build);
    setResult(d);
};

// 首页固定正式名称，并在本轮开始重新采集一张封面样本。
var __v021Home=ac.home;
ac.home=function(){
    try{setPageTitle('ACFun');}catch(e){}
    if(MY_PAGE==1){clearItem('acfun_last_cover_raw');clearItem('acfun_last_cover_resolved');}
    return __v021Home.apply(ac,arguments);
};

})();
